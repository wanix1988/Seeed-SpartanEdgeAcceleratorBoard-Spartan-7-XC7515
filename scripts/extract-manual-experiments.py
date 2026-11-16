"""Extract SEA experiment manual metadata into docs/labs/manifest.json."""

from __future__ import annotations

import json
import re
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / "docs" / "manuals" / "SEA-Dev-Manual-Experiment.pdf"
OUT = ROOT / "docs" / "labs" / "manifest.json"

# Start page (1-based) from PDF scan
START_PAGES = [12, 29, 35, 44, 54, 59, 64, 68, 71, 80, 90, 98, 113, 128, 144, 155]


def section(text: str, label: str, next_labels: list[str]) -> str:
    i = text.find(label)
    if i < 0:
        return ""
    i += len(label)
    end = len(text)
    for nxt in next_labels:
        j = text.find(nxt, i)
        if j >= 0:
            end = min(end, j)
    body = text[i:end]
    return re.sub(r"\s+", " ", body).strip()


def main() -> None:
    doc = pymupdf.open(PDF)
    items = []
    for idx, start in enumerate(START_PAGES):
        n = idx + 1
        end = START_PAGES[idx + 1] if idx + 1 < len(START_PAGES) else doc.page_count + 1
        text = ""
        for p in range(start - 1, min(end - 1, doc.page_count)):
            text += doc[p].get_text("text") + "\n"
        title_m = re.search(rf"Experiment {n}:\s*([^\n]+)", text)
        title = title_m.group(1).strip() if title_m else f"Experiment {n}"
        title = re.sub(r"\.{3,}.*", "", title).strip()
        items.append(
            {
                "id": f"E{n:02d}",
                "number": n,
                "title_en": title,
                "manual": f"docs/manuals/SEA-Dev-Manual-Experiment.pdf#page={start}",
                "start_page": start,
                "purpose_en": section(
                    text,
                    "Purpose of experiment",
                    ["Content of experiment", "Requirement of experiment", "Steps of experiment"],
                )[:800],
                "content_en": section(
                    text,
                    "Content of experiment",
                    ["Requirement of experiment", "Steps of experiment"],
                )[:800],
                "requirement_en": section(
                    text,
                    "Requirement of experiment",
                    ["Steps of experiment", "Introduction of", "Experiment result"],
                )[:600],
            }
        )
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    print("wrote", OUT, "entries", len(items))


if __name__ == "__main__":
    main()