import { describe, expect, it } from "vitest";
import { parseFrame, sampleUdpFrame } from "./packet";

describe("parseFrame", () => {
  it("reads the sample Ethernet, IPv4 and UDP headers", () => {
    const parsed = parseFrame(sampleUdpFrame());
    expect(parsed).toMatchObject({
      dstMac: "ff:ff:ff:ff:ff:ff",
      srcMac: "02:00:00:00:00:01",
      etherType: 0x0800,
      ipv4: { src: "192.168.1.10", dst: "192.168.1.20", protocol: 17 },
      udp: { srcPort: 5000, dstPort: 1234, length: 11 },
    });
    if ("udp" in parsed && parsed.udp) {
      expect(new TextDecoder().decode(parsed.udp.payload)).toBe("SEA");
    }
  });

  it("rejects a short frame", () => {
    expect(parseFrame(new Uint8Array(8))).toEqual({ error: "帧短于 14 字节，没有完整的以太网头" });
  });
});
