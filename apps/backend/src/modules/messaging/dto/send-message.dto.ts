import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  conversationId: string;
}