// Form for creating a new token
import {
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react"

type TokenFormProps = {
  name: string
  setName: (value: string) => void
  symbol: string
  setSymbol: (value: string) => void
  type: string
  setBasisPoints: (value: number) => void
}

export const TokenForm: React.FC<TokenFormProps> = ({
  name,
  setName,
  symbol,
  setSymbol,
  type,
  setBasisPoints,
}) => {
  return (
    <FormControl>
      <FormLabel mt={2}>Name</FormLabel>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name"
      />
      <FormLabel mt={2}>Symbol</FormLabel>
      <Input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="Enter symbol"
      />
      <FormLabel mt={2}>
        % {type === "LOYALTY_NFT" ? "Discount" : "Reward"} on Transaction
      </FormLabel>
      <NumberInput
        onChange={(value) => setBasisPoints(Number(value) * 100)}
        defaultValue={0}
        min={0}
        max={100}
        precision={2}
        step={0.25}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  )
}
