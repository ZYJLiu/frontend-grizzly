export type AnchorGrizzly = {
  version: "0.1.0"
  name: "anchor_grizzly"
  constants: [
    {
      name: "USDC_MINT_PLACEHOLDER"
      type: "publicKey"
      value: 'pubkey ! ("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr")'
    }
  ]
  instructions: [
    {
      name: "initMerchant"
      accounts: [
        {
          name: "authority"
          isMut: true
          isSigner: true
        },
        {
          name: "merchant"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "MERCHANT"
              },
              {
                kind: "account"
                type: "publicKey"
                path: "authority"
              }
            ]
          }
        },
        {
          name: "usdcMintPlaceholder"
          isMut: false
          isSigner: false
        },
        {
          name: "paymentDestination"
          isMut: true
          isSigner: false
        },
        {
          name: "systemProgram"
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
        }
      ]
      args: []
    },
    {
      name: "initRewardPoints"
      accounts: [
        {
          name: "authority"
          isMut: true
          isSigner: true
        },
        {
          name: "merchant"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "MERCHANT"
              },
              {
                kind: "account"
                type: "publicKey"
                path: "authority"
              }
            ]
          }
        },
        {
          name: "rewardPointsMint"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "REWARD_POINTS"
              },
              {
                kind: "account"
                type: "publicKey"
                account: "MerchantState"
                path: "merchant"
              }
            ]
          }
        },
        {
          name: "metadataAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "systemProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenProgram"
          isMut: false
          isSigner: false
        },
        {
          name: "tokenMetadataProgram"
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
          name: "rewardPointsBasisPoints"
          type: "u16"
        },
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
      name: "transaction"
      accounts: [
        {
          name: "customer"
          isMut: true
          isSigner: true
        },
        {
          name: "authority"
          isMut: false
          isSigner: false
        },
        {
          name: "merchant"
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "MERCHANT"
              },
              {
                kind: "account"
                type: "publicKey"
                path: "authority"
              }
            ]
          }
        },
        {
          name: "paymentDestination"
          isMut: true
          isSigner: false
        },
        {
          name: "customerUsdcTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "rewardPointsMint"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "REWARD_POINTS"
              },
              {
                kind: "account"
                type: "publicKey"
                account: "MerchantState"
                path: "merchant"
              }
            ]
          }
        },
        {
          name: "customerRewardTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "systemProgram"
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
      name: "createCollectionNft"
      accounts: [
        {
          name: "authority"
          isMut: true
          isSigner: true
        },
        {
          name: "merchant"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "MERCHANT"
              },
              {
                kind: "account"
                type: "publicKey"
                path: "authority"
              }
            ]
          }
        },
        {
          name: "loyaltyCollectionMint"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "LOYALTY_NFT"
              },
              {
                kind: "account"
                type: "publicKey"
                account: "MerchantState"
                path: "merchant"
              }
            ]
          }
        },
        {
          name: "metadataAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "masterEdition"
          isMut: true
          isSigner: false
        },
        {
          name: "tokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "systemProgram"
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
          name: "tokenMetadataProgram"
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
          name: "loyaltyDiscountBasisPoints"
          type: "u16"
        },
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
          name: "customer"
          isMut: true
          isSigner: true
        },
        {
          name: "authority"
          isMut: false
          isSigner: false
        },
        {
          name: "merchant"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "MERCHANT"
              },
              {
                kind: "account"
                type: "publicKey"
                path: "authority"
              }
            ]
          }
        },
        {
          name: "loyaltyCollectionMint"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "LOYALTY_NFT"
              },
              {
                kind: "account"
                type: "publicKey"
                account: "MerchantState"
                path: "merchant"
              }
            ]
          }
        },
        {
          name: "collectionMetadataAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "collectionMasterEdition"
          isMut: true
          isSigner: false
        },
        {
          name: "customerNftMint"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "LOYALTY_NFT"
              },
              {
                kind: "account"
                type: "publicKey"
                account: "MerchantState"
                path: "merchant"
              },
              {
                kind: "account"
                type: "publicKey"
                path: "customer"
              }
            ]
          }
        },
        {
          name: "metadataAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "masterEdition"
          isMut: true
          isSigner: false
        },
        {
          name: "tokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "systemProgram"
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
          name: "tokenMetadataProgram"
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
      name: "updateRewardPoints"
      accounts: [
        {
          name: "authority"
          isMut: true
          isSigner: true
        },
        {
          name: "merchant"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "MERCHANT"
              },
              {
                kind: "account"
                type: "publicKey"
                path: "authority"
              }
            ]
          }
        }
      ]
      args: [
        {
          name: "rewardPointsBasisPoints"
          type: "u16"
        }
      ]
    },
    {
      name: "updateLoyaltyPoints"
      accounts: [
        {
          name: "authority"
          isMut: true
          isSigner: true
        },
        {
          name: "merchant"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "MERCHANT"
              },
              {
                kind: "account"
                type: "publicKey"
                path: "authority"
              }
            ]
          }
        }
      ]
      args: [
        {
          name: "loyaltyDiscountBasisPoints"
          type: "u16"
        }
      ]
    },
    {
      name: "mintRewardPoints"
      accounts: [
        {
          name: "authority"
          isMut: true
          isSigner: true
        },
        {
          name: "customer"
          isMut: false
          isSigner: false
        },
        {
          name: "merchant"
          isMut: false
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "MERCHANT"
              },
              {
                kind: "account"
                type: "publicKey"
                path: "authority"
              }
            ]
          }
        },
        {
          name: "rewardPointsMint"
          isMut: true
          isSigner: false
          pda: {
            seeds: [
              {
                kind: "const"
                type: "string"
                value: "REWARD_POINTS"
              },
              {
                kind: "account"
                type: "publicKey"
                account: "MerchantState"
                path: "merchant"
              }
            ]
          }
        },
        {
          name: "customerRewardTokenAccount"
          isMut: true
          isSigner: false
        },
        {
          name: "systemProgram"
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
    }
  ]
  accounts: [
    {
      name: "merchantState"
      type: {
        kind: "struct"
        fields: [
          {
            name: "authority"
            type: "publicKey"
          },
          {
            name: "paymentDestination"
            type: "publicKey"
          },
          {
            name: "rewardPointsMint"
            type: "publicKey"
          },
          {
            name: "rewardPointsBasisPoints"
            type: "u16"
          },
          {
            name: "loyaltyCollectionMint"
            type: "publicKey"
          },
          {
            name: "loyaltyDiscountBasisPoints"
            type: "u16"
          }
        ]
      }
    }
  ]
}

export const IDL: AnchorGrizzly = {
  version: "0.1.0",
  name: "anchor_grizzly",
  constants: [
    {
      name: "USDC_MINT_PLACEHOLDER",
      type: "publicKey",
      value: 'pubkey ! ("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr")',
    },
  ],
  instructions: [
    {
      name: "initMerchant",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "MERCHANT",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "authority",
              },
            ],
          },
        },
        {
          name: "usdcMintPlaceholder",
          isMut: false,
          isSigner: false,
        },
        {
          name: "paymentDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
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
      ],
      args: [],
    },
    {
      name: "initRewardPoints",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "MERCHANT",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "authority",
              },
            ],
          },
        },
        {
          name: "rewardPointsMint",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "REWARD_POINTS",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "MerchantState",
                path: "merchant",
              },
            ],
          },
        },
        {
          name: "metadataAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenMetadataProgram",
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
          name: "rewardPointsBasisPoints",
          type: "u16",
        },
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
      name: "transaction",
      accounts: [
        {
          name: "customer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merchant",
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "MERCHANT",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "authority",
              },
            ],
          },
        },
        {
          name: "paymentDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "customerUsdcTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "rewardPointsMint",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "REWARD_POINTS",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "MerchantState",
                path: "merchant",
              },
            ],
          },
        },
        {
          name: "customerRewardTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
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
      name: "createCollectionNft",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "MERCHANT",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "authority",
              },
            ],
          },
        },
        {
          name: "loyaltyCollectionMint",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "LOYALTY_NFT",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "MerchantState",
                path: "merchant",
              },
            ],
          },
        },
        {
          name: "metadataAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "masterEdition",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
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
          name: "tokenMetadataProgram",
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
          name: "loyaltyDiscountBasisPoints",
          type: "u16",
        },
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
          name: "customer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "MERCHANT",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "authority",
              },
            ],
          },
        },
        {
          name: "loyaltyCollectionMint",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "LOYALTY_NFT",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "MerchantState",
                path: "merchant",
              },
            ],
          },
        },
        {
          name: "collectionMetadataAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "collectionMasterEdition",
          isMut: true,
          isSigner: false,
        },
        {
          name: "customerNftMint",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "LOYALTY_NFT",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "MerchantState",
                path: "merchant",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "customer",
              },
            ],
          },
        },
        {
          name: "metadataAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "masterEdition",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
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
          name: "tokenMetadataProgram",
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
      name: "updateRewardPoints",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "MERCHANT",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "authority",
              },
            ],
          },
        },
      ],
      args: [
        {
          name: "rewardPointsBasisPoints",
          type: "u16",
        },
      ],
    },
    {
      name: "updateLoyaltyPoints",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "MERCHANT",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "authority",
              },
            ],
          },
        },
      ],
      args: [
        {
          name: "loyaltyDiscountBasisPoints",
          type: "u16",
        },
      ],
    },
    {
      name: "mintRewardPoints",
      accounts: [
        {
          name: "authority",
          isMut: true,
          isSigner: true,
        },
        {
          name: "customer",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merchant",
          isMut: false,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "MERCHANT",
              },
              {
                kind: "account",
                type: "publicKey",
                path: "authority",
              },
            ],
          },
        },
        {
          name: "rewardPointsMint",
          isMut: true,
          isSigner: false,
          pda: {
            seeds: [
              {
                kind: "const",
                type: "string",
                value: "REWARD_POINTS",
              },
              {
                kind: "account",
                type: "publicKey",
                account: "MerchantState",
                path: "merchant",
              },
            ],
          },
        },
        {
          name: "customerRewardTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
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
  ],
  accounts: [
    {
      name: "merchantState",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "paymentDestination",
            type: "publicKey",
          },
          {
            name: "rewardPointsMint",
            type: "publicKey",
          },
          {
            name: "rewardPointsBasisPoints",
            type: "u16",
          },
          {
            name: "loyaltyCollectionMint",
            type: "publicKey",
          },
          {
            name: "loyaltyDiscountBasisPoints",
            type: "u16",
          },
        ],
      },
    },
  ],
}
