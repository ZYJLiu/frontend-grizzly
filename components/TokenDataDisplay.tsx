import { VStack, Table, Tbody, Tr, Td } from "@chakra-ui/react"
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
  const [imageUrl, setImageUrl] = useState<string>("")
  const description = type === "LOYALTY_NFT" ? "Discount" : "Reward"

  useEffect(() => {
    const fetchNFT = async () => {
      const mintAddress =
        type === "LOYALTY_NFT"
          ? merchantState.loyaltyCollectionMint
          : merchantState.rewardPointsMint

      if (mintAddress.toString() !== "11111111111111111111111111111111") {
        const nft = await metaplex.nfts().findByMint({ mintAddress })
        setNft(nft)

        if (nft.json?.image !== undefined) {
          setImageUrl(nft.json.image as string)
        }
      }
    }

    fetchNFT()
  }, [merchantState, type])

  const data = nft
    ? [
        { label: "Name", value: nft.name },
        { label: "Symbol", value: nft.symbol },
        {
          label: description,
          value: `${
            type === "LOYALTY_NFT"
              ? merchantState.loyaltyDiscountBasisPoints
              : merchantState.rewardPointsBasisPoints / 100
          }%`,
        },
      ]
    : []

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
