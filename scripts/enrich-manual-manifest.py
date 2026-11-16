"""Add Chinese titles and SEA paths to docs/labs/manifest.json."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs" / "labs" / "manifest.json"
SEA = ROOT / "docs" / "labs" / "sea-map.json"
FPGA = ROOT / "fpga"

TITLES_ZH = {
    "E01": "熟悉开发板与 Vivado 环境",
    "E02": "组合逻辑设计",
    "E03": "调用 IP 核",
    "E04": "时序逻辑（一）",
    "E05": "时序逻辑（二）",
    "E06": "状态机（Moore）",
    "E07": "状态机（Mealy）",
    "E08": "IP 核封装",
    "E09": "DAC 波形发生",
    "E10": "HDMI 视频输出",
    "E11": "MIPI 摄像头输入",
    "E12": "视频图像处理",
    "E13": "单通道简易示波器",
    "E14": "机器视觉",
    "E15": "SPI 与 Arduino 接口",
    "E16": "ESP32 与 FPGA 的 QSPI",
}

LOCAL = {
    "E01": "fpga/01-blink",
    "E02": "fpga/02-combo-logic",
    "E03": "fpga/03-ip-core",
    "E04": "fpga/04-sequential-1",
    "E05": "fpga/05-sequential-2",
    "E06": "fpga/06-fsm-moore",
    "E07": "fpga/07-fsm-mealy",
    "E08": "fpga/08-ip-packaging",
    "E09": "fpga/09-dac-waveform",
    "E10": "fpga/10-hdmi-output",
    "E11": "fpga/11-mipi-camera",
    "E12": "fpga/12-video-processing",
    "E13": "fpga/13-oscilloscope",
    "E14": "fpga/14-machine-vision",
    "E15": "fpga/15-spi-arduino",
    "E16": "esp32/qspi-fpga",
}


def main() -> None:
    items = json.loads(MANIFEST.read_text(encoding="utf-8"))
    sea = json.loads(SEA.read_text(encoding="utf-8"))
    base = sea["base"]
    for row in items:
        eid = row["id"]
        row["title_zh"] = TITLES_ZH.get(eid, row["title_en"])
        paths = sea["experiments"].get(eid, [])
        row["sea_paths"] = [f"{base}/{p}" for p in paths]
        row["repo_path"] = LOCAL.get(eid)
        for key in ("purpose_en", "content_en", "requirement_en"):
            row[key] = row.get(key, "").split(" 1.2")[0].split(" 2.2")[0].split(" 3.2")[0].strip()
    MANIFEST.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print("updated", MANIFEST, len(items), "entries")


if __name__ == "__main__":
    main()