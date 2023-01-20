import { Keypair } from "@solana/web3.js"

// Export an array of terminals created by the createTerminalsArray function
export const terminals = createTerminalsArray(10)

// Function that creates an array of terminals with a specified number of terminals
function createTerminalsArray(numTerminals: number) {
  // Initialize empty array
  let terminals = []

  // Loop through the specified number of terminals
  for (let i = 1; i <= numTerminals; i++) {
    // Generate a new public key and push a new location object to the array
    terminals.push({
      id: i,
      // key: Keypair.generate().publicKey,
    })
  }

  // Return the array of terminals
  return terminals
}
