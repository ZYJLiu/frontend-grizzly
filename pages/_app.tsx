import type { AppProps } from "next/app"
import { ChakraProvider } from "@chakra-ui/react"
import Navbar from "../components/Navbar"
import WalletContextProvider from "../contexts/WalletContextProvider"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WalletContextProvider>
        <Navbar />
        <Component {...pageProps} />
      </WalletContextProvider>
    </ChakraProvider>
  )
}
