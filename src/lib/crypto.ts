import crypto from "node:crypto";

const REQUIRED_KEY_BYTES = 32;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || "";
  if (!key) throw new Error("ENCRYPTION_KEY is required");
  const keyBuf = /^[0-9a-fA-F]+$/.test(key)
    ? Buffer.from(key, "hex")
    : Buffer.from(key);
  if (keyBuf.length !== REQUIRED_KEY_BYTES) {
    throw new Error("ENCRYPTION_KEY must be 32 bytes (hex or utf8)");
  }
  return keyBuf;
}

export function encryptSealed(data: string): string {
  const iv = crypto.randomBytes(12);
  const key = getKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptSealed(payload: string): string {
  const buf = Buffer.from(payload, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const key = getKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}

