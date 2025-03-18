import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import config from "../../config/config";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
    });

    this.bucketName = config.s3.bucketName;
  }

  // Generating pre-signed url to upload files to
  async generateUploadUrl(
    fileName: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    try {
      const key = `uploads/${uuidv4()}/${fileName}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      console.log(url);

      return { url, key };
    } catch (error) {
      console.error(`Error: ${error}`);
      throw new Error(`${error}`);
    }
  }

  // Generating download url

  async generateDownloadUrl(key: string, fileName?: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ResponseContentDisposition: fileName
          ? `attachment; filename="${encodeURIComponent(fileName)}"`
          : undefined,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 86400,
      });

      return url as string;
    } catch (error) {
      console.error(`Error: ${error}`);
      throw new Error(`${error}`);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      console.log(`Deleted the file with key ${key}`);
    } catch (error) {
      console.error(`Error: ${error}`);
      throw new Error(`${error}`);
    }
  }
}

export default new S3Service();