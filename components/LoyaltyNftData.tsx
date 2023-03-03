import { VStack, Image, Table, Tbody, Tr, Td } from "@chakra-ui/react"
import { fetchData } from "@project-serum/anchor/dist/cjs/utils/registry"
import { PublicKey } from "@solana/web3.js"
import { useEffect, useState } from "react"
import { metaplex } from "../utils/metaplex"
import { ModalComponent } from "./Modal"
import { ImageUploader } from "./ImageUploader"

type Props = {
  merchantPDA: PublicKey
  merchantState: any
  fetchData: (pda: PublicKey) => void
}

export const LoyaltyNftData: React.FC<Props> = ({
  merchantState,
  merchantPDA,
  fetchData,
}) => {
  const [nft, setNft] = useState<any>(null)
  const [data, setData] = useState<Array<{ label: string; value: string }>>([])
  const [imageUrl, setImageUrl] = useState("")
  const type = "LOYALTY_NFT"
  useEffect(() => {
    const fetchNFT = async () => {
      const nft = await metaplex
        .nfts()
        .findByMint({ mintAddress: merchantState.loyaltyCollectionMint })
      setNft(nft)
      setImageUrl(nft.json!.image as string)

      const newData = [
        { label: "Name", value: nft.name },
        { label: "Symbol", value: nft.symbol },
        {
          label: "Basis Points",
          value: merchantState.loyaltyDiscountBasisPoints,
        },
      ]
      setData(newData)
    }
    if (
      merchantState.loyaltyCollectionMint.toString() !==
      "11111111111111111111111111111111"
    )
      fetchNFT()
  }, [merchantState])

  return (
    <>
      {merchantState.loyaltyCollectionMint && nft && (
        <VStack>
          <ImageUploader
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            merchantPDA={merchantPDA}
            type={type}
          />
          {/* <Image
            borderRadius="md"
            src={nft.json?.image}
            boxSize="250px"
            objectFit="cover"
          /> */}
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
