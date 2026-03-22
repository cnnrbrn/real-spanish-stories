import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow("S3_BUCKET");
    this.client = new S3Client({
      region: this.configService.getOrThrow("AWS_REGION"),
      credentials: {
        accessKeyId: this.configService.getOrThrow("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.getOrThrow("AWS_SECRET_ACCESS_KEY"),
      },
    });
  }

  async download(key: string): Promise<Buffer> {
    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    return Buffer.from(await response.Body!.transformToByteArray());
  }
}
