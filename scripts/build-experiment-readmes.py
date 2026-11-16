"""Create fpga/* and esp32 README stubs from manifest.json."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "docs" / "labs" / "manifest.json"


def readme(row: dict) -> str:
    sea = "\n".join(f"- [{p.split('/')[-1]}]({p})" for p in row.get("sea_paths", [])) or "- （手册逐步搭建，见 PDF）"
    return f"""# {row["id"]} {row.get("title_zh", row["title_en"])}

对应手册：**`docs/manuals/SEA-Dev-Manual-Experiment.pdf`** 第 {row["start_page"]} 页起（Experiment {row["number"]}）。

## 目的（摘自手册）

{row.get("purpose_en", "")}

## 内容

{row.get("content_en", "")}

## 官方工程参考（wanix1988/SEA）

{sea}

## 本仓库

- 本地目录：`{row.get("repo_path", "（待添加）")}`
- 器件：`xc7s15ftgb196-1`
- 工具：手册约定 Vivado 2018.2；本机可用 Vivado 2026.1 WebPACK。

更完整的实验索引见 [docs/labs/README.md](../../docs/labs/README.md)。
"""


def main() -> None:
    items = json.loads(MANIFEST.read_text(encoding="utf-8"))
    for row in items:
        path = row.get("repo_path")
        if not path:
            continue
        dirp = ROOT / path
        dirp.mkdir(parents=True, exist_ok=True)
        (dirp / "README.md").write_text(readme(row), encoding="utf-8")
        print("wrote", dirp / "README.md")


if __name__ == "__main__":
    main()