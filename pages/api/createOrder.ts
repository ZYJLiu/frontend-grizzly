// Square API to create an order
import type { NextApiRequest, NextApiResponse } from "next"
import { randomUUID } from "crypto"
import { client } from "../../utils/square"

//@ts-ignore
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

      const location = await client.locationsApi.listLocations()
      if (location.result && location.result.locations) {
        const locationId = location.result.locations[0].id

        const response = await client.ordersApi.createOrder({
          order: {
            locationId: locationId!,
            lineItems,
            state: "OPEN",
          },
          idempotencyKey: randomUUID(),
        })

        res.status(200).json(response.result)
      }
    } catch (error) {
      res.status(500).json({ error })
    }
  } else {
    res.status(405).send("Method Not Allowed")
  }
}
