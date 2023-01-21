// Interfaces used for the Square API responses
export interface CatalogData {
  objects: {
    type: string
    id: string
    updatedAt: string
    version: string
    isDeleted: boolean
    presentAtAllLocations: boolean
    itemData: {
      name: string
      description: string
      labelColor: string
      categoryId: string
      variations: {
        type: string
        id: string
        updatedAt: string
        version: string
        isDeleted: boolean
        presentAtAllLocations: boolean
        itemVariationData: {
          itemId: string
          name: string
          sku: string
          ordinal: number
          pricingType: string
          priceMoney: {
            amount: string
            currency: string
          }
          trackInventory: boolean
          sellable: boolean
          stockable: boolean
        }
      }[]
      productType: string
      skipModifierScreen: boolean
      imageIds: string[]
      descriptionHtml: string
      descriptionPlaintext: string
    }
  }[]
}

export interface Item {
  id: string
  name: string
  description: string
  variationId: string
  price: string
  quantity: number
}

export type Items = { [key: string]: Item }

export type ItemData = {
  type: string
  id: string
  updatedAt: string
  version: string
  isDeleted: boolean
  presentAtAllLocations: boolean
  itemData: {
    name: string
    description: string
    labelColor: string
    categoryId: string
    variations: [
      {
        type: string
        id: string
        updatedAt: string
        version: string
        isDeleted: boolean
        presentAtAllLocations: boolean
        itemVariationData: {
          itemId: string
          name: string
          sku: string
          ordinal: number
          pricingType: string
          priceMoney: {
            amount: string
            currency: string
          }
          trackInventory: boolean
          sellable: boolean
          stockable: boolean
        }
      }
    ]
    productType: string
    skipModifierScreen: boolean
    imageIds: string[]
    descriptionHtml: string
    descriptionPlaintext: string
  }
}

export interface Order {
  order: {
    id: string
    locationId: string
    source: {
      name: string
    }
    lineItems: {
      uid: string
      name: string
      quantity: string
      catalogObjectId: string
      catalogVersion: string
      variationName: string
      itemType: string
      appliedDiscounts: {
        uid: string
        discountUid: string
        appliedMoney: {
          amount: string
          currency: string
        }
      }[]
      basePriceMoney: {
        amount: string
        currency: string
      }
      variationTotalPriceMoney: {
        amount: string
        currency: string
      }
      grossSalesMoney: {
        amount: string
        currency: string
      }
      totalTaxMoney: {
        amount: string
        currency: string
      }
      totalDiscountMoney: {
        amount: string
        currency: string
      }
      totalMoney: {
        amount: string
        currency: string
      }
    }[]
    discounts: {
      uid: string
      name: string
      type: string
      percentage: string
      appliedMoney: {
        amount: string
        currency: string
      }
    }[]
    netAmounts: {
      totalMoney: {
        amount: string
        currency: string
      }
      taxMoney: {
        amount: string
        currency: string
      }
      discountMoney: {
        amount: string
        currency: string
      }
      tipMoney: {
        amount: string
        currency: string
      }
      serviceChargeMoney: {
        amount: string
        currency: string
      }
    }
    createdAt: string
    updatedAt: string
    state: string
    version: number
    totalMoney: {
      amount: string
      currency: string
    }
    totalTaxMoney: {
      amount: string
      currency: string
    }
    totalDiscountMoney: {
      amount: string
      currency: string
    }
    totalTipMoney: {
      amount: string
      currency: string
    }
    totalServiceChargeMoney: {
      amount: string
      currency: string
    }
    netAmountDueMoney: {
      amount: string
      currency: string
    }
  }
}

export type OrderDetail = {
  orderId: string
  netAmountDueAmount: string
}

export interface Payment {
  payment: {
    id: string
    createdAt: string
    amountMoney: {
      amount: string
      currency: string
    }
    totalMoney: {
      amount: string
      currency: string
    }
    status: string
    sourceType: string
    externalDetails: {
      type: string
      source: string
      sourceFeeMoney: {
        amount: string
        currency: string
      }
    }
    locationId: string
    orderId: string
    capabilities: string[]
    receiptNumber: string
    receiptUrl: string
    applicationDetails: {
      squareProduct: string
      applicationId: string
    }
    versionToken: string
  }
}
