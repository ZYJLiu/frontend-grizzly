import { VStack, Image, Table, Tbody, Tr, Td } from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { useEffect, useState } from "react"
import { metaplex } from "../utils/metaplex"
import { ModalComponent } from "./Modal"
import { ImageUploader } from "./ImageUploader"

type Props = {
  merchantPDA: PublicKey
  merchantState: any
  fetchData: (pda: PublicKey) => void
  type: "LOYALTY_NFT" | "REWARD_POINTS"
}

export const TokenDataDisplay: React.FC<Props> = ({
  merchantState,
  merchantPDA,
  fetchData,
  type,
}) => {
  const [nft, setNft] = useState<any>(null)
  const [data, setData] = useState<
    Array<{ label: string; value: string | number }>
  >([])
  const [imageUrl, setImageUrl] = useState("")

  useEffect(() => {
    const fetchNFT = async () => {
      let mintAddress = ""
      let description = ""
      let percentage = 0
      if (type === "LOYALTY_NFT") {
        mintAddress = merchantState.loyaltyCollectionMint
        description = "Discount"
        percentage = merchantState.loyaltyDiscountBasisPoints / 100
      } else if (type === "REWARD_POINTS") {
        mintAddress = merchantState.rewardPointsMint
        description = "Reward"
        percentage = merchantState.rewardPointsBasisPoints / 100
      }

      if (mintAddress.toString() !== "11111111111111111111111111111111") {
        //@ts-ignore
        const nft = await metaplex.nfts().findByMint({ mintAddress })
        setNft(nft)
        setImageUrl(nft.json!.image as string)

        const newData = [
          { label: "Name", value: nft.name },
          { label: "Symbol", value: nft.symbol },
          { label: description, value: `${percentage}%` },
        ]
        setData(newData)
      }
    }
    fetchNFT()
  }, [merchantState, type])

  return (
    <>
      {nft && (
        <VStack>
          <ImageUploader
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            merchantPDA={merchantPDA}
            type={type}
          />
          <VStack alignItems="start" spacing={1}>
            <Table variant="simple" size="sm">
              <Tbody>
                {data.map(({ label, value }) => (
                  <Tr key={label}>
                    <Td fontWeight="bold">{label}:</Td>
                    <Td>{value}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </VStack>
          <ModalComponent
            merchantPDA={merchantPDA}
            fetchData={fetchData}
            type={type}
          />
        </VStack>
      )}
    </>
  )
}
