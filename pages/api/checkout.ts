// Create Solana Pay transaction for Square order amount
// Checks if wallet holds "discount" NFT, and if so, applies 10% discount and updates Square order
// If wallet does not hold "discount" NFT, add instruction to mint "discount" NFT to wallet
import { NextApiRequest, NextApiResponse } from "next"
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js"
import {
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token"
import { BN, Instruction, Program } from "@project-serum/anchor"
import { connection, program, auth } from "../../utils/setup"
import { redis } from "../../utils/redis"
import { Metaplex } from "@metaplex-foundation/js"
import { randomUUID } from "crypto"
import { Client, Environment } from "square"
import { AnchorMisc } from "@/idl/anchor_misc"

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
})

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
  // Check the request method
  if (req.method === "GET") {
    // Handle GET request
    return get(res)
  } else if (req.method === "POST") {
    // Handle POST request
    return await post(req, res)
  } else {
    // Return error for other request methods
    return res.status(405).json({ error: "Method not allowed" })
  }
}

// Handles GET request
function get(res: NextApiResponse<GetResponse>) {
  res.status(200).json({
    label: "My Store",
    icon: "https://solana.com/src/img/branding/solanaLogoMark.svg",
  })
}

// Handles POST request
async function post(
  req: NextApiRequest,
  res: NextApiResponse<PostResponse | PostError | UpdatePostResponse>
) {
  // Get the terminal ID from the request query
  const { id } = req.query as { id: string }
  if (!id) {
    // Return an error if no terminal ID is provided
    res.status(400).json({ error: "No terminal Id provided" })
    return
  }
  console.log(`terminal ${id}`)

  // Check if the request is for updating data
  if (req.query.path === "update-data") {
    data = { ...data, ...req.body }
    console.log(data)
    // Update the data in Redis
    await redis.set(id, JSON.stringify(data))
    res.json({ success: true })
    return
  }

  // Get the public key of wallet from the request body
  const { account } = req.body as InputData
  console.log(req.body)
  if (!account) {
    // Return an error if no account is provided
    res.status(400).json({ error: "No account provided" })
    return
  }

  // Get the data from Redis for terminal ID
  let dataString = await redis.get(id)
  let dataJson = JSON.parse(dataString!)
  console.log(dataJson)

  // Check if active checkout exists
  if (data.receiver === "" || data.reference === "") {
    res.status(200).json({
      transaction: "",
      message: `No active checkout at terminal ${id}`,
    })
    return
  }

  try {
    // Build the transaction
    console.time("buildTransaction")
    const postResponse = await buildTransaction(
      new PublicKey(account),
      new PublicKey(data.receiver),
      new PublicKey(data.reference),
      Number(data.amount),
      data.orderId
    )
    console.timeEnd("buildTransaction")
    res.status(200).json(postResponse)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "error creating transaction" })
  }
}

async function buildTransaction(
  account: PublicKey,
  receiver: PublicKey,
  reference: PublicKey,
  amount: number,
  orderId: string
): Promise<PostResponse> {
  // Discount NFT mint address (hardcoded for demo)
  const discountCollectionMint = new PublicKey(
    "GuGuSFXcdjMJyfHxsD5tZkZYiX45jieXHqFrfKoH8TdU"
  )

  // Check for NFT discounts
  const { paymentAmount, message, nftDiscountExists } =
    await checkForDiscountNft(account, amount, orderId, discountCollectionMint)

  // Get the latest blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()

  // Create a new transaction
  const transaction = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: account,
  })

  const nftMint = Keypair.generate()
  if (!nftDiscountExists) {
    // Create NFT instruction needs extra compute units
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 275_000,
    })

    // Get the create NFT instruction
    const createNftInstruction = await getCreateNftInstruction(
      program,
      account,
      nftMint,
      discountCollectionMint,
      auth
    )

    // Add the instructions to the transaction
    transaction.add(modifyComputeUnits, createNftInstruction)
  }

  // USDC-dev mint
  const mint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr")

  // Get the transfer instruction
  const transferInstruction = await getTransferInstruction(
    program,
    account,
    receiver,
    mint,
    paymentAmount,
    reference
  )

  // Add the transfer instruction to the transaction
  transaction.add(transferInstruction)

  if (!nftDiscountExists) {
    // nftMint needs to sign the transaction when creating a new NFT
    transaction.sign(nftMint)
  }

  // Serialize the transaction
  const serializedTransaction = transaction.serialize({
    requireAllSignatures: false, // wallet has to sign
  })
  const base64 = serializedTransaction.toString("base64")

  // Return the serialized transaction
  return {
    transaction: base64,
    message,
  }
}

async function checkForDiscountNft(
  account: PublicKey,
  amount: number,
  orderId: string,
  discountCollectionMint: PublicKey
): Promise<{
  paymentAmount: number
  message: string
  nftDiscountExists: any
}> {
  // Create Metaplex instance
  const metaplex = Metaplex.make(connection)

  // Find all NFTs owned by the account
  const nfts = await metaplex.nfts().findAllByOwner({ owner: account })
  let paymentAmount = amount
  let message = `Amount $${paymentAmount}`

  // Check if NFT with specific collection exists
  const nftDiscountExists = nfts.find(
    (nft) =>
      nft.collection?.address.toString() === discountCollectionMint.toString()
  )

  // If NFT with specific collection exists
  if (nftDiscountExists) {
    console.log("nft found")

    // Apply 10% discount
    paymentAmount = Math.round(paymentAmount * 0.9 * 100) / 100
    console.log("paymentAmount", paymentAmount)

    // Update Square Order with 10% discount
    try {
      const location = await client.locationsApi.listLocations()

      if (location.result && location.result.locations) {
        const locationId = location.result.locations[0].id

        await client.ordersApi.updateOrder(orderId, {
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
    message = `Amount $${paymentAmount}, Applied 10% NFT Discount!`
  }
  return {
    paymentAmount,
    message,
    nftDiscountExists,
  }
}

async function getCreateNftInstruction(
  program: Program<AnchorMisc>,
  account: PublicKey,
  nftMint: Keypair,
  discountCollectionMint: PublicKey,
  auth: PublicKey
): Promise<TransactionInstruction> {
  // Get the metadata and master edition PDAs of the NFT
  const metaplex = Metaplex.make(connection)
  const [
    metadataPDA,
    masterEditionPDA,
    collectionMetadataPDA,
    collectionMasterEditionPDA,
    tokenAccount,
  ] = await Promise.all([
    metaplex.nfts().pdas().metadata({ mint: nftMint.publicKey }),
    metaplex.nfts().pdas().masterEdition({ mint: nftMint.publicKey }),
    metaplex.nfts().pdas().metadata({ mint: discountCollectionMint }),
    metaplex.nfts().pdas().masterEdition({ mint: discountCollectionMint }),
    getAssociatedTokenAddress(nftMint.publicKey, account),
  ])

  // NFT metadata
  const nft = {
    uri: "https://arweave.net/d9FnI04yoJ23Kiqs5qrlu9UKeyV76elBMjhLy-Xh1jk",
    name: "SANDSTORM",
    symbol: "LAMPORTDAO",
  }

  // Program ID for the token metadata
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  )

  // Create the instruction for minting new NFT to the collection
  const createNftInstruction = await program.methods
    .createNftInCollection(nft.uri, nft.name, nft.symbol)
    .accounts({
      mint: nftMint.publicKey,
      metadata: metadataPDA,
      masterEdition: masterEditionPDA,
      collectionMint: discountCollectionMint,
      collectionMetadata: collectionMetadataPDA,
      collectionMasterEdition: collectionMasterEditionPDA,
      auth: auth,
      tokenAccount: tokenAccount,
      user: account,
      payer: account,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .instruction()

  return createNftInstruction
}

async function getTransferInstruction(
  program: Program<AnchorMisc>,
  account: PublicKey,
  receiver: PublicKey,
  mint: PublicKey,
  paymentAmount: number,
  reference: PublicKey
): Promise<TransactionInstruction> {
  // Get the mint information for the specific mint
  const mintData = await getMint(connection, mint)
  // Adjust the payment amount based on the mint's decimals
  const adjustedAmount = paymentAmount * 10 ** mintData.decimals
  // Get the associated token addresses for the sender and receiver accounts
  const [senderTokenAccount, receiverTokenAccount] = await Promise.all([
    getAssociatedTokenAddress(mint, account),
    getAssociatedTokenAddress(mint, receiver),
  ])

  // Create instruction for token transfer
  const instruction = await program.methods
    .tokenTransfer(new BN(adjustedAmount))
    .accounts({
      sender: account, // Sender public key
      receiver: receiver, // Receiver public key
      fromTokenAccount: senderTokenAccount, // Sender associated token address
      toTokenAccount: receiverTokenAccount, // Receiver associated token address
      mint: mint, // Mint address of the token
    })
    .instruction()

  // Add the reference public key to the instruction keys
  instruction.keys.push({
    pubkey: reference, // Public key that is used identify the transaction
    isSigner: false,
    isWritable: false,
  })

  // Return the instruction
  return instruction
}

// // If NFT discount does not exist, mint one
// // Used SFT to test, replaced with NFT, but is slower
// if (!nftDiscountExists) {
//   const mintInstruction = await getMintInstruction(
//     program,
//     account,
//     discountSftMint,
//     auth
//   )
//   transaction.add(mintInstruction)
// }

// async function getMintInstruction(
//   program: Program<AnchorMisc>,
//   account: PublicKey,
//   discountSftMint: PublicKey,
//   auth: PublicKey
// ): Promise<TransactionInstruction> {
//   // Get the associated token address
//   const tokenAddress = await getAssociatedTokenAddress(discountSftMint, account)

//   // Create instruction for minting the token
//   const mintInstruction = await program.methods
//     .mint()
//     .accounts({
//       mint: discountSftMint, // Mint address of the NFT that gives the discount
//       tokenAccount: tokenAddress, // Receipient associated token address
//       auth: auth, // Mint authority PDA
//       receipient: account, // Wallet receiving the NFT
//       payer: account, // Payer
//     })
//     .instruction()
//   return mintInstruction
// }
