// Square API to retrieve an existing order
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
  if (req.method === "GET") {
    try {
      const orderId = req.query.orderId as string

      const response = await client.ordersApi.retrieveOrder(orderId.toString())
      console.log(response.result)
      res.status(200).json(response.result)
    } catch (error) {
      res.status(500).json({ error })
    }
  } else {
    res.status(405).send("Method Not Allowed")
  }
}
