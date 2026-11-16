"""Generate web/src/content/experimentCatalog.ts from manifest + web-content JSON."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs" / "labs" / "manifest.json"
WEB_CONTENT = ROOT / "docs" / "labs" / "web-content"
OUT = ROOT / "web" / "src" / "content" / "experimentCatalog.ts"

WIDGET = {
    "E01": "blink",
    "E02": "manual",
    "E03": "manual",
    "E04": "manual",
    "E05": "blink",
    "E06": "manual",
    "E07": "manual",
    "E08": "manual",
    "E09": "manual",
    "E10": "hdmi",
    "E11": "pipeline",
    "E12": "sobel",
    "E13": "manual",
    "E14": "sobel",
    "E15": "packet",
    "E16": "packet",
}

PARTS = {
    "E01": ["fpga", "led", "jtag"],
    "E09": ["fpga", "adc"],
    "E10": ["fpga", "hdmi"],
    "E11": ["fpga", "csi", "hdmi"],
    "E12": ["fpga", "csi", "hdmi"],
    "E13": ["fpga", "adc", "hdmi"],
    "E14": ["fpga", "csi", "hdmi"],
    "E15": ["fpga", "esp32", "io"],
    "E16": ["fpga", "esp32"],
}

# id -> (track, title) for chapter lessons
FPGA_CH = [
    ("F01", "FPGA 资源与引脚"),
    ("F02", "JTAG 与外设"),
    ("F03", "Vivado 环境"),
    ("F04", "Verilog 语法要点"),
]

ESP_CH = [
    ("S01", "ESP32 资源与引脚"),
    ("S02", "驱动与供电"),
    ("S03", "MicroPython 环境"),
    ("S04", "Arduino 环境"),
    ("S05", "MicroPython 例程"),
    ("S06", "Arduino 例程"),
]

CHAPTER_COMMAND = {
    "F01": "查阅 xc7s15 资源手册与 XDC 引脚约束命名。",
    "F02": "K5=JTAG；Vivado Hardware Manager 或外接 JTAG 下载线。",
    "F03": "Vivado 2018.2 或 2026.1 WebPACK；License Manager 生效即可。",
    "F04": "Vivado 仿真/综合；编辑器 Verilog + 约束 XDC。",
    "S01": "无需烧录；阅读 ESP32 与 FPGA 互联引脚表。",
    "S02": "CP210x 驱动 + 可选 Flash Download Tool（ESP32 固件）。",
    "S03": "uPyCraft/Thonny + Type-C 串口；K5=Slave 加载 bit。",
    "S04": "Arduino IDE + esp32 开发板包。",
    "S05": "MicroPython 串口 REPL；TF 卡与 xfpga 库。",
    "S06": "Arduino IDE；Wi-Fi/GPIO 例程串口监视器。",
}

CHAPTER_PARTS = {
    "F01": ["fpga", "io", "hdmi", "csi", "adc"],
    "F02": ["jtag", "k5", "led"],
    "F03": ["fpga", "jtag"],
    "F04": ["fpga"],
    "S01": ["esp32", "flash"],
    "S02": ["usb", "esp32"],
    "S03": ["esp32"],
    "S04": ["esp32"],
    "S05": ["esp32", "sd", "k5", "fpga"],
    "S06": ["esp32"],
}


def js_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def load_json(name: str) -> list[dict]:
    path = WEB_CONTENT / name
    if not path.is_file():
        raise SystemExit(f"run scripts/extract-manual-web-content.py first ({path} missing)")
    return json.loads(path.read_text(encoding="utf-8"))


def milestone_steps(eid: str, row: dict, extra: dict) -> list[str]:
    title = row.get("title_zh", row["title_en"])
    repo = row.get("repo_path", "")
    sea = row.get("sea_paths", [])
    href = sea[0] if sea else "https://github.com/wanix1988/SEA"
    n = row["number"]
    return [
        f"阅读本页「实验目的 / 内容 / 要求」与下方分步清单（共 {len(extra.get('steps', []))} 步，摘自官方实验手册正文）。",
        f"器件 xc7s15ftgb196-1；工程目录 `{repo}`。",
        f"对照参考案例：{href}",
        "仿真或下载后在板上验证；全部步骤勾选后视为本实验完成。",
    ] if not eid.startswith("F") and not eid.startswith("S") else []


def lesson_from_row(row: dict, extra: dict) -> str:
    eid = row["id"]
    widget = WIDGET.get(eid, "manual")
    parts = PARTS.get(eid, ["fpga"])
    title = row.get("title_zh", row["title_en"])
    goal = extra.get("purpose_zh") or title
    learn = [extra.get("content_zh", ""), extra.get("requirement_zh", "")]
    learn = [x for x in learn if x]
    if not learn:
        learn = [goal]
    sea = row.get("sea_paths", [])
    href = sea[0] if sea else "https://github.com/wanix1988/SEA"
    label = "SEA 官方案例"
    repo = row.get("repo_path", "")
    note = (
        f"步骤正文已内嵌（无需打开 PDF）。本地源码目录 `{repo}`。"
        "示意图在手册附件包中；板上操作以本页清单为准。"
    )
    if eid == "E16":
        note += " K5 拨 Slave，ESP32 侧与 FPGA Slave 协同完成 QSPI。"
    cmd = (
        "器件 xc7s15ftgb196-1\n"
        "Vivado（手册 2018.2，本仓库可用 2026.1）\n"
        "JTAG 下载；或 K5=Slave + ESP32 / MicroPython 加载 bit"
    )
    steps = milestone_steps(eid, row, extra)
    req_snip = (extra.get("requirement_en") or row.get("requirement_en", ""))[:500]
    return f"""  {{
    id: {js_str(eid)},
    track: "manual-exp",
    title: {js_str(title)},
    heading: {js_str(f"手册实验 {row['number']}：{title}")},
    goal: {js_str(goal)},
    learn: [{", ".join(js_str(x) for x in learn)}],
    steps: [{", ".join(js_str(s) for s in steps)}],
    command: {js_str(cmd)},
    note: {js_str(note)},
    parts: [{", ".join(js_str(p) for p in parts)}],
    widget: {js_str(widget)},
    code: {{ language: "text", source: {js_str(req_snip)} }},
    sourceHref: {js_str(href)},
    sourceLabel: {js_str(label)},
  }}"""


def chapter_lesson(ch: dict, track: str) -> str:
    cid = ch["id"]
    title = ch["title"]
    goal = ch.get("goal_zh", title)
    parts = CHAPTER_PARTS.get(cid, ["fpga" if track == "manual-fpga" else "esp32"])
    steps: list[str] = []
    note = "导读与步骤见本页清单；English 页签为手册原文。"
    cmd = CHAPTER_COMMAND.get(cid, "按本课步骤连接板卡与 PC。")
    return f"""  {{
    id: {js_str(cid)},
    track: {js_str(track)},
    title: {js_str(title)},
    heading: {js_str(title)},
    goal: {js_str(goal)},
    learn: [],
    steps: [{", ".join(js_str(s) for s in steps) if steps else js_str("见下方步骤清单")}],
    command: {js_str(cmd)},
    note: {js_str(note)},
    parts: [{", ".join(js_str(p) for p in parts)}],
    widget: "manual",
    code: {{ language: "text", source: "" }},
    sourceHref: "https://github.com/wanix1988/SEA",
    sourceLabel: "SEA 仓库",
  }}"""


def main() -> None:
    rows = json.loads(MANIFEST.read_text(encoding="utf-8"))
    experiments = {r["id"]: r for r in load_json("experiments.json")}
    fpga = load_json("fpga-chapters.json")
    esp32 = load_json("esp32-chapters.json")
    fpga_by_id = {c["id"]: c for c in fpga}
    esp_by_id = {c["id"]: c for c in esp32}

    exp_lessons = ",\n".join(lesson_from_row(r, experiments[r["id"]]) for r in rows)
    fpga_lessons = ",\n".join(chapter_lesson(fpga_by_id[cid], "manual-fpga") for cid, _ in FPGA_CH)
    esp_lessons = ",\n".join(chapter_lesson(esp_by_id[cid], "manual-esp32") for cid, _ in ESP_CH)

    exp_ids = ", ".join(f'"{r["id"]}"' for r in rows)
    fpga_ids = ", ".join(f'"{c[0]}"' for c in FPGA_CH)
    esp_ids = ", ".join(f'"{c[0]}"' for c in ESP_CH)

    OUT.write_text(
        f"""import type {{ Lesson, Track }} from "./catalog-types";

export const manualTracks: Track[] = [
  {{
    id: "manual-fpga",
    title: "FPGA 开发手册",
    summary: "板上资源、Vivado 与 Verilog；步骤已内嵌。",
    lessonIds: [{fpga_ids}],
  }},
  {{
    id: "manual-esp32",
    title: "ESP32 开发手册",
    summary: "驱动、MicroPython 与 Arduino；步骤已内嵌。",
    lessonIds: [{esp_ids}],
  }},
  {{
    id: "manual-exp",
    title: "综合实验（手册 16 课）",
    summary: "与 wanix1988/SEA 案例对齐；正文不必再开 PDF。",
    lessonIds: [{exp_ids}],
  }},
];

export const manualLessons: Lesson[] = [
{fpga_lessons},
{esp_lessons},
{exp_lessons},
];
""",
        encoding="utf-8",
    )
    print("wrote", OUT)


if __name__ == "__main__":
    main()