import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum VerificationDecision {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewDocumentDto {
  @IsEnum(VerificationDecision)
  decision: VerificationDecision;

  @IsOptional()
  @IsString()
  adminNote?: string;
}