import { prisma } from "@/db/prisma"
import {
  Card,
  CardBody,
  Flex,
  Heading,
  IconButton,
  Link,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react"
import { LinkIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons"
import React, { useState } from "react"

export async function getServerSideProps() {
  try {
    const data = await prisma.transaction.findMany()
    return {
      props: {
        data: JSON.parse(JSON.stringify(data)),
      },
    }
  } catch (error) {
    console.log(error)
    return {
      props: {
        data: [],
      },
    }
  }
}

export default function Test({ data }) {
  const [expandedCustomer, setExpandedCustomer] = useState(null)
  const [sortOrder, setSortOrder] = useState("desc")

  // group transactions by customer and sum the amount for each customer
  const customers = data.reduce((acc, transaction) => {
    const { customer, amount } = transaction
    if (!acc[customer]) {
      acc[customer] = { customer, totalAmount: 0, transactions: [] }
    }
    acc[customer].totalAmount += amount
    acc[customer].transactions.push(transaction)
    return acc
  }, {})

  // sort customers by total amount
  const sortedCustomers = Object.values(customers).sort((a, b) => {
    if (sortOrder === "asc") {
      return a.totalAmount - b.totalAmount
    } else {
      return b.totalAmount - a.totalAmount
    }
  })

  return (
    <VStack alignItems="center" justifyContent="center">
      <Heading>Transaction History</Heading>
      <Card maxWidth="90%">
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th textAlign="center">Customer</Th>
                <Th textAlign="center">
                  Total Spent
                  <IconButton
                    icon={
                      sortOrder === "asc" ? (
                        <ChevronUpIcon />
                      ) : (
                        <ChevronDownIcon />
                      )
                    }
                    aria-label="Sort by Total Spent"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                  />
                </Th>
                <Th textAlign="center">Details</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedCustomers.map((customer) => (
                <React.Fragment key={customer.customer}>
                  <Tr
                    onClick={() =>
                      setExpandedCustomer(
                        expandedCustomer === customer.customer
                          ? null
                          : customer.customer
                      )
                    }
                    _hover={{ cursor: "pointer" }}
                  >
                    <Td textAlign="center">{customer.customer}</Td>
                    <Td textAlign="center">${customer.totalAmount}</Td>
                    <Td>
                      <IconButton
                        icon={
                          expandedCustomer === customer.customer ? (
                            <ChevronUpIcon />
                          ) : (
                            <ChevronDownIcon />
                          )
                        }
                        aria-label={
                          expandedCustomer === customer.customer
                            ? "Collapse transactions"
                            : "Expand transactions"
                        }
                        variant="ghost"
                        size="sm"
                      />
                    </Td>
                  </Tr>
                  {expandedCustomer === customer.customer && (
                    <Tr>
                      <Td colSpan={3}>
                        <Table variant="simple" width="100%">
                          <Thead>
                            <Tr>
                              <Th textAlign="center">Signature</Th>
                              <Th textAlign="center">Checkout Amount</Th>
                              <Th textAlign="center">Created At</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {customer.transactions.map((transaction) => (
                              <Tr key={transaction.signature}>
                                <Td>
                                  <Flex
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Link
                                      href={`https://solscan.io/tx/${transaction.signature}?cluster=devnet`}
                                      isExternal
                                      _hover={{ color: "blue.600" }}
                                    >
                                      <LinkIcon />
                                    </Link>
                                  </Flex>
                                </Td>
                                <Td textAlign="center">
                                  ${transaction.amount}
                                </Td>
                                <Td textAlign="center">
                                  {new Date(transaction.createdAt)
                                    .toLocaleString("en-US", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                    .replace(",", "")}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Td>
                    </Tr>
                  )}
                </React.Fragment>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </VStack>
  )
}
