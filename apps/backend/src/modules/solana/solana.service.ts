import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  transfer,
  getAccount,
  getMint,
} from '@solana/spl-token';
import bs58 from 'bs58';
import { User } from '../users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private connection: Connection;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {
    const rpcUrl =
      this.configService.get<string>('solana.rpcUrl') ||
      clusterApiUrl('devnet');
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  private getTreasuryKeypair(): Keypair {
    const privateKey = this.configService.get<string>(
      'solana.treasuryPrivateKey',
    );
    if (!privateKey) {
      throw new InternalServerErrorException(
        'Treasury wallet not configured',
      );
    }
    const decoded = bs58.decode(privateKey);
    return Keypair.fromSecretKey(decoded);
  }

  private getTokenMint(): PublicKey {
    const mintAddress = this.configService.get<string>(
      'solana.tokenMintAddress',
    );
    if (!mintAddress) {
      throw new InternalServerErrorException(
        '$SOKO token mint not configured',
      );
    }
    return new PublicKey(mintAddress);
  }

  async getNetworkInfo() {
    const network = this.configService.get<string>('solana.network');
    const slot = await this.connection.getSlot();
    const blockTime = await this.connection.getBlockTime(slot);
    return {
      network,
      slot,
      blockTime,
      rpcUrl: this.configService.get<string>('solana.rpcUrl'),
    };
  }

  async getWalletBalance(walletAddress: string): Promise<{
    sol: number
    soko: number | null
  }> {
    try {
      const pubkey = new PublicKey(walletAddress)
      const lamports = await this.connection.getBalance(pubkey)
      const sol = lamports / LAMPORTS_PER_SOL

      let soko: number | null = null
      try {
        const mint = this.getTokenMint()
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
          this.connection,
          this.getTreasuryKeypair(),
          mint,
          pubkey,
        )
        const accountInfo = await getAccount(
          this.connection,
          tokenAccount.address,
        )
        soko = Number(accountInfo.amount) / 1e9
      } catch {
        soko = 0
      }

      return { sol, soko }
    } catch {
      throw new BadRequestException('Invalid Solana wallet address')
    }
  }

  async getTokenInfo() {
    try {
      const mint = this.getTokenMint()
      const mintInfo = await getMint(this.connection, mint)
      return {
        mintAddress: mint.toBase58(),
        decimals: mintInfo.decimals,
        supply: Number(mintInfo.supply) / 10 ** mintInfo.decimals,
        isInitialized: mintInfo.isInitialized,
      }
    } catch {
      return {
        mintAddress: this.configService.get<string>('solana.tokenMintAddress'),
        decimals: 9,
        supply: null,
        isInitialized: false,
        note: 'Token not yet deployed on this network',
      }
    }
  }

  async transferSokoTokens(
    toWalletAddress: string,
    amount: number,
  ): Promise<string> {
    try {
      const treasury = this.getTreasuryKeypair()
      const mint = this.getTokenMint()
      const toPubkey = new PublicKey(toWalletAddress)

      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        treasury,
        mint,
        treasury.publicKey,
      )

      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        treasury,
        mint,
        toPubkey,
      )

      const amountInSmallestUnit = BigInt(Math.floor(amount * 1e9))

      const signature = await transfer(
        this.connection,
        treasury,
        fromTokenAccount.address,
        toTokenAccount.address,
        treasury,
        amountInSmallestUnit,
      )

      this.logger.log(
        `Transferred ${amount} $SOKO to ${toWalletAddress}: ${signature}`,
      )

      return signature
    } catch (error: any) {
      this.logger.error('Token transfer failed', error.message)
      throw new InternalServerErrorException(
        'Failed to transfer $SOKO tokens',
      )
    }
  }

  async airdropDevnetSol(walletAddress: string): Promise<string> {
    const network = this.configService.get<string>('solana.network')
    if (network !== 'devnet') {
      throw new BadRequestException('Airdrop only available on devnet')
    }

    try {
      const pubkey = new PublicKey(walletAddress)
      const signature = await this.connection.requestAirdrop(
        pubkey,
        LAMPORTS_PER_SOL,
      )
      await this.connection.confirmTransaction(signature)
      this.logger.log(`Airdropped 1 SOL to ${walletAddress}: ${signature}`)
      return signature
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Airdrop failed. Try again in a moment.',
      )
    }
  }

  async linkWallet(
    userId: string,
    walletAddress: string,
  ): Promise<{ message: string }> {
    try {
      new PublicKey(walletAddress)
    } catch {
      throw new BadRequestException('Invalid Solana wallet address')
    }

    await this.usersRepository.update(userId, {
      googleId: walletAddress,
    })

    this.logger.log(`Linked wallet ${walletAddress} to user ${userId}`)
    return { message: 'Wallet linked successfully' }
  }
}
