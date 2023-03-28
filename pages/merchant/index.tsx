// This is the merchant page. It will create/display the merchant's account (Loyalty NFT and reward points token).
import { Box, Heading, VStack, Text, HStack } from "@chakra-ui/react"

import { program, connection } from "@/utils/anchor-grizzly"
import { useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { useCallback, useEffect, useState } from "react"

import { CreateMerchant } from "@/components/CreateMerchant"
import { TokenCard } from "@/components/TokenCard"
import WalletMultiButton from "@/components/WalletMultiButton"

export default function MerchantPage() {
  const { publicKey, connected } = useWallet()
  const [merchantPDA, setMerchantPDA] = useState<PublicKey | null>(null)
  const [merchantState, setMerchantState] = useState<any>(null)

  // Fetch merchant account
  const fetchData = (pda: PublicKey, isInitialCall = false) => {
    console.log("Fetching merchant state...")
    return new Promise<void>((resolve, reject) => {
      program.account.merchantState
        .fetch(pda)
        .then((account) => {
          console.log(account)
          setMerchantState(account)

          resolve()
        })
        .catch((error) => {
          console.log(`Error fetching merchant state: ${error}`)
          if (isInitialCall) {
            reject()
          } else {
            setTimeout(() => fetchData(pda), 1000) // Retry after 1 second
          }
        })
    })
  }

  // generate merchant PDA and fetch data
  useEffect(() => {
    if (publicKey && program.programId) {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("MERCHANT"), publicKey!.toBuffer()],
        program.programId
      )

      setMerchantPDA(pda)
      fetchData(pda, true)
    } else {
      setMerchantPDA(null)
      setMerchantState(null)
    }
  }, [publicKey, program.programId])

  // Test onAccountChange, not sure why confirmed does not fetch most recent state
  useEffect(() => {
    if (!merchantPDA) return

    const subscriptionId = connection.onAccountChange(
      merchantPDA,
      (accountInfo) => {
        console.log("test", accountInfo)
        fetchData(merchantPDA)
      },
      "confirmed"
    )

    console.log("Starting web socket, subscription ID: ", subscriptionId)

    return () => {
      // Unsubscribe from the account change subscription when the component unmounts
      connection.removeAccountChangeListener(subscriptionId)
    }
  }, [connection, merchantPDA, program])

  return (
    <VStack justifyContent="center">
      <Heading>Merchant Page</Heading>
      {connected && merchantPDA ? (
        merchantState ? (
          <Box>
            <HStack spacing="2vw">
              <TokenCard
                merchantPDA={merchantPDA}
                merchantState={merchantState}
                fetchData={fetchData}
                type="LOYALTY_NFT"
              />
              <TokenCard
                merchantPDA={merchantPDA}
                merchantState={merchantState}
                fetchData={fetchData}
                type="REWARD_POINTS"
              />
            </HStack>
          </Box>
        ) : (
          <CreateMerchant merchantPDA={merchantPDA} fetchData={fetchData} />
        )
      ) : (
        <VStack justifyContent="center">
          <Text>Connect Wallet</Text>
          <WalletMultiButton />
        </VStack>
      )}
    </VStack>
  )
}
