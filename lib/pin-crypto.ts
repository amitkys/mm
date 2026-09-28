import { hash, verify } from "@node-rs/argon2";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";

const ARGON2_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
  outputLen: 32,
} as const;

function getPinPepper() {
  const secret = process.env.PIN_PEPPER ?? process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("PIN_PEPPER or BETTER_AUTH_SECRET must be configured");
  }

  return createHash("sha256")
    .update("mm-pin-pepper-v1")
    .update(secret)
    .digest();
}

export function hashPin(pin: string) {
  return hash(pin, {
    ...ARGON2_OPTIONS,
    secret: getPinPepper(),
  });
}

export function verifyPinHash(pinHash: string, pin: string) {
  if (pinHash.startsWith("$argon2")) {
    return verify(pinHash, pin, { secret: getPinPepper() });
  }

  // Existing installations used bcrypt for four-digit PINs. Keep them
  // verifiable until the user changes to a new six-digit PIN.
  return bcrypt.compare(pin, pinHash);
}
