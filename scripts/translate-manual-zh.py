"""[已弃用] 曾用 Argos 机翻。中文请维护 scripts/lib/zh_guides.py 并运行 apply-zh-guides.py。"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from lib.manual_text import split_procedure_steps
from lib.translate_zh import (
    ensure_argos_en_zh,
    load_cache,
    purge_bad_cache,
    save_cache,
    translate_en_to_zh,
    translate_long_text,
)

ROOT = Path(__file__).resolve().parents[1]
WEB_JSON = ROOT / "web" / "src" / "content" / "manualContent.json"
WEB_DIR = ROOT / "docs" / "labs" / "web-content"


def enrich_experiment(row: dict, cache: dict[str, str], force: bool) -> None:
    if row.get("purpose_en") and (force or not row.get("purpose_zh_body")):
        row["purpose_zh_body"] = translate_long_text(row["purpose_en"], cache)
    if row.get("content_en") and (force or not row.get("content_zh_body")):
        row["content_zh_body"] = translate_long_text(row["content_en"], cache)
    if row.get("requirement_en") and (force or not row.get("requirement_zh_body")):
        row["requirement_zh_body"] = translate_long_text(row["requirement_en"], cache)
    if row.get("result_en") and (force or not row.get("result_zh")):
        row["result_zh"] = translate_long_text(row["result_en"], cache)
    proc = row.get("procedure", "")
    if proc and (force or not row.get("procedure_zh")):
        row["procedure_zh"] = translate_long_text(proc, cache)
    if not row.get("steps_curated") and row.get("procedure_zh"):
        row["steps_zh"] = split_procedure_steps(row["procedure_zh"], 100)
    elif not row.get("steps_curated") and row.get("steps") and (force or not row.get("steps_zh")):
        row["steps_zh"] = [translate_en_to_zh(s, cache) for s in row["steps"]]


def enrich_chapter(row: dict, cache: dict[str, str], force: bool) -> None:
    proc = row.get("procedure", "")
    if proc and not row.get("goal_en"):
        row["goal_en"] = proc[:480].strip()
    if proc and (force or not row.get("procedure_zh")):
        row["procedure_zh"] = translate_long_text(proc, cache)
    if not row.get("steps_curated") and row.get("procedure_zh"):
        row["steps_zh"] = split_procedure_steps(row["procedure_zh"], 60)
    elif not row.get("steps_curated") and row.get("steps") and (force or not row.get("steps_zh")):
        row["steps_zh"] = [translate_en_to_zh(s, cache) for s in row["steps"]]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="re-translate even if zh fields exist")
    parser.add_argument("--purge-cache", action="store_true", help="drop cached entries that look like untranslated English")
    parser.add_argument("--ids", default="", help="comma-separated lesson ids, e.g. E02,F03")
    args = parser.parse_args()

    ensure_argos_en_zh()
    data = json.loads(WEB_JSON.read_text(encoding="utf-8"))
    only = {x.strip() for x in args.ids.split(",") if x.strip()}
    cache = load_cache()
    if args.purge_cache or args.force:
        n = purge_bad_cache(cache)
        print("purged cache entries", n)

    for row in data["experiments"]:
        if only and row["id"] not in only:
            continue
        print("translate experiment", row["id"])
        enrich_experiment(row, cache, args.force)
        save_cache(cache)

    for key in ("fpga", "esp32"):
        for row in data[key]:
            if only and row["id"] not in only:
                continue
            print("translate chapter", row["id"])
            enrich_chapter(row, cache, args.force)
            save_cache(cache)

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
    save_cache(cache)
    print("wrote", WEB_JSON, "cache entries", len(cache))


if __name__ == "__main__":
    main()