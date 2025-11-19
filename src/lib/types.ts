export type Presale = {
  id: string;
  creator: string;
  tokenName: string;
  tokenSymbol: string;
  description?: string;
  imageUrl?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  maxSol: number;
  raisedLamports: number;
  walletPublicKey: string;
  walletSealedSecret: string;
  closeAt: number;
  createdAt: number;
};

export type Contribution = {
  presaleId: string;
  contributor: string;
  amountLamports: number;
  signature: string;
  createdAt: number;
};

