// Add customer transaction to DB
import { prisma } from "@/db/prisma"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { signature, customer, amount } = req.body

  console.log("Signature: ", signature)

  try {
    await prisma.transaction.create({
      data: {
        signature,
        customer,
        amount,
      },
    })
    res.status(200).json({ message: "Transaction added to DB" })
  } catch (error) {
    console.log(error)
  }
}
