import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";
import { encryptSealed, decryptSealed } from "./crypto";

export function getClusterUrl(): string {
  if (typeof window === "undefined") {
    return process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";
  }
  return "/api/solana";
}

export function getConnection(): Connection {
  const url = getClusterUrl();
  return new Connection(url, "confirmed");
}

export function createSealedKeypair(): { publicKey: string; sealedSecret: string } {
  const kp = Keypair.generate();
  const secret = bs58.encode(kp.secretKey);
  const sealedSecret = encryptSealed(secret);
  return { publicKey: kp.publicKey.toBase58(), sealedSecret };
}

export function unsealKeypair(sealedSecret: string): Keypair {
  const secret58 = decryptSealed(sealedSecret);
  const secretKey = bs58.decode(secret58);
  return Keypair.fromSecretKey(secretKey);
}

export async function getBalance(pubkey: string): Promise<number> {
  const conn = getConnection();
  const lamports = await conn.getBalance(new PublicKey(pubkey));
  return lamports / LAMPORTS_PER_SOL;
}

export async function validateTransferSignature(sig: string, from: string, to: string, minLamports: number) {
  const conn = getConnection();
  const parsed = await conn.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0, commitment: "confirmed" });
  if (!parsed) return false;
  const ix = parsed.transaction.message.instructions.find((i: any) => i.program === "system" && i.parsed?.type === "transfer");
  if (!ix) return false;
  const info = (ix as any).parsed?.info || {};
  const source = info.source as string | undefined;
  const dest = info.destination as string | undefined;
  const lamports = Number(info.lamports ?? 0);
  return source === from && dest === to && lamports >= minLamports;
}

