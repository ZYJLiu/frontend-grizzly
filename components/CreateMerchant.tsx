import { Button, VStack, Text, Spinner } from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { useWallet } from "@solana/wallet-adapter-react"
import { connection, program, usdcDevMint } from "../utils/anchor-grizzly"
import { getAssociatedTokenAddressSync } from "@solana/spl-token"
import { useState } from "react"

type Props = {
  merchantPDA: PublicKey
  fetchData: (pda: PublicKey) => void
}

export const CreateMerchant: React.FC<Props> = ({ merchantPDA, fetchData }) => {
  const { publicKey, sendTransaction } = useWallet()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (!publicKey) return

    // get the associated token address for the merchant
    const paymentDestination = await getAssociatedTokenAddressSync(
      usdcDevMint,
      publicKey
    )

    // create transaction
    const tx = await program.methods
      .initMerchant()
      .accounts({
        authority: publicKey,
        usdcMintPlaceholder: usdcDevMint,
        paymentDestination: paymentDestination,
      })
      .transaction()

    // send transaction
    try {
      const signature = await sendTransaction(tx, connection)
      setLoading(true)

      await connection.confirmTransaction(signature, "finalized")
      fetchData(merchantPDA)
    } catch (error) {
      console.log(`Error creating merchant account: ${error}`)
    }
    setLoading(false)
  }

  return (
    <VStack justifyContent="center">
      <Button
        isLoading={loading}
        loadingText="Awaiting Finialized Transaction"
        onClick={handleClick}
      >
        Create Merchant Account
      </Button>
    </VStack>
  )
}
