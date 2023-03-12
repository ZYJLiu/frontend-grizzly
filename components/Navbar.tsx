// Navbar component
// Home is setup page, airdrop devnet SOL and USDC-dev tokens to mobile wallet
import {
  MenuButton,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  IconButton,
  Spacer,
} from "@chakra-ui/react"
import { HamburgerIcon } from "@chakra-ui/icons"
import Link from "next/link"
import WalletMultiButton from "./WalletMultiButton"
import { terminals } from "../utils/terminals"
import { useRouter } from "next/router"

const Navbar = () => {
  const router = useRouter()
  return (
    <Flex px={4} py={4}>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<HamburgerIcon />}
          variant="outline"
        />
        <MenuList>
          <MenuItem as={Link} href="/">
            Home
          </MenuItem>
          <MenuItem as={Link} href="/merchant">
            Merchant
          </MenuItem>
          <MenuItem as={Link} href="/transaction-history">
            Transactions
          </MenuItem>
          {terminals.map((terminal) => (
            <MenuItem
              as={Link}
              href={`/terminal/${terminal.id}`}
              key={terminal.id}
            >
              Terminal {terminal.id}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Spacer />
      {(router.pathname === "/" || router.pathname === "/merchant") && (
        <WalletMultiButton />
      )}
    </Flex>
  )
}

export default Navbar
