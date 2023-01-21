import {
  Box,
  Heading,
  ListItem,
  UnorderedList,
  VStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Stack,
  StackDivider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react"
import { Keypair } from "@solana/web3.js"
import { useEffect, useRef, useState } from "react"
import { createQRCode } from "../utils/createQrCode/setup"
import { checkTransaction } from "../utils/checkTransaction"

export default function Home() {
  // QrRef is a reference to the div that will contain the QR code
  const qrRef = useRef<HTMLDivElement>(null)

  // Generate new reference for each transaction
  // Used to identify the transaction
  const [reference, setReference] = useState(Keypair.generate().publicKey)

  // Create QR code
  useEffect(() => {
    createQRCode(qrRef, reference)
  }, [reference])

  // Check transaction status
  useEffect(() => {
    const interval = setInterval(() => {
      checkTransaction(reference, setReference)
    }, 1500)

    return () => {
      clearInterval(interval)
    }
  }, [reference])

  return (
    <VStack justifyContent="center">
      <Heading>Scan for Setup</Heading>
      <Box ref={qrRef} />

      <Card>
        <CardBody>
          <Accordion defaultIndex={[0]} allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1">
                  <Heading size="xs" textTransform="uppercase">
                    Instructions
                  </Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <Card>
                  <CardBody>
                    <Stack divider={<StackDivider />} spacing="4">
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          Set up mobile wallet
                        </Heading>
                        <UnorderedList pt="2" fontSize="sm" spacing={1}>
                          <ListItem>Use Solflare mobile wallet</ListItem>
                          <ListItem>Change to Devnet on mobile wallet</ListItem>
                          <ListItem>
                            Scan QR Code above to fund mobile wallet
                          </ListItem>
                          <ListItem>
                            Funds wallet with 2 devnet SOL and 100 USDC-dev
                          </ListItem>
                        </UnorderedList>
                      </Box>
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          Connect Browser Extension Wallet
                        </Heading>
                        <UnorderedList pt="2" fontSize="sm" spacing={1}>
                          <ListItem>
                            Create a new browser wallet address
                          </ListItem>
                          <ListItem>
                            Change to Devnet on browser wallet
                          </ListItem>
                          <ListItem>Connect browser wallet</ListItem>
                          <ListItem>
                            Transactions sent USDC-dev to connected wallet
                          </ListItem>
                        </UnorderedList>
                      </Box>
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          Point of Sale Terminals
                        </Heading>
                        <UnorderedList pt="2" fontSize="sm" spacing={1}>
                          <ListItem>
                            Click top left Icon and navigate to a terminal
                          </ListItem>
                          <ListItem>Select items from Square Catalog</ListItem>
                          <ListItem>Click "Solana Pay" button</ListItem>
                          <ListItem>
                            Loading Spinner is waiting for Square Order
                          </ListItem>
                          <ListItem>Scan QR Code with mobile wallet</ListItem>
                          <ListItem>
                            Approve transaction on mobile wallet
                          </ListItem>
                        </UnorderedList>
                      </Box>
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          NFC Tag
                        </Heading>
                        <UnorderedList pt="2" fontSize="sm" spacing={1}>
                          <ListItem>
                            Each terminal generates a static Solana Pay link
                          </ListItem>
                          <ListItem>
                            Each link is for the order made on specific terminal
                          </ListItem>
                          <ListItem>
                            Write the Solana Pay link to NFC tag
                          </ListItem>
                          <ListItem>Use any NFC Read/Write app</ListItem>
                          <ListItem>Enable NFC on mobile device</ListItem>
                          <ListItem>Create new Order</ListItem>
                          <ListItem>Tap NFC tag with mobile device</ListItem>
                          <ListItem>
                            Approve transaction on mobile wallet
                          </ListItem>
                        </UnorderedList>
                      </Box>
                      <Box>
                        <Heading size="xs" textTransform="uppercase">
                          NFT Discount
                        </Heading>
                        <UnorderedList pt="2" fontSize="sm" spacing={1}>
                          <ListItem>
                            If wallet holds NFT, discount is applied to order
                          </ListItem>
                          <ListItem>
                            If no NFT held, mint one to wallet with checkout
                          </ListItem>
                          <ListItem>
                            Square Order updated to reflect discount
                          </ListItem>
                        </UnorderedList>
                      </Box>
                    </Stack>
                  </CardBody>
                </Card>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>
    </VStack>
  )
}
