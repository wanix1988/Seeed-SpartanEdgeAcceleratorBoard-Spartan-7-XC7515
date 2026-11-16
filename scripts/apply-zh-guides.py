"""Apply LLM-reviewed Chinese guides to web manualContent.json."""

from __future__ import annotations

import json
from pathlib import Path

from lib.zh_guides import apply_zh_guide

ROOT = Path(__file__).resolve().parents[1]
WEB_JSON = ROOT / "web" / "src" / "content" / "manualContent.json"
WEB_DIR = ROOT / "docs" / "labs" / "web-content"


def main() -> None:
    data = json.loads(WEB_JSON.read_text(encoding="utf-8"))
    n = 0
    for row in data["experiments"]:
        if apply_zh_guide(row):
            n += 1
    for key in ("fpga", "esp32"):
        for row in data[key]:
            if apply_zh_guide(row):
                n += 1

    WEB_JSON.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    (WEB_DIR / "experiments.json").write_text(
        json.dumps(data["experiments"], ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (WEB_DIR / "fpga-chapters.json").write_text(
        json.dumps(data["fpga"], ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (WEB_DIR / "esp32-chapters.json").write_text(
        json.dumps(data["esp32"], ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("applied zh guides to", n, "lessons →", WEB_JSON)


if __name__ == "__main__":
    main()