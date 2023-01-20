// Navbar component
// Home is setup page, airdrop devnet SOL and USDC-dev tokens to the wallet
// Remaining pages are Solana Pay point of sale "terminals", number of terminals is defined in utils/terminals.ts
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

const Navbar = () => {
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
      <WalletMultiButton />
    </Flex>
  )
}

export default Navbar
