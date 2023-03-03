import {
  Box,
  Heading,
  ListItem,
  UnorderedList,
  VStack,
  Card,
  CardBody,
  Text,
  HStack,
  Table,
  Tbody,
  Tr,
  Td,
} from "@chakra-ui/react"

import { program } from "@/utils/anchor-grizzly"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useEffect, useState } from "react"

import { CreateMerchant } from "@/components/CreateMerchant"
import { RewardPointsCard } from "@/components/RewardPointsCard"
import { LoyaltyNftCard } from "@/components/LoyaltyNftCard"
import { TokenCard } from "@/components/TokenCard"

export default function MerchantPage() {
  const { publicKey, connected } = useWallet()
  const [merchantPDA, setMerchantPDA] = useState<PublicKey | null>(null)
  const [merchantState, setMerchantState] = useState<any>(null)
  const [data, setData] = useState<Array<{ label: string; value: string }>>([])

  const fetchData = (pda: PublicKey, isInitialCall = false) => {
    return new Promise<void>((resolve, reject) => {
      program.account.merchantState
        .fetch(pda)
        .then((account) => {
          console.log(account)
          setMerchantState(account)

          const newData = [
            {
              label: "Merchant Authority",
              value: account.authority.toString(),
            },
            {
              label: "Payment Destiantion",
              value: account.paymentDestination.toString(),
            },
          ]
          setData(newData)
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
          <Card>
            <CardBody>
              <Box pl="3vw" pb="4">
                <Table variant="simple" size="sm">
                  <Tbody>
                    {data.map(({ label, value }) => (
                      <Tr key={label}>
                        <Td fontWeight="bold">{label}:</Td>
                        <Td>{value}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <HStack spacing="2vw">
                {/* <LoyaltyNftCard
                  merchantPDA={merchantPDA}
                  merchantState={merchantState}
                  fetchData={fetchData}
                />
                <RewardPointsCard
                  merchantPDA={merchantPDA}
                  merchantState={merchantState}
                  fetchData={fetchData}
                /> */}
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
                {/* <RewardPointsData merchantState={merchantState} /> */}
              </HStack>
            </CardBody>
          </Card>
        ) : (
          <CreateMerchant merchantPDA={merchantPDA} fetchData={fetchData} />
        )
      ) : (
        <Text>Connect Wallet</Text>
      )}
    </VStack>
  )
}
