import {
  Program,
  AnchorProvider,
  Idl,
  setProvider,
} from "@project-serum/anchor"
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet"
import { IDL, AnchorMisc } from "../idl/anchor_misc"
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"

// Create a connection to the devnet cluster
export const connection = new Connection(clusterApiUrl("devnet"))

// Create a placeholder wallet to set up AnchorProvider
const wallet = new NodeWallet(Keypair.generate())

// Create an AnchorProvider instance with the connection and mock wallet
const provider = new AnchorProvider(connection, wallet, {})

// Set the provider as the default provider
setProvider(provider)

// Anchor program setup
const programId = new PublicKey("5fqKSPzYfoRZw9c13o7y9yVZxoK5juJNTaSDEJgpKGAs")
export const program = new Program(
  IDL as Idl,
  programId
) as unknown as Program<AnchorMisc>

// PDA for mint auth and program USDC-dev token account
export const [auth] = findProgramAddressSync(
  [Buffer.from("auth")],
  program.programId
)
