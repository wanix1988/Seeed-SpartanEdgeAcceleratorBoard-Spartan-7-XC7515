export type Ipv4Header = {
  src: string;
  dst: string;
  protocol: number;
  headerBytes: number;
};

export type UdpHeader = {
  srcPort: number;
  dstPort: number;
  length: number;
  payload: Uint8Array;
};

export type ParsedFrame = {
  dstMac: string;
  srcMac: string;
  etherType: number;
  ipv4?: Ipv4Header;
  udp?: UdpHeader;
};

function mac(bytes: Uint8Array, offset: number): string {
  return [...bytes.slice(offset, offset + 6)].map((byte) => byte.toString(16).padStart(2, "0")).join(":");
}

function ipv4(bytes: Uint8Array, offset: number): string {
  return [...bytes.slice(offset, offset + 4)].join(".");
}

export function parseFrame(frame: Uint8Array): ParsedFrame | { error: string } {
  if (frame.length < 14) return { error: "帧短于 14 字节，没有完整的以太网头" };
  const etherType = (frame[12] << 8) | frame[13];
  const parsed: ParsedFrame = {
    dstMac: mac(frame, 0),
    srcMac: mac(frame, 6),
    etherType,
  };
  if (etherType !== 0x0800) return parsed;
  if (frame.length < 34) return { error: "声明了 IPv4，但头部不完整" };
  const versionIhl = frame[14];
  if ((versionIhl >> 4) !== 4) return { error: "EtherType 是 IPv4，版本字段却不是 4" };
  const headerBytes = (versionIhl & 0x0f) * 4;
  if (headerBytes < 20 || frame.length < 14 + headerBytes) return { error: "IPv4 头部长度不够" };
  parsed.ipv4 = {
    src: ipv4(frame, 26),
    dst: ipv4(frame, 30),
    protocol: frame[23],
    headerBytes,
  };
  if (parsed.ipv4.protocol !== 17) return parsed;
  const udpAt = 14 + headerBytes;
  if (frame.length < udpAt + 8) return { error: "声明了 UDP，但头部不完整" };
  const length = (frame[udpAt + 4] << 8) | frame[udpAt + 5];
  const payloadEnd = Math.min(frame.length, udpAt + length);
  parsed.udp = {
    srcPort: (frame[udpAt] << 8) | frame[udpAt + 1],
    dstPort: (frame[udpAt + 2] << 8) | frame[udpAt + 3],
    length,
    payload: frame.slice(udpAt + 8, payloadEnd),
  };
  return parsed;
}

export function sampleUdpFrame(): Uint8Array {
  const payload = new TextEncoder().encode("SEA");
  const udpLength = 8 + payload.length;
  const ipLength = 20 + udpLength;
  const frame = new Uint8Array(14 + ipLength);
  frame.fill(0xff, 0, 6);
  frame.set([0x02, 0x00, 0x00, 0x00, 0x00, 0x01], 6);
  frame[12] = 0x08;
  frame[13] = 0x00;
  frame[14] = 0x45;
  frame[16] = (ipLength >> 8) & 0xff;
  frame[17] = ipLength & 0xff;
  frame[22] = 64;
  frame[23] = 17;
  frame.set([192, 168, 1, 10], 26);
  frame.set([192, 168, 1, 20], 30);
  const udpAt = 34;
  frame[udpAt] = 0x13;
  frame[udpAt + 1] = 0x88;
  frame[udpAt + 2] = 0x04;
  frame[udpAt + 3] = 0xd2;
  frame[udpAt + 4] = (udpLength >> 8) & 0xff;
  frame[udpAt + 5] = udpLength & 0xff;
  frame.set(payload, udpAt + 8);
  return frame;
}

export function hexDump(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join(" ");
}
