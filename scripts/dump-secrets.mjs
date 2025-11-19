import "dotenv/config";
import { Redis } from "@upstash/redis";
import crypto from "node:crypto";

const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, ENCRYPTION_KEY } = process.env;
if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN || !ENCRYPTION_KEY) {
  console.error("Missing env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, ENCRYPTION_KEY");
  process.exit(1);
}

const redis = new Redis({ url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN });

function getKey() {
  const k = ENCRYPTION_KEY;
  const isHex = /^[0-9a-fA-F]{64}$/.test(k || "");
  const buf = isHex ? Buffer.from(k, "hex") : Buffer.from(k || "");
  if (buf.length !== 32) {
    console.error("ENCRYPTION_KEY must be 32 bytes (64-char hex or 32 utf8 bytes)");
    process.exit(1);
  }
  return buf;
}

function decryptSealed(payload) {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

async function main() {
  let ids = await redis.zrange("presales:index", 0, -1);
  if (!ids || ids.length === 0) {
    // Fallback: scan keys if index is empty/missing (debug/maintenance use only)
    try {
      const keys = await redis.keys("presales:*");
      ids = (keys || [])
        .map((k) => String(k))
        .filter((k) => /^presales:[^:]+$/.test(k))
        .map((k) => k.split(":")[1]);
    } catch {}
  }
  const out = [];
  for (const id of ids) {
    const rec = await redis.hgetall(`presales:${id}`);
    if (!rec) continue;
    const sealed = rec.walletSealedSecret || rec.sealedSecret;
    if (!sealed) continue;
    let base58Secret = null;
    try {
      base58Secret = decryptSealed(sealed);
    } catch (e) {
      base58Secret = null;
    }
    out.push({
      id,
      walletPublicKey: rec.walletPublicKey,
      base58Secret,
      creator: rec.creator,
      createdAt: rec.createdAt ? Number(rec.createdAt) : undefined,
      closeAt: rec.closeAt ? Number(rec.closeAt) : rec.launchAt ? Number(rec.launchAt) : undefined,
    });
  }
  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


