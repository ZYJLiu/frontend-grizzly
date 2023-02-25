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
import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js"
import { useWallet } from "@solana/wallet-adapter-react"
import { connection, program } from "../utils/anchor-grizzly"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { useCallback, useEffect, useRef, useState } from "react"
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata"
import { metaplex } from "../utils/metaplex"
import { ImageUploader } from "./ImageUploader"
import axios from "axios"

type Props = {
  merchantPDA: PublicKey
  merchantState: any
  fetchData: (pda: PublicKey) => void
}

export const LoyaltyNftCreate: React.FC<Props> = ({
  merchantPDA,
  merchantState,
  fetchData,
}) => {
  const { publicKey, sendTransaction } = useWallet()

  const [imageUrl, setImageUrl] = useState("")
  const [uri, setUri] = useState("")
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [basisPoints, setBasisPoints] = useState(0)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const uriReady = useRef(false)

  console.log(basisPoints)

  const uploadMetadata = useCallback(async () => {
    setLoading(true)
    const data = {
      name: name,
      symbol: symbol,
      image: imageUrl,
    }

    const formData = new FormData()
    formData.append("merchantPDA", merchantPDA.toBase58())
    formData.append("tokenType", "LOYALTY_NFT")
    formData.append("fileType", "JSON")
    formData.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    )

    // update loyalty nft metadata to s3 bucket
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

    const [loyaltyCollectionPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("LOYALTY_NFT"), merchantPDA.toBuffer()],
      program.programId
    )

    const loyaltyCollectionMetadataPDA = await metaplex
      .nfts()
      .pdas()
      .metadata({ mint: loyaltyCollectionPDA })

    const loyaltyCollectionMasterEditionPDA = await metaplex
      .nfts()
      .pdas()
      .masterEdition({ mint: loyaltyCollectionPDA })

    const loyaltyCollectionTokenAccount = await getAssociatedTokenAddress(
      loyaltyCollectionPDA,
      publicKey
    )

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 250_000,
    })

    const tx = await program.methods
      .createCollectionNft(basisPoints, uri, name, symbol)
      .accounts({
        authority: publicKey,
        merchant: merchantPDA,
        loyaltyCollectionMint: loyaltyCollectionPDA,
        metadataAccount: loyaltyCollectionMetadataPDA,
        masterEdition: loyaltyCollectionMasterEditionPDA,
        tokenAccount: loyaltyCollectionTokenAccount,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .transaction()

    const transaction = new Transaction().add(modifyComputeUnits, tx)

    try {
      const signature = await sendTransaction(transaction, connection)
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
          type="LOYALTY_NFT"
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
          <FormLabel mt={2}>% Discount on Transaction</FormLabel>
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
