// point of sale terminal page
import {
  Button,
  Text,
  HStack,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  TableContainer,
  Table,
  Tr,
  Td,
  TableCaption,
  Thead,
  Th,
  Tbody,
  Code,
  useDisclosure,
  Heading,
  useBreakpointValue,
  Spinner,
  Card,
  CardBody,
  Switch,
  FormControl,
  FormLabel,
  Flex,
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/router"
import { useState, useEffect, useCallback, useMemo } from "react"
import QrModal from "../../components/QrCode"
import axios from "axios"
import {
  Item,
  Items,
  ItemData,
  Order,
  OrderDetail,
  Payment,
} from "../../utils/square"

export default function Terminal() {
  const { connected } = useWallet()
  const router = useRouter()

  // Get terminal Id from URL
  const { id } = router.query as { id: string }

  // Open QR Code Modal
  const { isOpen, onOpen, onClose } = useDisclosure({
    onClose: () => {
      reset()
    },
  })

  // Loading for order to be created before displaying QR code
  const [isLoading, setIsLoading] = useState(false)

  // Loading while wating to fetch Square catalog to display items selection table
  const [isLoadingTable, setIsLoadingTable] = useState(true)

  // Solana Pay transaction confirmed, trigger create Square payment
  const [confirmed, setConfirmed] = useState(false)

  // Items in catalog, used to create Item Selection/Checkout table
  const [items, setItems] = useState<{ [key: string]: Item }>({})

  // Quantity of items in catalog used to create a new order
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})

  // Store new Order Id and used to retrieve updated Order Detail
  const [orderId, setOrderId] = useState<string | null>(null)

  // Order Detail, used to create a new payment
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)

  // SquareAPI order detail to display
  const [resultOrder, setResultOrder] = useState<Order | null>(null)

  // SquareAPI payment detail to display
  const [resultPayment, setResultPayment] = useState<Payment | null>(null)

  // Toggle redeem loyalty points at checkout
  const [isChecked, setIsChecked] = useState(false)
  const toggleSwitch = () => setIsChecked(!isChecked)

  // Fetch catalog from SquareAPI
  const fetchCatalog = async () => {
    try {
      const { data } = await axios.post("/api/fetchCatalog")
      return data.objects
    } catch (error) {
      console.error(error)
    }
  }

  // Fetch catalog from SquareAPI when component mounts and set items state
  useEffect(() => {
    fetchCatalog().then((data) => {
      const itemsData = data.reduce(
        (acc: { [key: string]: object }, item: ItemData) => {
          const {
            id,
            itemData: { name, variations, description },
          } = item
          const {
            id: variationId,
            itemVariationData: {
              priceMoney: { amount },
            },
          } = variations[0]
          acc[variationId] = {
            id,
            name,
            description,
            variationId,
            price: amount,
            quantity: 0,
          }
          return acc
        },
        {}
      )
      setItems(itemsData)
      setIsLoadingTable(false)
    })
  }, [])

  // Update item quantities
  const handleChange = useCallback(
    (event: string, id: string) => {
      const value = Number(event)

      // Update items state with the new value
      const updatedItems = { ...items }
      updatedItems[id].quantity = value
      setItems(updatedItems)

      // Update quantities state with the new value or remove the key if value is 0
      // Separate state to be used to create a new order
      if (value === 0) {
        const { [id]: removed, ...updatedQuantities } = quantities
        setQuantities(updatedQuantities)
      } else {
        setQuantities({ ...quantities, [id]: value })
      }
    },
    [items, quantities]
  )

  // Calculate total price from quantities
  const total = useMemo(() => {
    return Object.values(items).reduce((acc, item) => {
      return (
        acc + (Number(item.price) * (quantities[item.variationId] || 0)) / 100
      )
    }, 0)
  }, [items, quantities])

  // Create a new order
  async function handleCreateOrder() {
    try {
      const { data } = await axios.post("/api/createOrder", { quantities })
      const {
        order: {
          id: orderId,
          netAmountDueMoney: { amount: netAmountDueAmount },
        },
      } = data
      setOrderId(orderId)
      setOrderDetail({ orderId, netAmountDueAmount })
      setResultOrder(data)
      setIsLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  // Retrieve order, in case changes are made (discount applied, etc.)
  async function handleRetrieveOrder() {
    console.log("retrieve order")
    console.log(orderId)
    if (!orderId) {
      return
    }
    try {
      const { data } = await axios.get(`/api/retrieveOrder?orderId=${orderId}`)
      const {
        order: {
          netAmountDueMoney: { amount: netAmountDueAmount },
        },
      } = data
      setResultOrder(data)
      setOrderDetail({ orderId, netAmountDueAmount })
      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }

  // Create a new payment once Solana Pay transaction is confirmed
  async function handlePayment() {
    try {
      const { data } = await axios.post("/api/makePayment", { orderDetail })
      setResultPayment(data)
      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }

  // Retrieve order once Solana Pay transaction is confirmed
  useEffect(() => {
    if (confirmed) handleRetrieveOrder()
  }, [confirmed])

  // Create a new payment once updated order detail is retrieved
  useEffect(() => {
    if (confirmed && orderDetail) handlePayment()
  }, [orderDetail])

  // Reset state
  const resetState = () => {
    setResultOrder(null)
    setOrderDetail(null)
    setResultPayment(null)
    setIsChecked(false)
    reset()
  }

  const reset = () => {
    const resetItems: Items = Object.entries(items).reduce(
      (acc: Items, [id, item]) => {
        acc[id] = { ...item, quantity: 0 }
        return acc
      },
      {}
    )

    setItems(resetItems)
    setQuantities({})
  }

  // scale table based on screen size
  const scale = useBreakpointValue({
    base: 0.9,
    md: 1,
    lg: 1,
  })

  // hide Square response data on small screens
  const showHStack = useBreakpointValue({ base: false, md: false, lg: true })

  return (
    <VStack alignItems="center" justifyContent="center">
      <Card rounded="lg" shadow="md" mx="auto">
        <CardBody rounded="lg">
          <Heading textAlign="center">Terminal {id}</Heading>
          <VStack style={{ transform: `scale(${scale})` }}>
            {/* Item Selection Table */}
            <Table variant="simple">
              <TableCaption fontWeight="bold" placement="top">
                Item Selection
              </TableCaption>
              <Thead>
                <Tr>
                  <Th>Item</Th>
                  <Th>Description</Th>
                  <Th>Price</Th>
                  <Th>Quantity</Th>
                </Tr>
              </Thead>
              <Tbody>
                {!isLoadingTable ? (
                  Object.keys(items).map((key) => {
                    const item: Item = items[key]
                    return (
                      <Tr key={item.variationId}>
                        <Td>{item.name}</Td>
                        <Td>{item.description}</Td>
                        <Td isNumeric>
                          ${(item.price as unknown as number) / 100}
                        </Td>
                        <Td>
                          <NumberInput
                            width={20}
                            step={1}
                            min={0}
                            // max={30}
                            value={quantities[item.variationId] || 0}
                            onChange={(event) =>
                              handleChange(event, item.variationId)
                            }
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </Td>
                      </Tr>
                    )
                  })
                ) : (
                  <Tr>
                    <Td colSpan={4} style={{ textAlign: "center" }}>
                      <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="blue.500"
                        size="xl"
                      />
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>

            {/* Checkout Table */}
            <TableContainer>
              <Table variant="simple">
                <TableCaption fontWeight="bold" placement="top">
                  Checkout
                </TableCaption>
                <Thead>
                  <Tr>
                    <Th>Item</Th>
                    <Th>Quantity</Th>
                    <Th isNumeric>Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.values(items).map((item) => {
                    if (item.quantity > 0) {
                      return (
                        <Tr key={item.variationId}>
                          <Td>{item.name}</Td>
                          <Td>{item.quantity}</Td>
                          <Td isNumeric>
                            {(
                              (Number(item.price) * item.quantity) /
                              100
                            ).toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </Td>
                        </Tr>
                      )
                    }
                  })}
                  <Tr
                    style={{ borderTopWidth: "4px", borderTopColor: "black" }}
                  >
                    <Td colSpan={2} textAlign="right">
                      Total
                    </Td>
                    <Td isNumeric>
                      {total.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td textAlign="center" colSpan={3}>
                      <Flex justifyContent="center">
                        <VStack>
                          <FormControl
                            display="flex"
                            alignItems="center"
                            mb="1"
                          >
                            <FormLabel htmlFor="toggleSwitch" mb="0">
                              Redeem Reward Points
                            </FormLabel>
                            <Switch
                              size="md"
                              isChecked={isChecked}
                              onChange={toggleSwitch}
                            />
                          </FormControl>
                          <Button
                            width="50%"
                            onClick={() => {
                              if (connected) {
                                handleCreateOrder()
                                onOpen()
                                setIsLoading(true)
                              } else {
                                alert("Connect Wallet")
                              }
                            }}
                          >
                            Solana Pay
                          </Button>
                          <Button width="50%" onClick={resetState}>
                            Reset
                          </Button>
                        </VStack>
                      </Flex>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </VStack>
        </CardBody>
      </Card>

      {/* Solana Pay QR Code Modal */}
      {isOpen && (
        <QrModal
          onClose={onClose}
          value={total}
          confirmed={confirmed}
          setConfirmed={setConfirmed}
          id={id}
          orderId={orderDetail?.orderId as string}
          isLoading={isLoading}
          isChecked={isChecked}
          setIsChecked={setIsChecked}
        />
      )}

      {/* Square API Response Data */}
      {showHStack && (
        <HStack alignItems="top" justifyContent="center">
          {/* Square Order Detail */}
          {resultOrder && orderDetail && (
            <VStack>
              <Text>Order ID: {orderDetail?.orderId}</Text>
              <Code whiteSpace="pre" fontFamily="mono">
                {JSON.stringify(resultOrder, null, 2)}
              </Code>
            </VStack>
          )}

          {/* Square Payment Detail */}
          {resultPayment && (
            <VStack>
              <Text>Payment ID: {resultPayment.payment.id}</Text>
              <Code whiteSpace="pre" fontFamily="mono">
                {JSON.stringify(resultPayment, null, 2)}
              </Code>
            </VStack>
          )}
        </HStack>
      )}
    </VStack>
  )
}
