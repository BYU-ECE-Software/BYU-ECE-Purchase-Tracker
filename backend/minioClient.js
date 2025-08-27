import { Client } from "minio";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

// 1) Internal client: used for actual I/O (uploads, getObject, etc.).
//    Talks to MinIO over the Docker network using service name "minio".
export const minioInternal = new Client({
  endPoint: process.env.MINIO_ENDPOINT, // "minio" (from compose)
  port: parseInt(process.env.MINIO_PORT, 10),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
});

// 2) Signer client: used ONLY to create presigned URLs for the BROWSER.
//    Uses PUBLIC_MINIO_URL (e.g., http://host.docker.internal:9000)
const pub = new URL(
  process.env.PUBLIC_MINIO_URL || "http://host.docker.internal:9000"
);
export const minioSigner = new Client({
  endPoint: pub.hostname, // "host.docker.internal"
  port: Number(pub.port || (pub.protocol === "https:" ? 443 : 80)),
  useSSL: pub.protocol === "https:",
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
});

export default minioInternal;
