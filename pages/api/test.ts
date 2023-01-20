// Create Solana Pay transaction for Square order
// Checks if wallet holds "discount" SFT, and if so, applies 10% discount and updates Square order
// If wallet does not hold "discount" SFT, add instruction to mint "discount" SFT to wallet
import { NextApiRequest, NextApiResponse } from "next"
import { PublicKey, Transaction } from "@solana/web3.js"
import { getAssociatedTokenAddress, getMint } from "@solana/spl-token"
import { BN } from "@project-serum/anchor"
import { connection, program, auth } from "../../utils/setup"
import { redis } from "../../utils/redis"
import { Metaplex } from "@metaplex-foundation/js"
import { randomUUID } from "crypto"
import { client } from "../../utils/square"

//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
}

// transaction data
let data = {
  receiver: "",
  reference: "",
  amount: "",
  orderId: "",
}

type InputData = {
  account: string
}

type GetResponse = {
  label: string
  icon: string
}

export type PostResponse = {
  transaction: string
  message: string
}

export type UpdatePostResponse = {
  success: boolean
}

export type PostError = {
  error: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<
    GetResponse | PostResponse | PostError | UpdatePostResponse
  >
) {
  if (req.method === "GET") {
    return get(res)
  } else if (req.method === "POST") {
    return await post(req, res)
  } else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}

function get(res: NextApiResponse<GetResponse>) {
  res.status(200).json({
    label: "My Store",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  })
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | PostError | UpdatePostResponse>
) {
  const { id } = req.query as { id: string }
  if (!id) {
    res.status(400).json({ error: "No terminal Id provided" })
    return
  }
  console.log(`terminal ${id}`)

  if (req.query.path === "update-data") {
    data = { ...data, ...req.body }
    console.log(data)
    let dataString = JSON.stringify(data)
    redis.set(id, dataString)
    res.json({ success: true })
  } else {
    const { account } = req.body as InputData
    console.log(req.body)
    if (!account) {
      res.status(400).json({ error: "No account provided" })
      return
    }

    let dataString = await redis.get(id)
    let data = JSON.parse(dataString!)
    console.log(data)

    if (data.receiver === "" || data.reference === "") {
      res.status(200).json({
        transaction: "",
        message: `No active checkout at terminal ${id}`,
      })
      return
    }

    try {
      const postResponse = await postImpl(
        new PublicKey(account),
        new PublicKey(data.receiver),
        new PublicKey(data.reference),
        Number(data.amount),
        data.orderId
      )
      res.status(200).json(postResponse)
      return
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: "error creating transaction" })
      return
    }
  }
}

async function postImpl(
  account: PublicKey,
  receiver: PublicKey,
  reference: PublicKey,
  amount: number,
  orderId: string
): Promise<PostResponse> {
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()

  const transaction = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: account,
  })

  let paymentAmount = amount

  const metaplex = Metaplex.make(connection)
  const nfts = await metaplex.nfts().findAllByOwner({ owner: account })
  const sftMint = new PublicKey("5ThcxUNWHNjM7JtfpeMYDifhrtksSgMXNjJDSkrXvZyv")

  let matchfound = false
  for (let i = 0; i < nfts.length; i++) {
    // @ts-ignore
    if (nfts[i].mintAddress.toString() == sftMint.toString()) {
      console.log("nft found")
      matchfound = true
      paymentAmount *= 0.9

      try {
        const location = await client.locationsApi.listLocations()

        if (location.result && location.result.locations) {
          const locationId = location.result.locations[0].id

          const response = await client.ordersApi.updateOrder(orderId, {
            order: {
              locationId: locationId!,
              discounts: [
                {
                  name: "NFT Holder",
                  percentage: "10",
                  scope: "ORDER",
                },
              ],
              version: 1,
            },
            idempotencyKey: randomUUID(),
          })
        }
      } catch (e) {}
      break
    }
    console.log("nft not found")
  }

  if (!matchfound) {
    const tokenAddress = await getAssociatedTokenAddress(sftMint, account)

    const mintInstruction = await program.methods
      .mint()
      .accounts({
        mint: sftMint,
        tokenAccount: tokenAddress,
        auth: auth,
        receipient: account,
        payer: account,
      })
      .instruction()

    transaction.add(mintInstruction)
  }

  // USDC-dev mint
  const mint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr")
  // adjust for USDC-dev mint decimals (6)
  let adjustedAmount = paymentAmount * 10 ** 6

  const senderTokenAccount = await getAssociatedTokenAddress(mint, account)
  const receiverTokenAccount = await getAssociatedTokenAddress(mint, receiver)

  const instruction = await program.methods
    .tokenTransfer(new BN(adjustedAmount))
    .accounts({
      sender: account,
      receiver: receiver,
      fromTokenAccount: senderTokenAccount,
      toTokenAccount: receiverTokenAccount,
      mint: mint,
    })
    .instruction()

  instruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  })

  // add instruction to transaction
  transaction.add(instruction)

  // Serialize the transaction and convert to base64 to return it
  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false, // account is a missing signature
  })
  const base64 = serializedTransaction.toString("base64")

  const message = matchfound
    ? `Amount $${paymentAmount}, Applied 10% NFT Discount!`
    : `Amount $${paymentAmount}`

  // Return the serialized transaction
  return {
    transaction: base64,
    message,
  }
}
