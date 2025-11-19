import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { redis, assertRedisEnv } from "@/lib/redis";
import { createSealedKeypair } from "@/lib/solana";
import { createPresaleSchema } from "@/lib/validation";
import type { Presale } from "@/lib/types";

export async function GET() {
  assertRedisEnv();
  const ids = await redis.zrange("presales:index", 0, -1);
  const items: Array<Omit<Presale, "walletSealedSecret"> & { closeAt?: number }> = [];
  for (const id of ids) {
    const data = await redis.hgetall<Presale>(`presales:${id}`);
    if (data) {
      const { walletSealedSecret: _secret, ...pub } = data as any;
      const fallbackCloseAt = pub.closeAt ?? pub.launchAt ?? (pub.createdAt ? pub.createdAt + 30 * 60_000 : undefined);
      items.push({ ...pub, closeAt: fallbackCloseAt });
    }
  }
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    assertRedisEnv();
    const body = await req.json();
    const parsed = createPresaleSchema.parse(body);
    const id = randomUUID();
    const { publicKey, sealedSecret } = createSealedKeypair();
    const createdAt = Date.now();
    const closeAt = createdAt + parsed.durationMinutes * 60_000;
    const record: Presale = {
      id,
      creator: parsed.creator,
      tokenName: parsed.tokenName,
      tokenSymbol: parsed.tokenSymbol,
      description: parsed.description,
      imageUrl: parsed.imageUrl,
      twitter: parsed.twitter,
      telegram: parsed.telegram,
      website: parsed.website,
      maxSol: 30,
      raisedLamports: 0,
      walletPublicKey: publicKey,
      walletSealedSecret: sealedSecret,
      closeAt,
      createdAt,
    };
    const storeRecord = Object.fromEntries(
      Object.entries(record).filter(([, v]) => v !== undefined && v !== null)
    ) as Record<string, unknown>;
    await redis.hset(`presales:${id}`, storeRecord);
    await redis.zadd("presales:index", { score: record.createdAt, member: id });
    const { walletSealedSecret: _secret, ...pub } = record;
    return NextResponse.json(pub, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

