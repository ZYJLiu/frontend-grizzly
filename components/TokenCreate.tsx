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
  fetchData: (pda: PublicKey) => void
  type: "LOYALTY_NFT" | "REWARD_POINTS"
}

export const TokenCreate: React.FC<Props> = ({
  merchantPDA,
  fetchData,
  type,
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

  const uploadMetadata = useCallback(async () => {
    setLoading(true)
    const data = {
      name: name,
      symbol: symbol,
      image: imageUrl,
    }
    const formData = new FormData()
    formData.append("merchantPDA", merchantPDA.toBase58())
    formData.append("tokenType", type)
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
  }, [name, symbol, imageUrl, metaplex, type])

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

    const [mintPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(type), merchantPDA.toBuffer()],
      program.programId
    )

    const metadataPDA = await metaplex.nfts().pdas().metadata({ mint: mintPDA })

    let tx
    if (type === "LOYALTY_NFT") {
      const masterEditionPDA = await metaplex
        .nfts()
        .pdas()
        .masterEdition({ mint: mintPDA })

      const tokenAccount = await getAssociatedTokenAddress(mintPDA, publicKey)
      tx = await program.methods
        .createCollectionNft(basisPoints, uri, name, symbol)
        .accounts({
          authority: publicKey,
          merchant: merchantPDA,
          loyaltyCollectionMint: mintPDA,
          metadataAccount: metadataPDA,
          masterEdition: masterEditionPDA,
          tokenAccount: tokenAccount,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .transaction()
    } else {
      tx = await program.methods
        .initRewardPoints(basisPoints, uri, name, symbol)
        .accounts({
          authority: publicKey,
          metadataAccount: metadataPDA,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        })
        .transaction()
    }

    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
      units: 250_000,
    })

    try {
      const txSig = await sendTransaction(
        new Transaction().add(modifyComputeUnits, tx),
        connection
      )
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
    } catch (error) {
      console.log(`Error creating token: ${error}`)
      setLoading(false)
    }
  }

  return (
    <>
      <HStack>
        <ImageUploader
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          merchantPDA={merchantPDA}
          type={type}
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
          <FormLabel mt={2}>
            % {type === "LOYALTY_NFT" ? "Discount" : "Reward"} on Transaction
          </FormLabel>
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
      <Button
        onClick={uploadMetadata}
        isLoading={loading}
        loadingText="Awaiting Finalization"
      >
        Create
      </Button>
    </>
  )
}
