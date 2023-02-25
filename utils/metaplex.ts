import {
  Metaplex,
  bundlrStorage,
  keypairIdentity,
} from "@metaplex-foundation/js"
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { connection } from "./anchor-grizzly"

// unused
// temp workaround for bundlr b/c wallet approval takes too many steps
const burner = JSON.parse(
  process.env.NEXT_PUBLIC_TEST_BURNER_KEY ?? ""
) as number[]
const burnerKeypair = Keypair.fromSecretKey(Uint8Array.from(burner))

const airdrop = async () => {
  console.log(burnerKeypair.publicKey)

  console.log(
    (await connection.getBalance(burnerKeypair.publicKey)) / LAMPORTS_PER_SOL
  )
  try {
    await connection.requestAirdrop(burnerKeypair.publicKey, LAMPORTS_PER_SOL)
  } catch (e) {
    console.log("Airdrop failed", e)
  }
}

// airdrop()

export const metaplex = new Metaplex(connection)
  .use(
    bundlrStorage({
      address: "https://devnet.bundlr.network",
      providerUrl: "https://api.devnet.solana.com",
      timeout: 60000,
    })
  )
  .use(keypairIdentity(burnerKeypair))
