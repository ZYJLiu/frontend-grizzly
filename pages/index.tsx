import { Box, Heading, VStack } from "@chakra-ui/react"
import { Keypair } from "@solana/web3.js"
import { useEffect, useRef, useState } from "react"
import { createQRCode } from "../utils/createQrCode/setup"
import { checkTransaction } from "../utils/checkTransaction"

export default function Home() {
  // QrRef is a reference to the div that will contain the QR code
  const qrRef = useRef<HTMLDivElement>(null)

  // Generate new reference for each transaction
  // Used to identify the transaction
  const [reference, setReference] = useState(Keypair.generate().publicKey)

  // Create QR code
  useEffect(() => {
    createQRCode(qrRef, reference)
  }, [reference])

  // Check transaction status
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
