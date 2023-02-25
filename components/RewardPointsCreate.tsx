import {
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  HStack,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { useWallet } from "@solana/wallet-adapter-react"
import { connection, program } from "../utils/anchor-grizzly"
import { useCallback, useEffect, useState, useRef } from "react"
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata"
import { metaplex } from "../utils/metaplex"
import { ImageUploader } from "./ImageUploader"
import axios from "axios"

type Props = {
  merchantPDA: PublicKey
  merchantState: any
  fetchData: (pda: PublicKey) => void
}

export const RewardPointsCreate: React.FC<Props> = ({
  merchantPDA,
  merchantState,
  fetchData,
}) => {
  console.log("Reward Mint", merchantState.rewardPointsMint.toString())
  const { publicKey, sendTransaction } = useWallet()

  const [imageUrl, setImageUrl] = useState("")
  const [uri, setUri] = useState("")
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [basisPoints, setBasisPoints] = useState(0)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const uriReady = useRef(false)

  const uploadMetadata = useCallback(async () => {
    setLoading(true)
    const data = {
      name: name,
      symbol: symbol,
      image: imageUrl,
    }
    const formData = new FormData()
    formData.append("merchantPDA", merchantPDA.toBase58())
    formData.append("tokenType", "REWARD_POINTS")
    formData.append("fileType", "JSON")
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    )

    const response = await axios.post("/api/aws?path=json", formData)

    if (response) {
      console.log("File uploaded successfully")
      console.log(response.data)
      setUri(response.data.metadataUri)
      setReady(true)
    } else {
      console.error("Error uploading file")
    }
  }, [name, symbol, imageUrl, metaplex])

  useEffect(() => {
    if (uriReady.current && uri != null && loading && ready) {
      transaction()
      setReady(false)
    } else {
      uriReady.current = true
      setReady(false)
    }
  }, [uri, ready])

  async function transaction() {
    if (!publicKey) return

    const [rewardPointsPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("REWARD_POINTS"), merchantPDA.toBuffer()],
      program.programId
    )

    const rewardPointsMetadataPDA = await metaplex
      .nfts()
      .pdas()
      .metadata({ mint: rewardPointsPDA })

    const tx = await program.methods
      .initRewardPoints(basisPoints, uri, name, symbol)
      .accounts({
        authority: publicKey,
        metadataAccount: rewardPointsMetadataPDA,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .transaction()

    try {
      const signature = await sendTransaction(tx, connection)
      console.log(signature)

      alert("Transaction sent, waiting for finalization...")

      await connection.confirmTransaction(signature, "finalized")
    } catch (error) {
      console.log(`Error creating merchant account: ${error}`)
    }
    setLoading(false)
    fetchData(merchantPDA)
  }

  return (
    <>
      <HStack>
        <ImageUploader
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          merchantPDA={merchantPDA}
          type="REWARD_POINTS"
        />
        <FormControl>
          <FormLabel mt={2}>Name</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
          />
          <FormLabel mt={2}>Symbol</FormLabel>
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Enter symbol"
          />
          <FormLabel mt={2}>% Reward on Transaction</FormLabel>
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
      </HStack>

      <Button onClick={uploadMetadata} isLoading={loading}>
        Create
      </Button>
    </>
  )
}
