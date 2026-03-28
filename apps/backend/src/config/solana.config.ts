import { registerAs } from '@nestjs/config';

export default registerAs('solana', () => ({
  network: process.env.SOLANA_NETWORK || 'devnet',
  rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  tokenMintAddress: process.env.SOKO_TOKEN_MINT_ADDRESS,
  treasuryWallet: process.env.SOKO_TREASURY_WALLET,
  treasuryPrivateKey: process.env.SOLANA_TREASURY_PRIVATE_KEY,
}));
