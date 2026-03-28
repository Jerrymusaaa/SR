import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { PersonaWebhookDto } from './dto/webhook.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('KYC')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @ApiOperation({ summary: 'Get current KYC status' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus(@Request() req) {
    return this.kycService.getUserKycStatus(req.user.sub);
  }

  @ApiOperation({ summary: 'Create a new KYC inquiry' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('inquiry')
  createInquiry(@Request() req, @Body() dto: CreateInquiryDto) {
    return this.kycService.createInquiry(req.user.sub, dto.templateId);
  }

  @ApiOperation({ summary: 'Get inquiry status by ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('inquiry/:inquiryId')
  getInquiryStatus(@Param('inquiryId') inquiryId: string) {
    return this.kycService.getInquiryStatus(inquiryId);
  }

  @ApiOperation({ summary: 'Persona webhook callback' })
  @HttpCode(HttpStatus.OK)
  @Post('webhook')
  async handleWebhook(
    @Body() payload: PersonaWebhookDto,
    @Headers('persona-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody?.toString() || JSON.stringify(payload);
    await this.kycService.handleWebhook(payload, rawBody, signature);
    return { received: true };
  }

  @ApiOperation({ summary: 'Manually approve KYC (admin/testing)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('approve/:userId')
  approveManually(@Param('userId') userId: string) {
    return this.kycService.approveKycManually(userId);
  }

  @ApiOperation({ summary: 'Manually reject KYC (admin/testing)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('reject/:userId')
  rejectManually(@Param('userId') userId: string) {
    return this.kycService.rejectKycManually(userId);
  }
}
