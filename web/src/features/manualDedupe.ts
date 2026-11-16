/** Drop copy-pasted or near-duplicate manual lesson text in the UI. */

function norm(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}

export function dedupeTextList(items: string[], anchor?: string): string[] {
  const anchorN = anchor ? norm(anchor) : "";
  const out: string[] = [];

  for (const raw of items) {
    const t = raw.trim();
    if (!t) continue;
    const n = norm(t);
    if (anchorN && (n === anchorN || anchorN.includes(n) || n.includes(anchorN))) continue;

    let merged = false;
    for (let i = 0; i < out.length; i++) {
      const pn = norm(out[i]);
      if (pn.includes(n) || n.includes(pn)) {
        if (t.length > out[i].length) out[i] = t;
        merged = true;
        break;
      }
    }
    if (!merged && !out.some((x) => norm(x) === n)) out.push(t);
  }
  return out;
}

export const GENERIC_FPGA_COMMAND =
  "器件 xc7s15ftgb196-1\nVivado（手册 2018.2，本仓库可用 2026.1）\nJTAG 下载；或 K5=Slave + ESP32 / MicroPython 加载 bit";

export function isGenericManualCommand(command: string): boolean {
  const c = command.trim();
  return (
    c === GENERIC_FPGA_COMMAND.trim() ||
    (c.includes("xc7s15ftgb196-1") && c.includes("2018.2") && c.split("\n").length <= 4)
  );
}