import { S3Client } from "@aws-sdk/client-s3";

// MinIO S3クライアント
export const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: "auto",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY as string,
    secretAccessKey: process.env.S3_SECRET_KEY as string,
  },
  forcePathStyle: true,
});
