// Modal component for updating merchant account data (only updates the discount/reward percentages)
import {
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  useDisclosure,
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import React, { useCallback, useEffect, useState } from "react"
import { connection, program } from "../utils/anchor-grizzly"
import { PublicKey, Transaction } from "@solana/web3.js"

type Type = "LOYALTY_NFT" | "REWARD_POINTS"

type Props = {
  merchantPDA: PublicKey
  fetchData: (pda: PublicKey) => void
  type: Type
}

const DESCRIPTIONS = {
  LOYALTY_NFT: "Update Loyalty NFT Discount Percentage",
  REWARD_POINTS: "Update Reward Points Reward Percentage",
}

export const ModalComponent: React.FC<Props> = ({
  merchantPDA,
  fetchData,
  type,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { publicKey, sendTransaction } = useWallet()
  const [basisPoints, setBasisPoints] = useState(0)
  const [loading, setLoading] = useState(false)
  const description = DESCRIPTIONS[type] as string

  // send transaction to update merchant account data
  const handleClick = useCallback(async () => {
    setLoading(true)
    if (!publicKey) return

    let tx: Transaction | undefined
    if (type === "LOYALTY_NFT") {
      tx = await program.methods
        .updateLoyaltyPoints(basisPoints)
        .accounts({
          authority: publicKey,
        })
        .transaction()
    } else if (type === "REWARD_POINTS") {
      tx = await program.methods
        .updateRewardPoints(basisPoints)
        .accounts({
          authority: publicKey,
        })
        .transaction()
    } else {
      console.error("Invalid type:", type)
      return
    }

    try {
      if (!tx) return
      const txSig = await sendTransaction(tx, connection)
      console.log(txSig)

      alert("Transaction sent, waiting for finalization...")
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash()

      await connection
        .confirmTransaction(
          {
            blockhash,
            lastValidBlockHeight,
            signature: txSig,
          },
          "finalized"
        )
        .then(() => fetchData(merchantPDA))
        .then(() => setLoading(false))
        .catch(() => setLoading(false))

      alert("Update complete, Transaction finalized")
    } catch (error) {
      console.log(`Error creating merchant account: ${error}`)
    }
  }, [basisPoints, publicKey, type, merchantPDA])

  return (
    <>
      <Button onClick={onOpen}>Update</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
              <FormLabel mt={2}>{description}</FormLabel>
              <NumberInput
                onChange={(value) => setBasisPoints(Number(value) * 100)}
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
          </ModalBody>

          <ModalFooter>
            <Button
              onClick={handleClick}
              isLoading={loading}
              colorScheme="blue"
              mr={3}
            >
              Save
            </Button>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
