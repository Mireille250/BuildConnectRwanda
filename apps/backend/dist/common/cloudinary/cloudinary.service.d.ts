import { ConfigService } from '@nestjs/config';
import { UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    uploadFile(buffer: Buffer, folder: string, resourceType?: 'image' | 'raw' | 'auto'): Promise<UploadApiResponse>;
    deleteFile(publicId: string): Promise<void>;
}
