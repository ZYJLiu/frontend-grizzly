import { VStack, Heading, Card, CardBody } from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { TokenDataDisplay } from "./TokenDataDisplay"
import { TokenCreate } from "./TokenCreate"

type Props = {
  merchantPDA: PublicKey
  merchantState: any
  fetchData: (pda: PublicKey) => void
  type: "LOYALTY_NFT" | "REWARD_POINTS"
}

export const TokenCard: React.FC<Props> = ({
  merchantPDA,
  merchantState,
  fetchData,
  type,
}) => {
  const isLoyalty = type === "LOYALTY_NFT"

  return (
    <VStack justifyContent="center">
      <Card>
        <CardBody>
          <VStack>
            <Heading size="lg" textAlign="center">
              {isLoyalty ? "Loyalty NFT Collection" : "Reward Points Token"}
            </Heading>
            {merchantState[
              isLoyalty ? "loyaltyCollectionMint" : "rewardPointsMint"
            ].toString() !== "11111111111111111111111111111111" ? (
              <TokenDataDisplay
                merchantState={merchantState}
                merchantPDA={merchantPDA}
                fetchData={fetchData}
                type={type}
              />
            ) : (
              <TokenCreate
                merchantPDA={merchantPDA}
                fetchData={fetchData}
                type={type}
              />
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
