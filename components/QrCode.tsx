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
import { useEffect, useRef, useState } from "react"
import Confirmed from "./Confirmed"

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
  const connection = new Connection(clusterApiUrl("devnet"))
  const qrRef = useRef<HTMLDivElement>(null)
  const [reference, setReference] = useState(Keypair.generate().publicKey)
  const { publicKey } = useWallet()

  const [size, setSize] = useState(() =>
    typeof window === "undefined" ? 100 : Math.min(window.outerWidth - 10, 512)
  )

  useEffect(() => {
    const listener = () => setSize(Math.min(window.outerWidth - 10, 512))
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [])

  function updateData(
    publicKey?: PublicKey,
    reference?: PublicKey,
    value?: number,
    orderId?: string
  ) {
    const url = new URL("/api/test", window.location.origin)
    const searchParams = new URLSearchParams({ path: "update-data" })
    searchParams.append("id", id)
    url.search = searchParams.toString()

    const data = {
      receiver: publicKey ? publicKey.toString() : "",
      reference: reference ? reference.toString() : "",
      amount: value ? value.toString() : "",
      orderId: orderId ? orderId : "",
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((json) => console.log(json))
  }

  useEffect(() => {
    if (!publicKey) return
    const url = new URL("/api/test", window.location.origin)
    const searchParams = new URLSearchParams()
    searchParams.append("id", id)
    url.search = searchParams.toString()

    const urlParams = {
      link: new URL(url),
    }
    const solanaUrl = encodeURL(urlParams)
    const qr = createQR(solanaUrl, size, "white")

    if (qrRef.current) {
      qrRef.current.innerHTML = ""
      qr.append(qrRef.current)
    }

    updateData(publicKey, reference, value, orderId)
  }, [size, reference, publicKey, isLoading])

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
      1500
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
