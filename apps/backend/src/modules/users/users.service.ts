import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(data: Partial<User>): Promise<User> {
    if (!data.email) throw new ConflictException('Email is required');
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use');
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async updateRefreshToken(userId: string, token: string | null): Promise<void> {
    const hashed = token ? await argon2.hash(token) : null;
    await this.usersRepository.update(userId, { refreshToken: hashed as string });
  }

  async validateRefreshToken(userId: string, token: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user.refreshToken) return false;
    return argon2.verify(user.refreshToken, token);
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.findById(userId);
    const { passwordHash, refreshToken, twoFactorSecret, ...safe } = user;
    return safe;
  }
}
