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
}

export const RewardPointsData: React.FC<Props> = ({
  merchantState,
  merchantPDA,
  fetchData,
}) => {
  const [nft, setNft] = useState<any>(null)
  const [data, setData] = useState<Array<{ label: string; value: string }>>([])
  const [imageUrl, setImageUrl] = useState("")
  const type = "REWARD_POINTS"
  useEffect(() => {
    const fetchNFT = async () => {
      const nft = await metaplex
        .nfts()
        .findByMint({ mintAddress: merchantState.rewardPointsMint })
      setNft(nft)
      setImageUrl(nft.json!.image as string)

      const newData = [
        { label: "Name", value: nft.name },
        { label: "Symbol", value: nft.symbol },
        { label: "Basis Points", value: merchantState.rewardPointsBasisPoints },
      ]
      setData(newData)
    }
    if (
      merchantState.rewardPointsMint.toString() !==
      "11111111111111111111111111111111"
    )
      fetchNFT()
  }, [merchantState])

  return (
    <>
      {merchantState.rewardPointsMint && nft && (
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
