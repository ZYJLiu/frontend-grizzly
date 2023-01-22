// IDL for Anchor program with miscellaneous instructions used in demo
// Instructions can be done without this program, but used to demonstrate Solana Pay with Anchor
export type AnchorMisc = {
  version: "0.1.0"
  name: "anchor_misc"
  instructions: [
    {
      name: "createNft"
      accounts: [
        {
          name: "mint"
          isMut: true
          isSigner: true
        },
        {
          name: "metadata"
          isMut: true
          isSigner: false
        },
        {
          name: "masterEdition"
          isMut: true
          isSigner: false
        },
        {
          name: "auth"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "auth"
              }
            ]
          }
        },
        {
          name: "tokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "user"
          isMut: false
          isSigner: false
        },
        {
          name: "payer"
          isMut: true
          isSigner: true
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "associatedTokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "rent"
          isMut: false
          isSigner: false
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenMetadataProgram"
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: "uri"
          type: "string"
        },
        {
          name: "name"
          type: "string"
        },
        {
          name: "symbol"
          type: "string"
        }
      ]
    },
    {
      name: "createNftInCollection"
      accounts: [
        {
          name: "mint"
          isMut: true
          isSigner: true
        },
        {
          name: "metadata"
          isMut: true
          isSigner: false
        },
        {
          name: "masterEdition"
          isMut: true
          isSigner: false
        },
        {
          name: "collectionMint"
          isMut: true
          isSigner: false
        },
        {
          name: "collectionMetadata"
          isMut: true
          isSigner: false
        },
        {
          name: "collectionMasterEdition"
          isMut: true
          isSigner: false
        },
        {
          name: "auth"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "auth"
              }
            ]
          }
        },
        {
          name: "tokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "user"
          isMut: false
          isSigner: false
        },
        {
          name: "payer"
          isMut: true
          isSigner: true
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "associatedTokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "rent"
          isMut: false
          isSigner: false
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenMetadataProgram"
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: "uri"
          type: "string"
        },
        {
          name: "name"
          type: "string"
        },
        {
          name: "symbol"
          type: "string"
        }
      ]
    },
    {
      name: "tokenTransfer"
      accounts: [
        {
          name: "sender"
          isMut: true
          isSigner: true
        },
        {
          name: "receiver"
          isMut: false
          isSigner: false
        },
        {
          name: "fromTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "toTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "mint"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "associatedTokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "rent"
          isMut: false
          isSigner: false
        }
      ]
      args: [
        {
          name: "amount"
          type: "u64"
        }
      ]
    },
    {
      name: "mint"
      accounts: [
        {
          name: "tokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "mint"
          isMut: true
          isSigner: false
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "associatedTokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "rent"
          isMut: false
          isSigner: false
        },
        {
          name: "auth"
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "auth"
              }
            ]
          }
        },
        {
          name: "receipient"
          isMut: false
          isSigner: false
        },
        {
          name: "payer"
          isMut: true
          isSigner: true
        }
      ]
      args: []
    },
    {
      name: "init"
      accounts: [
        {
          name: "tokenAccount"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "auth"
              }
            ]
          }
        },
        {
          name: "mint"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "rent"
          isMut: false
          isSigner: false
        },
        {
          name: "auth"
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "auth"
              }
            ]
          }
        },
        {
          name: "payer"
          isMut: true
          isSigner: true
        }
      ]
      args: []
    },
    {
      name: "usdcDevTransfer"
      accounts: [
        {
          name: "auth"
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "auth"
              }
            ]
          }
        },
        {
          name: "fromTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "toTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "payer"
          isMut: true
          isSigner: true
        },
        {
          name: "mint"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "associatedTokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "rent"
          isMut: false
          isSigner: false
        }
      ]
      args: []
    }
  ]
}

export const IDL: AnchorMisc = {
  version: "0.1.0",
  name: "anchor_misc",
  instructions: [
    {
      name: "createNft",
      accounts: [
        {
          name: "mint",
          isMut: true,
          isSigner: true,
        },
        {
          name: "metadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "masterEdition",
          isMut: true,
          isSigner: false,
        },
        {
          name: "auth",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "auth",
              },
            ],
          },
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenMetadataProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "uri",
          type: "string",
        },
        {
          name: "name",
          type: "string",
        },
        {
          name: "symbol",
          type: "string",
        },
      ],
    },
    {
      name: "createNftInCollection",
      accounts: [
        {
          name: "mint",
          isMut: true,
          isSigner: true,
        },
        {
          name: "metadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "masterEdition",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collectionMint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collectionMetadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collectionMasterEdition",
          isMut: true,
          isSigner: false,
        },
        {
          name: "auth",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "auth",
              },
            ],
          },
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenMetadataProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "uri",
          type: "string",
        },
        {
          name: "name",
          type: "string",
        },
        {
          name: "symbol",
          type: "string",
        },
      ],
    },
    {
      name: "tokenTransfer",
      accounts: [
        {
          name: "sender",
          isMut: true,
          isSigner: true,
        },
        {
          name: "receiver",
          isMut: false,
          isSigner: false,
        },
        {
          name: "fromTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "toTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "mint",
      accounts: [
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "auth",
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "auth",
              },
            ],
          },
        },
        {
          name: "receipient",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "init",
      accounts: [
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "auth",
              },
            ],
          },
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "auth",
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "auth",
              },
            ],
          },
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: "usdcDevTransfer",
      accounts: [
        {
          name: "auth",
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "auth",
              },
            ],
          },
        },
        {
          name: "fromTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "toTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "associatedTokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
}
