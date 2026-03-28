import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import { User, KycStatus } from '../users/entities/user.entity';
import { PersonaWebhookDto } from './dto/webhook.dto';

@Injectable()
export class KycService {
  private readonly logger = new Logger(KycService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  private get apiKey(): string {
    const key = this.configService.get<string>('persona.apiKey');
    if (!key) throw new InternalServerErrorException('Persona API key not configured');
    return key;
  }

  private get baseUrl(): string {
    return 'https://withpersona.com/api/v1';
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Persona-Version': '2023-01-05',
    };
  }

  async createInquiry(
    userId: string,
    templateId?: string,
  ): Promise<{ inquiryId: string; sessionToken: string; inquiryUrl: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    if (user.kycStatus === KycStatus.APPROVED) {
      throw new BadRequestException('User is already KYC verified');
    }

    const template =
      templateId ||
      this.configService.get<string>('persona.templateId');

    if (!template) {
      throw new InternalServerErrorException('Persona template ID not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/inquiries`,
        {
          data: {
            type: 'inquiry',
            attributes: {
              'inquiry-template-id': template,
              'reference-id': userId,
              fields: {
                emailAddress: { value: user.email },
              },
            },
          },
        },
        { headers: this.headers },
      );

      const inquiry = response.data.data;
      const sessionToken = response.data.meta?.['session-token'];

      await this.usersRepository.update(userId, {
        kycStatus: KycStatus.PENDING,
      });

      this.logger.log(`KYC inquiry created for user ${userId}: ${inquiry.id}`);

      return {
        inquiryId: inquiry.id,
        sessionToken,
        inquiryUrl: `https://withpersona.com/verify?inquiry-id=${inquiry.id}&session-token=${sessionToken}`,
      };
    } catch (error: any) {
      this.logger.error('Failed to create Persona inquiry', error?.response?.data);
      throw new InternalServerErrorException('Failed to initiate KYC verification');
    }
  }

  async getInquiryStatus(inquiryId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/inquiries/${inquiryId}`,
        { headers: this.headers },
      );

      const inquiry = response.data.data;
      return {
        id: inquiry.id,
        status: inquiry.attributes.status,
        createdAt: inquiry.attributes['created-at'],
        completedAt: inquiry.attributes['completed-at'],
      };
    } catch (error: any) {
      this.logger.error('Failed to get inquiry status', error?.response?.data);
      throw new InternalServerErrorException('Failed to fetch KYC status');
    }
  }

  async getUserKycStatus(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return {
      kycStatus: user.kycStatus,
      canDeposit: user.kycStatus === KycStatus.APPROVED,
      canWithdraw: user.kycStatus === KycStatus.APPROVED,
      canBet: true,
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = this.configService.get<string>('persona.webhookSecret');
    if (!webhookSecret) {
      this.logger.warn('Persona webhook secret not configured');
      return true;
    }

    try {
      const parts = signature.split(',');
      const tPart = parts.find((p) => p.startsWith('t='));
      const v1Part = parts.find((p) => p.startsWith('v1='));

      if (!tPart || !v1Part) return false;

      const timestamp = tPart.split('=')[1];
      const receivedSig = v1Part.split('=')[1];
      const signedPayload = `${timestamp}.${payload}`;

      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(expectedSig),
        Buffer.from(receivedSig),
      );
    } catch {
      return false;
    }
  }

  async handleWebhook(
    payload: PersonaWebhookDto,
    rawBody: string,
    signature: string,
  ): Promise<void> {
    if (!this.verifyWebhookSignature(rawBody, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const { data } = payload;
    const { type, attributes } = data;
    const userId = attributes.referenceId;

    this.logger.log(`Persona webhook received: ${type} for user ${userId}`);

    if (!userId) {
      this.logger.warn('Webhook received without referenceId');
      return;
    }

    if (type === 'inquiry.completed' || attributes.status === 'completed') {
      await this.usersRepository.update(userId, {
        kycStatus: KycStatus.APPROVED,
      });
      this.logger.log(`KYC approved for user ${userId}`);
    } else if (
      type === 'inquiry.failed' ||
      attributes.status === 'failed' ||
      attributes.status === 'declined'
    ) {
      await this.usersRepository.update(userId, {
        kycStatus: KycStatus.REJECTED,
      });
      this.logger.log(`KYC rejected for user ${userId}`);
    } else if (attributes.status === 'pending') {
      await this.usersRepository.update(userId, {
        kycStatus: KycStatus.PENDING,
      });
    }
  }

  async approveKycManually(userId: string): Promise<{ message: string }> {
    await this.usersRepository.update(userId, {
      kycStatus: KycStatus.APPROVED,
    });
    this.logger.log(`KYC manually approved for user ${userId}`);
    return { message: 'KYC approved successfully' };
  }

  async rejectKycManually(userId: string): Promise<{ message: string }> {
    await this.usersRepository.update(userId, {
      kycStatus: KycStatus.REJECTED,
    });
    this.logger.log(`KYC manually rejected for user ${userId}`);
    return { message: 'KYC rejected' };
  }
}
