// Square API to create an order
import type { NextApiRequest, NextApiResponse } from "next"
import { randomUUID } from "crypto"
import { redis } from "../../utils/redis"
import { Client, Environment } from "square"

// Initialize the Square client with the access token and sandbox environment
const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
})

//@ts-ignore
// Define the toJSON method for BigInt values
BigInt.prototype.toJSON = function () {
  return this.toString()
}

type OrderDetail = { [key: string]: number }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { quantities } = req.body as OrderDetail
    try {
      const lineItems = Object.entries(quantities).map(
        ([catalogObjectId, quantity]) => ({
          quantity: quantity.toString(),
          catalogObjectId,
        })
      )

      // const test = await redis.get("test")
      // console.log(test)

      // const client = new Client({
      //   accessToken: test!,
      //   environment: Environment.Sandbox,
      // })

      const location = await client.locationsApi.listLocations()
      if (location.result && location.result.locations) {
        const locationId = location.result.locations[0].id

        console.log(locationId)
        const response = await client.ordersApi.createOrder({
          order: {
            locationId: locationId!,
            lineItems,
            state: "OPEN",
            // pricingOptions: {
            //   autoApplyTaxes: true,
            // },
          },
          idempotencyKey: randomUUID(),
        })

        // console.log(response.result)
        res.status(200).json(response.result)
      }
    } catch (error) {
      res.status(500).json({ error })
    }
  } else {
    res.status(405).send("Method Not Allowed")
  }
}

//  const apiUrl = new URL(`http://${req.headers.host}/api/accessToken`)
//  apiUrl.search = new URLSearchParams({
//    path: "get-access-token",
//  }).toString()

//  const test = await axios.get(apiUrl.toString())

//  const token = test.data.test.toString()
//  console.log(token, "createOrder")
//  const client = new Client({
//    accessToken: token,
//    environment: Environment.Sandbox,
//  })
