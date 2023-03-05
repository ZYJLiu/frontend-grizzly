import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react"
import { prisma } from "@/db/prisma"

export async function getServerSideProps() {
  // will always run on the server
  // newest first
  const data = await prisma.transaction.findMany()

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
  }
}

export const ExampleTable = ({ data }: any) => {
  console.log(data)
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          <Th>Column 1</Th>
          <Th>Column 2</Th>
          <Th>Column 3</Th>
        </Tr>
      </Thead>
    </Table>
  )
}
