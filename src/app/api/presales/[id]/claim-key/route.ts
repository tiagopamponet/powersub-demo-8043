import { NextRequest, NextResponse } from "next/server";
import { redis, assertRedisEnv } from "@/lib/redis";
import type { Presale } from "@/lib/types";
// Private key must remain only in DB; do not expose.

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertRedisEnv();
    const { id } = await context.params;
    const { requester } = await req.json();
    if (!requester) return NextResponse.json({ error: "Missing requester" }, { status: 400 });
    const presale = await redis.hgetall<Presale>(`presales:${id}`);
    if (!presale) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (presale.creator !== requester) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    return NextResponse.json({ walletPublicKey: presale.walletPublicKey });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

