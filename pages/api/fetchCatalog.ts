// Square API to fetch catalog
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      // const test = await redis.get("test")
      // console.log(test)

      // const client = new Client({
      //   accessToken: test!,
      //   environment: Environment.Sandbox,
      // })

      const response = await client.catalogApi.searchCatalogObjects({
        objectTypes: ["ITEM"],
      })

      res.status(200).json(response.result)
    } catch (error) {
      res.status(500).json({ error })
    }
  } else {
    res.status(405).send("Method Not Allowed")
  }
}
