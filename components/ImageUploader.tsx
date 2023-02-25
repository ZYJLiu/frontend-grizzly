import {
  Text,
  Spinner,
  Input,
  Stack,
  Image,
  Container,
  AspectRatio,
  Box,
  Heading,
} from "@chakra-ui/react"
import { useState } from "react"
import axios from "axios"
import { PublicKey } from "@solana/web3.js"

interface ImageUploaderProps {
  imageUrl: string
  setImageUrl: (imageUrl: string) => void
  merchantPDA: PublicKey
  type: string
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  imageUrl,
  setImageUrl,
  merchantPDA,
  type,
}) => {
  const [loading, setLoading] = useState(false)

  // upload image to aws s3 bucket
  const handleImage = async (event: any) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", event.target.files[0])
      formData.append("merchantPDA", merchantPDA.toBase58())
      formData.append("tokenType", type)
      formData.append("fileType", "IMAGE")

      try {
        const response = await axios.post("/api/aws?path=image", formData)

        if (response) {
          console.log("File uploaded successfully")
          console.log(response.data)
          setImageUrl(response.data.imageUri)
        } else {
          console.error("Error uploading file")
        }
      } catch (err) {
        console.error("Error uploading file:", err)
      }
      setLoading(false)
    } catch (e) {
      console.log(e)
      setLoading(false)
    }
    setLoading(false)
  }

  return (
    <Container centerContent my="5">
      <AspectRatio width="60" ratio={1}>
        <Box
          borderColor="gray.300"
          borderStyle="dashed"
          borderWidth="2px"
          rounded="md"
        >
          <Box position="relative" height="100%" width="100%">
            <Box
              position="absolute"
              top="0"
              left="0"
              height="100%"
              width="100%"
              display="flex"
              flexDirection="column"
            >
              {loading ? (
                <Stack
                  height="100%"
                  width="100%"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Spinner size="lg" color="blue.500" />
                </Stack>
              ) : imageUrl ? (
                <Image src={imageUrl} />
              ) : (
                <Stack
                  height="100%"
                  width="100%"
                  display="flex"
                  alignItems="center"
                  justify="center"
                  spacing="4"
                >
                  <Stack p="8" textAlign="center" spacing="1">
                    <Heading fontSize="lg" color="white" fontWeight="bold">
                      Drop image here
                    </Heading>
                    <Text fontWeight="light">Click to upload image</Text>
                  </Stack>
                </Stack>
              )}
            </Box>
            <Input
              type="file"
              height="100%"
              width="100%"
              position="absolute"
              top="0"
              left="0"
              opacity="0"
              aria-hidden="true"
              accept="image/*"
              onChange={handleImage}
            />
          </Box>
        </Box>
      </AspectRatio>
    </Container>
  )
}
