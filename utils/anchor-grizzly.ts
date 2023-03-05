// Anchor setup
import {
  Program,
  AnchorProvider,
  Idl,
  setProvider,
} from "@project-serum/anchor"
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet"
import { IDL, AnchorGrizzly } from "../idl/anchor_grizzly"
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"

// Create a connection to the devnet cluster
export const connection = new Connection(clusterApiUrl("devnet"))
// export const connection = new Connection(
//   process.env.NEXT_PUBLIC_DEVNET_ENDPOINT!
// )

// Create a placeholder wallet to set up AnchorProvider
const wallet = new NodeWallet(Keypair.generate())

// Create an AnchorProvider instance with the connection and mock wallet
const provider = new AnchorProvider(connection, wallet, {})

// Set the provider as the default provider
setProvider(provider)

// Anchor program setup
const programId = new PublicKey("4m2iCzvckHmiXf4bV4xHckVAE2tMNLt2GgUziSr7uTiF")
export const program = new Program(
  IDL as Idl,
  programId
) as unknown as Program<AnchorGrizzly>

// PDA for mint auth and program USDC-dev token account
export const [auth] = findProgramAddressSync(
  [Buffer.from("auth")],
  program.programId
)

export const usdcDevMint = new PublicKey(
  "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr"
)
