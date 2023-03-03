import { VStack, Heading, Card, CardBody } from "@chakra-ui/react"
import { PublicKey } from "@solana/web3.js"
import { RewardPointsData } from "./RewardPointsData"
import { RewardPointsCreate } from "./RewardPointsCreate"
import { TokenDataDisplay } from "./TokenDataDisplay"
import { TokenCreate } from "./TokenCreate"

type Props = {
  merchantPDA: PublicKey
  merchantState: any
  fetchData: (pda: PublicKey) => void
}

export const RewardPointsCard: React.FC<Props> = ({
  merchantPDA,
  merchantState,
  fetchData,
}) => {
  console.log(merchantState.rewardPointsMint.toString())
  return (
    <VStack justifyContent="center">
      <Card>
        <CardBody>
          <VStack>
            <Heading size="lg" textAlign="center">
              Reward Points Token
            </Heading>
            {merchantState.rewardPointsMint.toString() !==
            "11111111111111111111111111111111" ? (
              // <RewardPointsData
              //   merchantState={merchantState}
              //   merchantPDA={merchantPDA}
              //   fetchData={fetchData}
              //   />
              <TokenDataDisplay
                merchantState={merchantState}
                merchantPDA={merchantPDA}
                fetchData={fetchData}
                type="REWARD_POINTS"
              />
            ) : (
              // <RewardPointsCreate
              //   merchantPDA={merchantPDA}
              //   merchantState={merchantState}
              //   fetchData={fetchData}
              // />
              <TokenCreate
                merchantPDA={merchantPDA}
                fetchData={fetchData}
                type="REWARD_POINTS"
              />
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
