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
import { connection, program, usdcDevMint } from "../utils/anchor-grizzly"
import {
  getAssociatedTokenAddress,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata"
import { metaplex } from "../utils/metaplex"
import { ImageUploader } from "./ImageUploader"

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
  console.log("Reward Mint", merchantState.rewardPointsMint.toString())
  const { publicKey, sendTransaction } = useWallet()

  const [imageUrl, setImageUrl] = useState("")
  const [uri, setUri] = useState("")
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [basisPoints, setBasisPoints] = useState(0)
  const [loading, setLoading] = useState(false)
  const uriReady = useRef(false)

  console.log(basisPoints)

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
