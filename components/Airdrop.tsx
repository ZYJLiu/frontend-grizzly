// This component is used to airdrop reward points to customers on transaction-history page.
import { LinkIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  Card,
  CardBody,
  FormControl,
  Heading,
  HStack,
  Link,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  VStack,
} from "@chakra-ui/react"
import * as anchor from "@project-serum/anchor"
import { getAssociatedTokenAddressSync, getMint, Mint } from "@solana/spl-token"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction } from "@solana/web3.js"
import { useEffect, useState } from "react"
import { connection, program } from "../utils/anchor-grizzly"

type Props = {
  customers: string[]
}

export const Airdrop: React.FC<Props> = ({ customers }) => {
  console.log(customers)
  const { publicKey, sendTransaction } = useWallet()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(0)
  const [txSig, setTxSig] = useState<string | null>(null)

  const [merchantPDA, setMerchantPDA] = useState<PublicKey | null>(null)
  const [rewardPointsPDA, setRewardPointsPDA] = useState<PublicKey | null>(null)
  const [mintData, setMintData] = useState<Mint | null>(null)

  useEffect(() => {
    if (!publicKey) return

    const [merchantPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("MERCHANT"), publicKey.toBuffer()],
      program.programId
    )
    setMerchantPDA(merchantPDA)

    const [rewardPointsPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("REWARD_POINTS"), merchantPDA.toBuffer()],
      program.programId
    )
    setRewardPointsPDA(rewardPointsPDA)

    async function getMintData() {
      const mintData = await getMint(connection, rewardPointsPDA)
      setMintData(mintData)
    }
    getMintData()
  }, [publicKey])

  // Send transaction to airdrop reward points to selected customers
  async function handleClick() {
    if (!publicKey || customers.length === 0) {
      alert("Select at least one customer to airdrop.")
      return
    }
    setLoading(true)

    const instructions = await Promise.all(
      customers.map(async (customer) => {
        const customerRewardTokenAccount = await getAssociatedTokenAddressSync(
          rewardPointsPDA!,
          new PublicKey(customer)
        )

        return program.methods
          .mintRewardPoints(new anchor.BN(amount * 10 ** mintData!.decimals))
          .accounts({
            authority: publicKey,
            customer: new PublicKey(customer),
            merchant: merchantPDA!,
            customerRewardTokenAccount: customerRewardTokenAccount,
          })
          .instruction()
      })
    )

    // send transaction
    const tx = new Transaction().add(...instructions)
    try {
      const txSig = await sendTransaction(tx, connection)
      console.log(txSig)

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash()

      await connection
        .confirmTransaction(
          {
            blockhash,
            lastValidBlockHeight,
            signature: txSig,
          },
          "confirmed"
        )
        .then(() => setTxSig(txSig))
    } catch (error) {
      console.log(`${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <VStack justifyContent="center" paddingBottom={5}>
      <Card>
        <CardBody>
          <Heading size="md" textAlign="center" marginBottom={0}>
            Select Customers to Airdrop
          </Heading>
          <HStack justifyContent="space-between" alignItems="flex-end">
            <FormControl mt={4} maxW="100px">
              <NumberInput
                onChange={(value) => setAmount(Number(value))}
                defaultValue={0}
                min={0}
                max={100}
                precision={2}
                step={0.25}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <Button
              isLoading={loading}
              loadingText="Awaiting Confirmation"
              onClick={handleClick}
            >
              Airdrop Amount
            </Button>
            {txSig && (
              <Box paddingBottom="2.5">
                <Link
                  href={`https://solscan.io/tx/${txSig}?cluster=devnet`}
                  isExternal
                  _hover={{ color: "blue.600" }}
                >
                  <LinkIcon />
                </Link>
              </Box>
            )}
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
