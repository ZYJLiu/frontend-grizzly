// This is the merchant page. It will create/display the merchant's account (Loyalty NFT and reward points token).
import { Box, Heading, VStack, Text, HStack } from "@chakra-ui/react"

import { program } from "@/utils/anchor-grizzly"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useCallback, useEffect, useState } from "react"

import { CreateMerchant } from "@/components/CreateMerchant"
import { TokenCard } from "@/components/TokenCard"
import WalletMultiButton from "@/components/WalletMultiButton"

export default function MerchantPage() {
  const { publicKey, connected } = useWallet()
  const [merchantPDA, setMerchantPDA] = useState<PublicKey | null>(null)
  const [merchantState, setMerchantState] = useState<any>(null)

  // Fetch merchant account
  const fetchData = useCallback(
    (pda: PublicKey, isInitialCall = false) => {
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
    },
    [merchantPDA]
  )

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
