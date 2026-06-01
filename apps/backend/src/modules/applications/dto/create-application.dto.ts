import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  proposedRate?: number;
}