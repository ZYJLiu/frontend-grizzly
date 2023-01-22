// Generate Solana Pay QR code for checkout and to check the status of the transaction
import { Box, Button, Flex, Spinner, VStack } from "@chakra-ui/react"
import {
  createQR,
  encodeURL,
  findReference,
  FindReferenceError,
  ValidateTransferError,
} from "@solana/pay"
import { useWallet } from "@solana/wallet-adapter-react"
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js"
import { connection } from "../utils/setup"
import { useEffect, useRef, useState } from "react"
import Confirmed from "./Confirmed"
import axios from "axios"

interface Props {
  onClose: () => void
  setConfirmed: (confirmed: boolean) => void
  value: number
  confirmed: boolean
  id: string
  orderId: string
  isLoading: boolean
}

const QrModal = ({
  onClose,
  setConfirmed,
  confirmed,
  value,
  id,
  orderId,
  isLoading,
}: Props) => {
  const qrRef = useRef<HTMLDivElement>(null)
  const [reference, setReference] = useState(Keypair.generate().publicKey)
  const { publicKey } = useWallet()

  // Size Modal
  const [size, setSize] = useState(() =>
    typeof window === "undefined" ? 100 : Math.min(window.outerWidth - 5, 512)
  )

  useEffect(() => {
    const listener = () => setSize(Math.min(window.outerWidth - 5, 512))
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [])

  // Update data for Solana Pay transaction
  function updateData(
    publicKey?: PublicKey,
    reference?: PublicKey,
    value?: number,
    orderId?: string
  ) {
    const url = new URL("/api/checkout", window.location.origin)
    const searchParams = new URLSearchParams({ path: "update-data" })
    searchParams.append("id", id)
    url.search = searchParams.toString()

    const data = {
      receiver: publicKey ? publicKey.toString() : "",
      reference: reference ? reference.toString() : "",
      amount: value ? value.toString() : "",
      orderId: orderId ? orderId : "",
    }

    axios
      .post(url.toString(), data)
      .then((response) => console.log(response))
      .catch((error) => console.log(error))
  }

  // Call function to update data and create QR code
  useEffect(() => {
    if (!publicKey || !orderId) return
    updateData(publicKey, reference, value, orderId)

    const url = new URL("/api/checkout", window.location.origin)
    const searchParams = new URLSearchParams()
    searchParams.append("id", id)
    url.search = searchParams.toString()
    console.log("Solana Pay Terminal Link:", url.toString())

    const urlParams = {
      link: new URL(url),
    }
    const solanaUrl = encodeURL(urlParams)
    const qr = createQR(solanaUrl, size, "white")

    if (qrRef.current) {
      qrRef.current.innerHTML = ""
      qr.append(qrRef.current)
    }
  }, [size, reference, publicKey, orderId])

  // Check transaction status
  async function checkTransaction(interval: NodeJS.Timeout) {
    try {
      const signatureInfo = await findReference(connection, reference, {
        finality: "confirmed",
      })
      setConfirmed(true)
      updateData()
      clearInterval(interval)
      return
    } catch (e) {
      if (e instanceof FindReferenceError) return
      if (e instanceof ValidateTransferError) {
        console.error("Transaction is invalid", e)
        return
      }
      console.error("Unknown error", e)
    }
  }

  useEffect(() => {
    const interval: NodeJS.Timeout = setInterval(
      () => checkTransaction(interval),
      1000
    )

    return () => {
      clearInterval(interval)
      setConfirmed(false)
      updateData()
    }
  }, [reference.toString()])

  return (
    <VStack
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      backgroundColor="white"
      padding="10px"
      rounded="3xl"
      border="2px"
      borderColor="gray.300"
    >
      {isLoading ? (
        <Box
          height={size}
          width={size}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Box>
      ) : (
        <div>
          {confirmed ? (
            <div style={{ width: size }}>
              <Confirmed />
            </div>
          ) : (
            <Flex ref={qrRef} />
          )}
        </div>
      )}
      <Button
        color="gray"
        onClick={() => {
          setConfirmed(false)
          onClose()
        }}
      >
        Close
      </Button>
    </VStack>
  )
}

export default QrModal
