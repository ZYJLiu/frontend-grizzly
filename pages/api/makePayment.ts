// Square API to make payment for an order
import type { NextApiRequest, NextApiResponse } from "next"
import { randomUUID } from "crypto"
import { client } from "../../utils/square"

type RequestBody = {
  orderDetail: {
    netAmountDueAmount: string
    orderId: string
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const {
        orderDetail: { netAmountDueAmount, orderId },
      } = req.body as RequestBody

      const response = await client.paymentsApi.createPayment({
        sourceId: "EXTERNAL",
        idempotencyKey: randomUUID(),
        amountMoney: {
          //@ts-ignore
          amount: netAmountDueAmount,
          currency: "USD",
        },
        orderId: orderId,
        externalDetails: {
          type: "CRYPTO",
          source: "USDC",
          sourceFeeMoney: {
            //@ts-ignore
            amount: netAmountDueAmount,
            currency: "USD",
          },
        },
      })
      res.status(200).json(response.result)
    } catch (error) {
      res.status(500).json({ error })
    }
  } else {
    res.status(405).send("Method Not Allowed")
  }
}
