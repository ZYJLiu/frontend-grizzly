import {
  Box,
  Heading,
  ListItem,
  UnorderedList,
  VStack,
  Card,
  CardBody,
  Stack,
  StackDivider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  useColorMode,
  Button,
  Text,
  HStack,
  Table,
  Tbody,
  Tr,
  Td,
} from "@chakra-ui/react"
import WalletMultiButton from "../../components/WalletMultiButton"

import { program } from "../../utils/anchor-grizzly"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useEffect, useState } from "react"

import { CreateMerchant } from "../../components/CreateMerchant"
import { RewardPointsCard } from "../../components/RewardPointsCard"
import { LoyaltyNftCard } from "@/components/LoyaltyNftCard"

export default function MerchantPage() {
  const { publicKey, connected } = useWallet()
  const [merchantPDA, setMerchantPDA] = useState<PublicKey | null>(null)
  const [merchantState, setMerchantState] = useState<any>(null)
  const [data, setData] = useState<Array<{ label: string; value: string }>>([])

  const fetchData = async (pda: PublicKey) => {
    try {
      const account = await program.account.merchantState.fetch(pda)
      console.log(account)
      setMerchantState(account)

      const newData = [
        { label: "Merchant Authority", value: account.authority.toString() },
        {
          label: "Payment Destiantion",
          value: account.paymentDestination.toString(),
        },
      ]
      setData(newData)
    } catch (error) {
      console.log(`Error fetching merchant state: ${error}`)
    }
  }
  useEffect(() => {
    if (publicKey && program.programId) {
      const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from("MERCHANT"), publicKey!.toBuffer()],
        program.programId
      )

      setMerchantPDA(pda)
      fetchData(pda)
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
                <LoyaltyNftCard
                  merchantPDA={merchantPDA}
                  merchantState={merchantState}
                  fetchData={fetchData}
                />
                <RewardPointsCard
                  merchantPDA={merchantPDA}
                  merchantState={merchantState}
                  fetchData={fetchData}
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
