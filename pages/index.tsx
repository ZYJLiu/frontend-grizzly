// setup Home page
import {
  Box,
  Heading,
  ListItem,
  UnorderedList,
  VStack,
  Card,
  CardBody,
  Stack,
  StackDivider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  useColorMode,
} from "@chakra-ui/react"
import { Keypair } from "@solana/web3.js"
import { useEffect, useRef, useState } from "react"
import { createQRCode } from "../utils/createQrCode/setup"
import { checkTransaction } from "../utils/checkTransaction"

export default function Home() {
  const { colorMode } = useColorMode()
  // QrRef is a reference to the div that will contain the QR code
  const qrRef = useRef<HTMLDivElement>(null)

  // Generate new reference for each transaction
  // Used to identify the transaction
  const [reference, setReference] = useState(Keypair.generate().publicKey)

  // Used to size the QR code
  const [size, setSize] = useState(() =>
    typeof window === "undefined" ? 100 : Math.min(window.outerWidth - 5, 512)
  )

  useEffect(() => {
    const listener = () => setSize(Math.min(window.outerWidth - 5, 512))
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [])

  // Create QR code
  useEffect(() => {
    createQRCode(qrRef, reference, size)
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

      <Card rounded="lg" mx="auto">
        <CardBody rounded="lg">
          <Accordion defaultIndex={[0]} allowToggle>
            <AccordionItem rounded="lg">
              <AccordionButton rounded="lg" mb="1">
                <Box flex="1">
                  <Heading size="xs" textTransform="uppercase">
                    Instructions
                  </Heading>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                {/* <Card rounded="lg">
                  <CardBody rounded="lg"> */}
                <Stack divider={<StackDivider />} spacing="4">
                  <Box>
                    <Heading size="xs" textTransform="uppercase">
                      Set up mobile wallet
                    </Heading>
                    <UnorderedList pt="2" fontSize="sm" spacing={1}>
                      <ListItem>
                        Download Solflare or Phantom mobile wallet
                      </ListItem>
                      <ListItem>Update to latest version on device</ListItem>
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
                      <ListItem>Create a new browser wallet address</ListItem>
                      <ListItem>Change to Devnet on browser wallet</ListItem>
                      <ListItem>Connect browser wallet</ListItem>
                      <ListItem>
                        Transactions send USDC-dev to connected wallet
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
                      <ListItem>Approve transaction on mobile wallet</ListItem>
                    </UnorderedList>
                  </Box>
                  <Box>
                    <Heading size="xs" textTransform="uppercase">
                      NFC Tag
                    </Heading>
                    <UnorderedList pt="2" fontSize="sm" spacing={1}>
                      <ListItem>
                        Each terminal generates a Solana Pay URL
                      </ListItem>
                      <ListItem>
                        Each URL reflects order on specific terminal
                      </ListItem>
                      <ListItem>
                        URL logged to console when QR Code created
                      </ListItem>
                      <ListItem>Write the Solana Pay URL to NFC tag</ListItem>
                      <ListItem>Use any NFC Read/Write app</ListItem>
                      <ListItem>Enable NFC on mobile device</ListItem>
                      <ListItem>Create new Order</ListItem>
                      <ListItem>Tap NFC tag with mobile device</ListItem>
                      <ListItem>Approve transaction on mobile wallet</ListItem>
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
                  <Box>
                    <Heading size="xs" textTransform="uppercase">
                      Alternative set up
                    </Heading>
                    <UnorderedList pt="2" fontSize="sm" spacing={1}>
                      <ListItem>
                        <Link
                          href="https://spl-token-faucet.com/?token-name=USDC"
                          isExternal
                          color="blue.500"
                          _hover={{
                            color: "blue.600",
                          }}
                        >
                          Click here for USDC-dev and Devnet SOL
                        </Link>
                      </ListItem>
                    </UnorderedList>
                  </Box>
                </Stack>
                {/* </CardBody>
                </Card> */}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </CardBody>
      </Card>
    </VStack>
  )
}
