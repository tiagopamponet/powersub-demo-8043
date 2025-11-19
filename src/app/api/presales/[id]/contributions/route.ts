import { NextRequest, NextResponse } from "next/server";
import { redis, assertRedisEnv } from "@/lib/redis";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  assertRedisEnv();
  const { id } = await context.params;
  const key = `presales:${id}:contribs`;
  const items = await redis.lrange(key, 0, -1);
  const parsed = (items as any[]).map((i) => {
    if (typeof i === "string") {
      try {
        return JSON.parse(i);
      } catch {
        return null;
      }
    }
    if (i && typeof i === "object") return i;
    return null;
  }).filter(Boolean);
  return NextResponse.json(parsed);
}

