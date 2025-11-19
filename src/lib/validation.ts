import { z } from "zod";

const optionalUrl = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().url().optional());

export const createPresaleSchema = z.object({
  creator: z.string().min(32),
  tokenName: z.string().min(1).max(32),
  tokenSymbol: z.string().min(1).max(10),
  imageUrl: z.string().url(),
  description: z.string().max(280).optional(),
  twitter: optionalUrl,
  telegram: optionalUrl,
  website: optionalUrl,
  durationMinutes: z.number().int().min(30).max(720),
});

export const contributeSchema = z.object({
  contributor: z.string().min(32),
  amountSol: z.number().positive().max(30),
  signature: z.string().min(64),
});

