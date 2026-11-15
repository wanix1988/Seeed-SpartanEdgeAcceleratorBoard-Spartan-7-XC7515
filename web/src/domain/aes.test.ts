import { describe, expect, it } from "vitest";
import { aes128Encrypt, bytesToHex, hexToBytes } from "./aes";

describe("aes128Encrypt", () => {
  it("matches the FIPS-197 AES-128 vector", () => {
    const key = hexToBytes("000102030405060708090a0b0c0d0e0f");
    const block = hexToBytes("00112233445566778899aabbccddeeff");
    expect(key).not.toBeNull();
    expect(block).not.toBeNull();
    if (!key || !block) return;
    expect(bytesToHex(aes128Encrypt(key, block))).toBe("69c4e0d86a7b0430d8cdb78070b4c55a");
  });
});
