import { Box, Heading, VStack } from "@chakra-ui/react"
import { Keypair } from "@solana/web3.js"
import { useEffect, useRef, useState } from "react"
import { createQRCode } from "../utils/createQrCode/setup"
import { checkTransaction } from "../utils/checkTransaction"

export default function Home() {
  // Create a ref to the QR code element and a state variable for the reference
  const qrRef = useRef<HTMLDivElement>(null)
  const [reference, setReference] = useState(Keypair.generate().publicKey)

  // Create the QR code when the `reference` changes
  useEffect(() => {
    createQRCode(qrRef, reference)
  }, [reference])

  // Periodically check the transaction status and reset the `reference` state variable once confirmed
  useEffect(() => {
    const interval = setInterval(() => {
      checkTransaction(reference, setReference)
    }, 1500)

    return () => {
      clearInterval(interval)
    }
  }, [reference])

  return (
    <VStack justifyContent="center">
      <Heading>Setup</Heading>
      <Box ref={qrRef} />
    </VStack>
  )
}
