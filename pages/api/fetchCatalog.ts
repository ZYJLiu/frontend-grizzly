// Square API to fetch catalog
import type { NextApiRequest, NextApiResponse } from "next"
import { Client, Environment } from "square"

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
})

//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
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
