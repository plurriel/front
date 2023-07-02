import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = ((globalThis as any).s3Client as S3Client | undefined) || new S3Client({
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY as string,
    secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY as string,
  },
  endpoint: process.env.BUCKET_URL as string,
});

(globalThis as any).s3Client = s3Client;
