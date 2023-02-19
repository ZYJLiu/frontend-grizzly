import { VStack, Image, Table, Tbody, Tr, Td } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { metaplex } from "../utils/metaplex"

type Props = {
  merchantState: any
}

export const LoyaltyNftData: React.FC<Props> = ({ merchantState }) => {
  const [nft, setNft] = useState<any>(null)
  const [data, setData] = useState<Array<{ label: string; value: string }>>([])

  useEffect(() => {
    const fetchNFT = async () => {
      const nft = await metaplex
        .nfts()
        .findByMint({ mintAddress: merchantState.loyaltyCollectionMint })
      setNft(nft)

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
          <Image
            borderRadius="md"
            src={nft.json?.image}
            boxSize="250px"
            objectFit="cover"
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
        </VStack>
      )}
    </>
  )
}
