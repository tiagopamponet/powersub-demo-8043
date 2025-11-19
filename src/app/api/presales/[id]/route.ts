import { NextRequest, NextResponse } from "next/server";
import { redis, assertRedisEnv } from "@/lib/redis";
import type { Presale } from "@/lib/types";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  assertRedisEnv();
  const { id } = await context.params;
  const data = await redis.hgetall<Presale>(`presales:${id}`);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { walletSealedSecret: _secret, ...pub } = data as any;
  const closeAt = pub.closeAt ?? pub.launchAt ?? (pub.createdAt ? pub.createdAt + 30 * 60_000 : undefined);
  return NextResponse.json({ ...pub, closeAt });
}

