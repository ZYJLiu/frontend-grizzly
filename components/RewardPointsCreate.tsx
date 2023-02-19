import {
  Button,
  VStack,
  Text,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Image,
  Container,
  AspectRatio,
  Box,
  Heading,
  NumberInput,
  NumberInputField,
  HStack,
  Card,
  CardBody,
  Table,
  Tbody,
  Tr,
  Td,
} from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { useWallet } from "@solana/wallet-adapter-react"
import { connection, program, usdcDevMint } from "../utils/anchor-grizzly"
import { getAssociatedTokenAddressSync } from "@solana/spl-token"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Metaplex,
  walletAdapterIdentity,
  bundlrStorage,
  MetaplexFile,
  toMetaplexFileFromBrowser,
  keypairIdentity,
  toMetaplexFileFromJson,
} from "@metaplex-foundation/js"
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata"
import { metaplex } from "../utils/metaplex"
import { ImageUploader } from "./ImageUploader"

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
  const uriReady = useRef(false)

  const uploadMetadata = useCallback(async () => {
    setLoading(true)
    const data = {
      name: name,
      symbol: symbol,
      image: imageUrl,
    }
    const { uri, metadata } = await metaplex.nfts().uploadMetadata(data)
    console.log("metadata:", uri)
    setUri(uri)
  }, [name, symbol, imageUrl, metaplex])

  useEffect(() => {
    if (uriReady.current && uri != null && loading) {
      transaction()
    } else {
      uriReady.current = true
    }
  }, [uri])

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
        <ImageUploader imageUrl={imageUrl} setImageUrl={setImageUrl} />
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
          <FormLabel mt={2}>Basis Points</FormLabel>
          <NumberInput
            value={basisPoints}
            onChange={(value) => setBasisPoints(Number(value))}
          >
            <NumberInputField placeholder="Enter Basis Points" />
          </NumberInput>
        </FormControl>
      </HStack>

      <Button onClick={uploadMetadata} isLoading={loading}>
        Create
      </Button>
    </>
  )
}
