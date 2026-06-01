import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

@Module({
  controllers: [VerificationController],
  providers: [VerificationService, CloudinaryService],
  exports: [VerificationService, CloudinaryService],
})
export class VerificationModule {}