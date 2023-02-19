import { VStack, Heading, Card, CardBody } from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { LoyaltyNftData } from "./LoyaltyNftData"
import { LoyaltyNftCreate } from "./LoyaltyNftCreate"

type Props = {
  merchantPDA: PublicKey
  merchantState: any
  fetchData: (pda: PublicKey) => void
}

export const LoyaltyNftCard: React.FC<Props> = ({
  merchantPDA,
  merchantState,
  fetchData,
}) => {
  console.log(merchantState.loyaltyCollectionMint.toString())
  return (
    <VStack justifyContent="center">
      <Card>
        <CardBody>
          <VStack>
            <Heading size="lg" textAlign="center">
              Loyalty NFT Collection
            </Heading>
            {merchantState.loyaltyCollectionMint.toString() !==
            "11111111111111111111111111111111" ? (
              <LoyaltyNftData merchantState={merchantState} />
            ) : (
              <LoyaltyNftCreate
                merchantPDA={merchantPDA}
                merchantState={merchantState}
                fetchData={fetchData}
              />
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
