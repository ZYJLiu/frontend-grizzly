// unused
import { createContext, useContext } from "react"
import {
  Program,
  AnchorProvider,
  Idl,
  setProvider,
} from "@project-serum/anchor"
import { IDL, AnchorGrizzly } from "../idl/anchor_grizzly"
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js"
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet"

const AnchorContext = createContext<AnchorWorkSpace>({
  connection: new Connection(clusterApiUrl("devnet")),
})

const programId = new PublicKey("4m2iCzvckHmiXf4bV4xHckVAE2tMNLt2GgUziSr7uTiF")

interface AnchorWorkSpace {
  connection: Connection
  provider?: AnchorProvider
  program?: Program<AnchorGrizzly>
}

const AnchorContextProvider = ({ children }: any) => {
  const connection = new Connection(clusterApiUrl("devnet"))
  const wallet = new NodeWallet(Keypair.generate())
  const provider = new AnchorProvider(connection, wallet, {})

  setProvider(provider)
  const program = new Program(
    IDL as Idl,
    programId
  ) as unknown as Program<AnchorGrizzly>

  const anchorWorkspace = {
    connection,
    provider,
    program,
  }

  return (
    <AnchorContext.Provider value={anchorWorkspace}>
      {children}
    </AnchorContext.Provider>
  )
}

const useAnchor = (): AnchorWorkSpace => {
  return useContext(AnchorContext)
}

export { AnchorContextProvider, useAnchor }
