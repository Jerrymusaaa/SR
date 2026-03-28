import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInquiryDto {
  @ApiProperty({ example: 'itmpl_xxx', required: false })
  @IsOptional()
  @IsString()
  templateId?: string;
}
