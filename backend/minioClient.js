import { Client } from "minio";

const minioClient = new Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: "purchase",
  secretKey: "purchase1234",
});

export default minioClient;
