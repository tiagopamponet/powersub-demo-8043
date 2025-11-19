import { NextRequest, NextResponse } from "next/server";
import { redis, assertRedisEnv } from "@/lib/redis";
import { contributeSchema } from "@/lib/validation";
import type { Presale, Contribution } from "@/lib/types";
import { validateTransferSignature } from "@/lib/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertRedisEnv();
    const { id } = await context.params;
    const presale = await redis.hgetall<Presale>(`presales:${id}`);
    if (!presale) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (presale.closeAt && Date.now() >= presale.closeAt) {
      return NextResponse.json({ error: "Presale closed" }, { status: 400 });
    }
    const body = await req.json();
    const parsed = contributeSchema.parse(body);
    const amountLamports = Math.round(parsed.amountSol * LAMPORTS_PER_SOL);
    const valid = await validateTransferSignature(
      parsed.signature,
      parsed.contributor,
      presale.walletPublicKey,
      amountLamports
    );
    if (!valid) return NextResponse.json({ error: "Invalid transfer" }, { status: 400 });
    const newRaised = (presale.raisedLamports || 0) + amountLamports;
    const capLamports = presale.maxSol * LAMPORTS_PER_SOL;
    if (newRaised > capLamports) {
      return NextResponse.json({ error: "Presale cap exceeded" }, { status: 400 });
    }
    const contribution: Contribution = {
      presaleId: id,
      contributor: parsed.contributor,
      amountLamports,
      signature: parsed.signature,
      createdAt: Date.now(),
    };
    await redis.hincrby(`presales:${id}`, "raisedLamports", amountLamports);
    await redis.lpush(`presales:${id}:contribs`, JSON.stringify(contribution));
    return NextResponse.json({ ok: true, newRaisedLamports: newRaised });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

