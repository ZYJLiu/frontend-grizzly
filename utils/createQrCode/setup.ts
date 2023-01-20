import { createQR, encodeURL, TransactionRequestURLFields } from "@solana/pay"
import { PublicKey } from "@solana/web3.js"
import { RefObject } from "react"

export const createQRCode = (
  qrRef: RefObject<HTMLDivElement>,
  reference: PublicKey
) => {
  // Build the API URL with the `reference` parameter
  const params = new URLSearchParams()
  params.append("reference", reference.toString())
  const apiUrl = `${location.protocol}//${
    location.host
  }/api/setup?${params.toString()}`

  // Encode the API URL into a QR code
  const urlFields: TransactionRequestURLFields = {
    link: new URL(apiUrl),
  }
  const url = encodeURL(urlFields)
  const qr = createQR(url, 400, "transparent")

  // Append the QR code to the element specified by the `qrRef` ref object
  if (qrRef.current) {
    qrRef.current.innerHTML = ""
    qr.append(qrRef.current)
  }
}
