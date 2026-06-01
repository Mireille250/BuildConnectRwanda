import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key:    this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload a file buffer to Cloudinary.
   * Returns the secure URL of the uploaded file.
   */
  async uploadFile(
    buffer: Buffer,
    folder: string,
    resourceType: 'image' | 'raw' | 'auto' = 'auto',
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: resourceType,
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            max_bytes: 5 * 1024 * 1024, // 5MB limit
          },
          (error, result) => {
            if (error) {
              this.logger.error('Cloudinary upload failed', error);
              reject(error);
            } else {
              resolve(result!);
            }
          },
        )
        .end(buffer);
    });
  }

  /**
   * Delete a file from Cloudinary by its public_id.
   */
  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}