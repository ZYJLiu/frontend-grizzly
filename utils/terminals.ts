// Generate an array of terminals with a specified number of terminals
import { Keypair } from "@solana/web3.js"

// However many terminals you want to create, change the number in the function call
export const terminals = createTerminalsArray(3)

// Function that creates an array of terminals with a specified number of terminals
function createTerminalsArray(numTerminals: number) {
  let terminals = []

  for (let i = 1; i <= numTerminals; i++) {
    terminals.push({
      id: i,
      // // Unused, but could be used to generate a unique public key for each terminal as ID
      // key: Keypair.generate().publicKey,
    })
  }

  // Return the array of terminals
  return terminals
}
