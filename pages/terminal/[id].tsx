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
} from "@chakra-ui/react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/router"
import { useState, useEffect, useCallback } from "react"
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
  const { id } = router.query as { id: string }

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false)

  const [items, setItems] = useState<{ [key: string]: Item }>({})
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [total, setTotal] = useState(0)

  const [resultOrder, setResultOrder] = useState<Order | null>(null)
  const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)

  const [resultPayment, setResultPayment] = useState<Payment | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const [size, setSize] = useState(() =>
    typeof window === "undefined" ? 100 : Math.min(window.outerWidth - 10, 512)
  )

  useEffect(() => {
    const listener = () => setSize(Math.min(window.outerWidth - 10, 512))
    window.addEventListener("resize", listener)
    return () => window.removeEventListener("resize", listener)
  }, [])

  async function fetchCatalog() {
    try {
      const { data } = await axios.post("/api/fetchCatalog")
      const itemsData = data.objects.reduce(
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
    } catch (error) {
      console.error(error)
    }
  }

  // Run fetchCatalog when the component mounts
  useEffect(() => {
    fetchCatalog()
  }, [])

  const handleChange = useCallback(
    (event: string, id: string) => {
      const value = Number(event)
      const updatedItems = { ...items }
      updatedItems[id].quantity = value
      setItems(updatedItems)

      // Update quantities with the new value or remove the key if value is 0
      if (value === 0) {
        const { [id]: removed, ...updatedQuantities } = quantities
        setQuantities(updatedQuantities)
      } else {
        setQuantities({ ...quantities, [id]: value })
      }
    },
    [items, quantities]
  )

  function calculateTotal() {
    const totalAmount = Object.values(items).reduce((acc, item) => {
      return item.quantity > 0
        ? acc + (Number(item.price) * item.quantity) / 100
        : acc
    }, 0)
    setTotal(totalAmount)
  }

  // Run fetchCatalog when the component mounts
  useEffect(() => {
    calculateTotal()
    console.log(quantities)
    console.log(items)
  }, [items])

  // async function handleCreateOrder(callback: () => void) {
  async function handleCreateOrder() {
    try {
      const { data } = await axios.post("/api/createOrder", { quantities })
      const {
        order: {
          id: orderId,
          netAmountDueMoney: { amount: netAmountDueAmount },
        },
      } = data
      setResultOrder(data)
      setOrderDetail({ orderId, netAmountDueAmount })
      setOrderId(orderId)
      setIsLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  async function handlePayment() {
    try {
      const { data } = await axios.post("/api/makePayment", { orderDetail })
      setResultPayment(data)
      console.log(data)
    } catch (error) {
      console.error(error)
    }
  }

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

  useEffect(() => {
    if (confirmed) handleRetrieveOrder()
  }, [confirmed])

  useEffect(() => {
    if (confirmed && orderDetail) handlePayment()
  }, [orderDetail])

  const resetState = () => {
    setResultOrder(null)
    setOrderDetail(null)
    setResultPayment(null)
    setQuantities({})
    setTotal(0)

    const resetItems: Items = Object.entries(items).reduce(
      (acc: Items, [id, item]) => {
        acc[id] = { ...item, quantity: 0 }
        return acc
      },
      {}
    )

    setItems(resetItems)
  }

  const scale = useBreakpointValue({
    base: 0.9,
    md: 1,
    lg: 1,
  })

  return (
    <VStack display="flex">
      <Heading>Terminal {id}</Heading>
      <VStack
        alignItems="top"
        justifyContent="center"
        style={{ transform: `scale(${scale})` }}
      >
        <VStack alignItems="top">
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
              {Object.keys(items).map((key) => {
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
                        max={30}
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
              })}
            </Tbody>
          </Table>
        </VStack>

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
                        {(Number(item.price) * item.quantity) / 100}
                      </Td>
                    </Tr>
                  )
                }
              })}
              <Tr style={{ borderTopWidth: "4px", borderTopColor: "black" }}>
                <Td colSpan={2} textAlign="right">
                  Total
                </Td>
                <Td isNumeric>{total}</Td>
              </Tr>
              <Tr>
                <Td textAlign="center" colSpan={3}>
                  <VStack>
                    <Button
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
                    <Button onClick={resetState}>Reset</Button>
                  </VStack>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>

      {isOpen && (
        <QrModal
          onClose={onClose}
          value={total}
          confirmed={confirmed}
          setConfirmed={setConfirmed}
          id={id}
          orderId={orderDetail?.orderId as string}
          isLoading={isLoading}
        />
      )}

      <HStack alignItems="top" justifyContent="center">
        {resultOrder && orderDetail && (
          <VStack>
            <Text>Order ID: {orderDetail?.orderId}</Text>
            <Code whiteSpace="pre" fontFamily="mono">
              {JSON.stringify(resultOrder, null, 2)}
            </Code>
          </VStack>
        )}

        {resultPayment && (
          <VStack>
            <Text>Payment ID: {resultPayment.payment.id}</Text>
            <Code whiteSpace="pre" fontFamily="mono">
              {JSON.stringify(resultPayment, null, 2)}
            </Code>
          </VStack>
        )}
      </HStack>
    </VStack>
  )
}
