// This component is used to create a new token for a merchant
import { Button, HStack } from "@chakra-ui/react"
import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js"
import { useWallet } from "@solana/wallet-adapter-react"
import { connection, program } from "../utils/anchor-grizzly"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata"
import { metaplex } from "../utils/metaplex"
import { ImageUploader } from "./ImageUploader"
import axios from "axios"
import { TokenForm } from "./TokenForm"

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

  // Form data for uploading token metadata json to s3 bucket
  const formData = useMemo(() => {
    const data = {
      name: name,
      symbol: symbol,
      image: imageUrl,
    }
    const fd = new FormData()
    fd.append("merchantPDA", merchantPDA.toBase58())
    fd.append("tokenType", type)
    fd.append("fileType", "JSON")
    fd.append(
      "data",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    )
    return fd
  }, [imageUrl, merchantPDA, name, symbol, type])

  // Upload token metadata json to s3 bucket
  const uploadMetadata = useCallback(async () => {
    setLoading(true)
    const response = await axios.post("/api/aws?path=json", formData)
    if (response) {
      setUri(response.data.metadataUri)
      setReady(true)
      console.log(response.data)
    } else {
      console.error("Error uploading file")
    }
  }, [formData])

  useEffect(() => {
    if (uriReady.current && uri != null && loading && ready) {
      transaction()
      setReady(false)
    } else {
      uriReady.current = true
      setReady(false)
    }
  }, [uri, ready])

  // Send transaction to create token (using Anchor)
  const transaction = useCallback(async () => {
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

      // alert("Transaction sent, waiting for finalization...")

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash()

      await connection
        .confirmTransaction({
          blockhash,
          lastValidBlockHeight,
          signature: txSig,
        })
        // .then(() => fetchData(merchantPDA))
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
    } catch (error) {
      console.log(`Error creating token: ${error}`)
      setLoading(false)
    }
  }, [publicKey, basisPoints, uri, name, symbol, merchantPDA, type])

  return (
    <>
      <HStack>
        <ImageUploader
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          merchantPDA={merchantPDA}
          type={type}
        />
        <TokenForm
          name={name}
          setName={setName}
          symbol={symbol}
          setSymbol={setSymbol}
          type={type}
          setBasisPoints={setBasisPoints}
        />
      </HStack>
      <Button
        onClick={uploadMetadata}
        isLoading={loading}
        loadingText="Awaiting Confirmation"
      >
        Create
      </Button>
    </>
  )
}
