import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const upstream = process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.devnet.solana.com";
  const body = await req.text();
  const res = await fetch(upstream, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });
  const text = await res.text();
  return new NextResponse(text, { status: res.status, headers: { "Content-Type": res.headers.get("content-type") || "application/json" } });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

