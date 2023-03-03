import { VStack, Heading, Card, CardBody } from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { LoyaltyNftData } from "./LoyaltyNftData"
import { LoyaltyNftCreate } from "./LoyaltyNftCreate"
import { TokenDataDisplay } from "./TokenDataDisplay"
import { TokenCreate } from "./TokenCreate"

type Props = {
  merchantPDA: PublicKey
  merchantState: any
  fetchData: (pda: PublicKey) => void
}

// display loyalty nft data or create form
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
              // <LoyaltyNftData
              //   merchantState={merchantState}
              //   merchantPDA={merchantPDA}
              //   fetchData={fetchData}
              //   />
              <TokenDataDisplay
                merchantState={merchantState}
                merchantPDA={merchantPDA}
                fetchData={fetchData}
                type="LOYALTY_NFT"
              />
            ) : (
              // <LoyaltyNftCreate
              //   merchantPDA={merchantPDA}
              //   fetchData={fetchData}
              //   />
              <TokenCreate
                merchantPDA={merchantPDA}
                fetchData={fetchData}
                type="LOYALTY_NFT"
              />
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
