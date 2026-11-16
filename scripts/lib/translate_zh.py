"""EN→ZH translation with on-disk cache (Argos Translate, offline)."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CACHE_PATH = ROOT / "docs" / "labs" / "web-content" / "translate-cache.json"

# Argos works best on short segments.
_MAX_CHUNK = 420


def _argos_translate(text: str) -> str:
    import argostranslate.translate

    return argostranslate.translate.translate(text, "en", "zh")


def load_cache() -> dict[str, str]:
    if CACHE_PATH.is_file():
        return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    return {}


def save_cache(cache: dict[str, str]) -> None:
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")


def _key(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def cjk_ratio(text: str) -> float:
    if not text:
        return 0.0
    return len(re.findall(r"[\u4e00-\u9fff]", text)) / len(text)


def latin_ratio(text: str) -> float:
    if not text:
        return 0.0
    return len(re.findall(r"[A-Za-z]", text)) / len(text)


def translation_plausible(source: str, translated: str) -> bool:
    source = source.strip()
    translated = translated.strip()
    if not translated or translated == source:
        return False
    if latin_ratio(source) > 0.15:
        return cjk_ratio(translated) >= 0.08 or latin_ratio(translated) < latin_ratio(source) * 0.55
    return cjk_ratio(translated) > 0.02 or translated != source


def purge_bad_cache(cache: dict[str, str]) -> int:
    removed = 0
    for k, v in list(cache.items()):
        if latin_ratio(v) > 0.5 and cjk_ratio(v) < 0.05:
            del cache[k]
            removed += 1
    return removed


def _translate_chunk(chunk: str, cache: dict[str, str]) -> str:
    chunk = chunk.strip()
    if not chunk:
        return ""
    if cjk_ratio(chunk) > 0.35 and latin_ratio(chunk) < 0.2:
        return chunk

    k = _key(chunk)
    if k in cache and translation_plausible(chunk, cache[k]):
        return cache[k]

    try:
        out = _argos_translate(chunk)
    except Exception:
        out = chunk

    if len(chunk.encode("utf-8")) > 200 and not translation_plausible(chunk, out):
        parts = _split_chunks(chunk, 180)
        out = "\n".join(_translate_chunk(p, cache) for p in parts)
    elif translation_plausible(chunk, out):
        cache[k] = out
    else:
        cache[k] = out
    return out


def translate_en_to_zh(text: str, cache: dict[str, str]) -> str:
    text = text.strip()
    if not text:
        return ""
    chunks = _split_chunks(text, _MAX_CHUNK)
    return "\n".join(_translate_chunk(c, cache) for c in chunks)


def _split_chunks(text: str, max_len: int) -> list[str]:
    lines = text.split("\n")
    chunks: list[str] = []
    buf = ""
    for line in lines:
        line = line.rstrip()
        candidate = f"{buf}\n{line}" if buf else line
        if len(candidate.encode("utf-8")) > max_len and buf:
            chunks.append(buf)
            buf = line
        elif len(candidate.encode("utf-8")) > max_len:
            if buf:
                chunks.append(buf)
                buf = ""
            chunks.extend(_hard_split(line, max_len))
        else:
            buf = candidate
    if buf:
        chunks.append(buf)
    return chunks or [text[:max_len]]


def _hard_split(line: str, max_len: int) -> list[str]:
    parts: list[str] = []
    while line:
        if len(line.encode("utf-8")) <= max_len:
            parts.append(line)
            break
        cut = max_len
        while cut > 40 and len(line[:cut].encode("utf-8")) > max_len:
            cut -= 1
        parts.append(line[:cut])
        line = line[cut:].lstrip()
    return parts


def translate_long_text(text: str, cache: dict[str, str], chunk_size: int = _MAX_CHUNK) -> str:
    text = text.strip()
    if not text:
        return ""
    chunks = _split_chunks(text, chunk_size)
    return "\n".join(_translate_chunk(c, cache) for c in chunks)


def ensure_argos_en_zh() -> None:
    """Install Argos en→zh language package if missing (one-time, needs network)."""
    import argostranslate.package
    import argostranslate.translate

    installed = argostranslate.package.get_installed_packages()
    if any(p.from_code == "en" and p.to_code == "zh" for p in installed):
        return
    argostranslate.package.update_package_index()
    pairs = [
        p
        for p in argostranslate.package.get_available_packages()
        if p.from_code == "en" and p.to_code == "zh"
    ]
    if not pairs:
        raise RuntimeError("Argos en→zh package not found; check network.")
    argostranslate.package.install_from_path(pairs[0].download())