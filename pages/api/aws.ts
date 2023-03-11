// Uploads a NFT image/metadata  to AWS S3 and returns the URI
import type { NextApiRequest, NextApiResponse } from "next"
import fs from "fs"
import { Metaplex, toMetaplexFile, MetaplexFile } from "@metaplex-foundation/js"
import { awsStorage } from "@metaplex-foundation/js-plugin-aws"
import { S3Client } from "@aws-sdk/client-s3"
import { IncomingForm } from "formidable"
import * as web3 from "@solana/web3.js"

const awsClient = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
})

const connection = new web3.Connection(web3.clusterApiUrl("devnet"))
const metaplex = Metaplex.make(connection).use(
  awsStorage(awsClient, "metaplex-test-upload")
)

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const form = new IncomingForm({
      multiples: false,
      uploadDir: "/tmp",
      keepExtensions: true,
    })
    const { fields, files } = await new Promise<{ fields: any; files: any }>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            console.error("Error parsing form data:", err)
            return reject(err)
          }
          console.log("Parsed form data:", fields, files)
          resolve({ fields, files })
        })
      }
    )
    console.log(fields.merchantPDA)

    if (req.query.path === "image") {
      console.log("File path:", files.file.filepath)
      const fileBuffer = fs.readFileSync(files.file.filepath)
      const file: MetaplexFile = await toMetaplexFile(fileBuffer, "", {
        uniqueName: `${fields.merchantPDA}-${fields.tokenType}-${fields.fileType}`,
        contentType: files.file.mimetype,
      })
      const imageUri = await metaplex.storage().upload(file)
      console.log("Image URI:", imageUri)
      res.status(200).json({ imageUri })
    }

    if (req.query.path === "json") {
      const fileBuffer = fs.readFileSync(files.data.filepath)
      const file: MetaplexFile = await toMetaplexFile(fileBuffer, "", {
        uniqueName: `${fields.merchantPDA}-${fields.tokenType}-${fields.fileType}`,
        contentType: files.data.mimetype,
      })
      const metadataUri = await metaplex.storage().upload(file)
      console.log("Metadata URI:", metadataUri)
      res.status(200).json({ metadataUri })
      // res.status(200).json({})
    }
  }

  //   console.log(file)
}
