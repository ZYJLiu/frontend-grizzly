// Solana Pay QR Code to airdrop 2 SOL and transfers 100 USDC-dev to the wallet scanning the QR code
// Used to setup mock wallet for testing
import { NextApiRequest, NextApiResponse } from "next"
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js"
import { connection, program, auth } from "../../utils/setup"
import { getAssociatedTokenAddress } from "@solana/spl-token"

// Public key of wallet scanning QR code
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

export type PostError = {
  error: string
}

// API endpoint
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetResponse | PostResponse | PostError>
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
    label: "Store Name",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  })
}

async function post(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | PostError>
) {
  const { account } = req.body as InputData
  if (!account) {
    res.status(400).json({ error: "No account provided" })
    return
  }

  const { reference } = req.query
  if (!reference) {
    res.status(400).json({ error: "No reference provided" })
    return
  }

  try {
    const postResponse = await buildTransaction(
      new PublicKey(account),
      new PublicKey(reference)
    )
    res.status(200).json(postResponse)
    return
  } catch (error) {
    res.status(500).json({ error: "error creating transaction" })
    return
  }
}

async function buildTransaction(
  account: PublicKey,
  reference: PublicKey
): Promise<PostResponse> {
  // Airdrop devnet SOL to fund mobile wallet
  const txsig = await connection.requestAirdrop(account, 2 * LAMPORTS_PER_SOL)

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()

  // Wait for airdrop to confirm
  await connection.confirmTransaction(
    {
      blockhash,
      lastValidBlockHeight,
      signature: txsig,
    },
    "confirmed"
  )

  // Create new transaction
  const transaction = new Transaction({
    feePayer: account,
    blockhash,
    lastValidBlockHeight,
  })

  // USDC-dev mint address
  const mint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr")

  // Get associated token address for account
  const tokenAddress = await getAssociatedTokenAddress(mint, account)

  // Create transfer instruction to fund mobile wallet with USDC-dev
  // Using Anchor to generate instruction
  const instruction = await program.methods
    .usdcDevTransfer()
    .accounts({
      auth: auth,
      fromTokenAccount: auth,
      toTokenAccount: tokenAddress,
      mint: mint,
      payer: account,
    })
    .instruction()

  // Add reference key to instruction
  // Used to identify Solana Pay transaction
  instruction.keys.push({
    pubkey: reference,
    isSigner: false,
    isWritable: false,
  })

  // Add instruction to transaction
  transaction.add(instruction)

  // Serialize transaction
  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false,
  })

  const base64 = serializedTransaction.toString("base64")
  const message = "Airdrop of 2 SOL and 100 USDC-dev"

  return {
    transaction: base64,
    message,
  }
}
