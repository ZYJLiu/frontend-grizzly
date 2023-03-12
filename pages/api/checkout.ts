// Create Solana Pay transaction for Square order amount
// Adds anchor-grizzly instructions (loyalty nft, reward tokens)
import { AnchorGrizzly } from "@/idl/anchor_grizzly"
import { Metaplex } from "@metaplex-foundation/js"
import { BN, Program } from "@project-serum/anchor"
import {
  createBurnInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token"
import {
  ComputeBudgetProgram,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js"
import { randomUUID } from "crypto"
import { NextApiRequest, NextApiResponse } from "next"
import { Client, Environment } from "square"
import { connection, program } from "../../utils/anchor-grizzly"
import { redis } from "../../utils/redis"

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox,
})

//@ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString()
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
    label: "GRIZZLY",
    icon: "https://arweave.net/esxvpuoKv02cFpJWgsHGxiu31vqB_UPKR_yaFT_RwoE",
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
    let data = req.body
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
  console.log("receiver", dataJson.receiver)
  console.log("reference", dataJson.reference)
  console.log("amount", dataJson.amount)
  console.log("orderId", dataJson.orderId)

  // Check if active checkout exists
  if (dataJson.receiver === "" || dataJson.reference === "") {
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
      new PublicKey(dataJson.receiver),
      new PublicKey(dataJson.reference),
      Number(dataJson.amount),
      dataJson.orderId,
      dataJson.isChecked
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
  orderId: string,
  isChecked: boolean
): Promise<PostResponse> {
  // Get the merchant PDA
  const [merchantPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("MERCHANT"), receiver.toBuffer()],
    program.programId
  )

  // Fetch the merchant account
  const merchantAccount = await program.account.merchantState.fetch(merchantPDA)

  // Check for NFT discounts
  const { paymentAmount, message, nftDiscountExists, rewardRedeemed } =
    await checkForDiscountNft(
      account,
      amount,
      orderId,
      merchantAccount.loyaltyCollectionMint,
      merchantAccount.loyaltyDiscountBasisPoints,
      merchantAccount.rewardPointsMint,
      isChecked
    )

  // Get the latest blockhash
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash()

  // Create a new transaction
  const transaction = new Transaction({
    blockhash,
    lastValidBlockHeight,
    feePayer: account,
  })

  if (!nftDiscountExists) {
    // Create NFT instruction needs extra compute units
    // This was causing the transaction to fail
    // Unsure why sometimes transaction worked and sometimes it didn't
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 400_000,
    })

    // Get the create NFT instruction
    const createNftInstruction = await getCreateNftInstruction(
      program,
      account,
      receiver,
      merchantPDA,
      merchantAccount
    )

    // Add the instructions to the transaction
    transaction.add(modifyComputeUnits, createNftInstruction)
  }

  // if reward points are redeemed, burn them
  if (rewardRedeemed != 0) {
    const tokenAddress = await getAssociatedTokenAddress(
      merchantAccount.rewardPointsMint,
      account
    )
    const mintData = await getMint(connection, merchantAccount.rewardPointsMint)

    const burnInstruction = createBurnInstruction(
      tokenAddress,
      merchantAccount.rewardPointsMint,
      account,
      rewardRedeemed * 10 ** mintData.decimals
    )

    transaction.add(burnInstruction)
  }

  // USDC-dev mint
  const mint = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr")

  // Get the transfer instruction
  const transferInstruction = await getTransferInstruction(
    program,
    account,
    receiver,
    merchantPDA,
    mint,
    paymentAmount,
    reference,
    merchantAccount.rewardPointsMint
  )

  // Add the transfer instruction to the transaction
  transaction.add(transferInstruction)

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

// TODO: rename
async function checkForDiscountNft(
  account: PublicKey,
  amount: number,
  orderId: string,
  discountCollectionMint: PublicKey,
  loyaltyDiscountBasisPoints: number,
  rewardPointsMint: PublicKey,
  isChecked: boolean
): Promise<{
  paymentAmount: number
  rewardRedeemed: number
  message: string
  nftDiscountExists: any
}> {
  // Create Metaplex instance
  const metaplex = Metaplex.make(connection)

  // Find all NFTs owned by the account
  const nfts = await metaplex.nfts().findAllByOwner({ owner: account })
  let paymentAmount = amount
  let message = `Checkout Amount $${paymentAmount}`

  // if isChecked (checked redeem reward points at checkout)
  // subtract reward points from payment amounts
  let rewardRedeemed = 0
  if (isChecked) {
    try {
      const tokenAddress = await getAssociatedTokenAddress(
        rewardPointsMint,
        account
      )
      const tokenAccount = await getAccount(connection, tokenAddress)
      const mintData = await getMint(connection, rewardPointsMint)
      const tokenBalance =
        Math.floor(
          (Number(tokenAccount.amount) / 10 ** mintData.decimals) * 100
        ) / 100
      console.log(tokenBalance)
      rewardRedeemed = Math.min(paymentAmount, tokenBalance)
      paymentAmount = Math.max(paymentAmount - tokenBalance, 0)
      console.log(rewardRedeemed)
      console.log(paymentAmount)
      message += `, Redeemed ${rewardRedeemed} Reward Tokens`
    } catch (error) {
      console.error(error)
    }
  }

  // Check if NFT with specific collection exists
  const nftDiscountExists = nfts.find(
    (nft) =>
      nft.collection?.address.toString() === discountCollectionMint.toString()
  )

  // If NFT with specific collection exists
  if (nftDiscountExists) {
    console.log("nft found")

    // Apply discount % to payment amount
    const discount = loyaltyDiscountBasisPoints / 10000
    paymentAmount = Math.round(paymentAmount * (1 - discount) * 100) / 100
    console.log("paymentAmount", paymentAmount)

    // Update Square Order with discount
    try {
      console.log("updating square order")
      const location = await client.locationsApi.listLocations()

      if (location.result && location.result.locations) {
        const locationId = location.result.locations[0].id

        await client.ordersApi.updateOrder(orderId, {
          order: {
            locationId: locationId!,
            discounts: [
              {
                name: "NFT Holder",
                percentage: (loyaltyDiscountBasisPoints / 100).toString(),
                scope: "ORDER",
              },
              {
                name: "Reward Token Redeemed",
                type: "FIXED_AMOUNT",
                amountMoney: {
                  amount: BigInt(rewardRedeemed * 100),
                  currency: "USD",
                },
                appliedMoney: {
                  amount: BigInt(rewardRedeemed * 100),
                  currency: "USD",
                },
                scope: "ORDER",
              },
            ],
            version: 1,
          },
          idempotencyKey: randomUUID(),
        })
      }
    } catch (e) {
      console.log(e)
    }
    message += `, Applied ${discount * 100}% NFT Discount`
  }

  if (rewardRedeemed != 0 || nftDiscountExists) {
    message += `, Final Amount $${paymentAmount}`
  }

  return {
    paymentAmount,
    message,
    nftDiscountExists,
    rewardRedeemed,
  }
}

async function getCreateNftInstruction(
  program: Program<AnchorGrizzly>,
  account: PublicKey,
  authority: PublicKey,
  merchantPDA: PublicKey,
  merchantAccount: any
): Promise<TransactionInstruction> {
  // Get the metadata and master edition PDAs of the NFTs
  const metaplex = Metaplex.make(connection)

  // merchant loyalty nft collection mint
  const [customerNftPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("LOYALTY_NFT"), merchantPDA.toBuffer(), account.toBuffer()],
    program.programId
  )

  const [
    metadataPDA,
    masterEditionPDA,
    collectionMetadataPDA,
    collectionMasterEditionPDA,
    tokenAccount,
    nft,
  ] = await Promise.all([
    metaplex.nfts().pdas().metadata({ mint: customerNftPDA }),
    metaplex.nfts().pdas().masterEdition({ mint: customerNftPDA }),
    metaplex
      .nfts()
      .pdas()
      .metadata({ mint: merchantAccount.loyaltyCollectionMint }),
    metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: merchantAccount.loyaltyCollectionMint }),
    getAssociatedTokenAddress(customerNftPDA, account),
    metaplex
      .nfts()
      .findByMint({ mintAddress: merchantAccount.loyaltyCollectionMint }),
  ])

  // Program ID for the token metadata
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  )

  // Create the instruction for minting new NFT to user as part of a collection
  const createNftInstruction = await program.methods
    .createNftInCollection(nft.uri, nft.name, nft.symbol)
    .accounts({
      customer: account,
      authority: authority,
      merchant: merchantPDA,
      loyaltyCollectionMint: merchantAccount.loyaltyCollectionMint,
      collectionMetadataAccount: collectionMetadataPDA,
      collectionMasterEdition: collectionMasterEditionPDA,
      customerNftMint: customerNftPDA,
      metadataAccount: metadataPDA,
      masterEdition: masterEditionPDA,
      tokenAccount: tokenAccount,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    })
    .instruction()

  return createNftInstruction
}

// build anchor-grizzly program transaction instruction
// transfers "USDC" tokens from customer to merchant and mints reward tokens to customer
async function getTransferInstruction(
  program: Program<AnchorGrizzly>,
  account: PublicKey,
  receiver: PublicKey,
  merchantPDA: PublicKey,
  mint: PublicKey,
  paymentAmount: number,
  reference: PublicKey,
  rewardPointsMint: PublicKey
): Promise<TransactionInstruction> {
  // Get the mint information for the specific mint
  const mintData = await getMint(connection, mint)
  // Adjust the payment amount based on the mint's decimals
  const adjustedAmount = paymentAmount * 10 ** mintData.decimals
  // Get the associated token addresses for the sender and receiver accounts
  const [senderTokenAccount, receiverTokenAccount, customerRewardTokenAccount] =
    await Promise.all([
      getAssociatedTokenAddress(mint, account),
      getAssociatedTokenAddress(mint, receiver),
      getAssociatedTokenAddress(rewardPointsMint, account),
    ])

  // Create instruction for token transfer
  const instruction = await program.methods
    .transaction(new BN(adjustedAmount))
    .accounts({
      customer: account,
      authority: receiver,
      merchant: merchantPDA,
      paymentDestination: receiverTokenAccount,
      customerUsdcTokenAccount: senderTokenAccount,
      customerRewardTokenAccount: customerRewardTokenAccount,
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
