// Card that displays token data or token creation form
import { useCallback } from "react"
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
  const mintKey = isLoyalty ? "loyaltyCollectionMint" : "rewardPointsMint"
  const tokenExists =
    merchantState[mintKey].toString() !== "11111111111111111111111111111111"

  const renderContent = useCallback(() => {
    if (tokenExists) {
      return (
        <TokenDataDisplay
          merchantState={merchantState}
          merchantPDA={merchantPDA}
          fetchData={fetchData}
          type={type}
        />
      )
    } else {
      return (
        <TokenCreate
          merchantPDA={merchantPDA}
          fetchData={fetchData}
          type={type}
        />
      )
    }
  }, [tokenExists, merchantState, merchantPDA, fetchData, type])

  return (
    <VStack justifyContent="center">
      <Card>
        <CardBody>
          <VStack>
            <Heading size="lg" textAlign="center">
              {isLoyalty ? "Loyalty NFT Collection" : "Reward Points Token"}
            </Heading>
            {renderContent()}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
