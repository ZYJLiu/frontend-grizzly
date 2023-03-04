import type { AppProps } from "next/app"
import { ChakraProvider } from "@chakra-ui/react"
import Navbar from "../components/Navbar"
import WalletContextProvider from "../contexts/WalletContextProvider"
import { AnchorContextProvider } from "@/contexts/AnchorContextProvider"
export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WalletContextProvider>
        <AnchorContextProvider>
          <Navbar />
          <Component {...pageProps} />
        </AnchorContextProvider>
      </WalletContextProvider>
    </ChakraProvider>
  )
}
