"""Shared helpers for cleaning SEA manual PDF text."""

from __future__ import annotations

import re

HEADER = re.compile(
    r"Spartan Edge Accelerate Board Development Manual.*?Part\s*",
    re.I,
)
FOOTER = re.compile(r"\n\s*\d+\s*/\s*\d+\s*\n")
FIG_ONLY = re.compile(r"^\s*Fig[.\s].{0,80}\s*$", re.I | re.M)
MULTI_SPACE = re.compile(r"[ \t]{2,}")


def clean_manual_text(raw: str) -> str:
    text = HEADER.sub("", raw)
    text = FOOTER.sub("\n", text)
    text = FIG_ONLY.sub("", text)
    text = text.replace("\r", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    lines = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            lines.append("")
            continue
        if re.fullmatch(r"\d+\s*/\s*\d+", line):
            continue
        if line in {"⚫", "➢", "◼"}:
            continue
        line = line.replace("⚫", "• ").replace("➢", "• ")
        lines.append(line)
    text = "\n".join(lines)
    return MULTI_SPACE.sub(" ", text).strip()


def section_between(text: str, start_label: str, end_labels: list[str]) -> str:
    i = text.find(start_label)
    if i < 0:
        return ""
    i += len(start_label)
    end = len(text)
    for label in end_labels:
        j = text.find(label, i)
        if j >= 0:
            end = min(end, j)
    return clean_manual_text(text[i:end])


def split_procedure_steps(body: str, max_items: int = 120) -> list[str]:
    if not body:
        return []
    chunks: list[str] = []
    # Numbered top-level sections like "1." at line start
    parts = re.split(r"(?m)^\s*(\d+)\.\s+", body)
    if len(parts) > 2:
        i = 1
        while i < len(parts):
            num = parts[i]
            rest = parts[i + 1] if i + 1 < len(parts) else ""
            head = rest.split("\n", 1)[0].strip()
            tail = rest.split("\n", 1)[1].strip() if "\n" in rest else ""
            title = f"{num}. {head}" if head else f"{num}."
            chunks.append(title)
            if tail:
                chunks.extend(_split_bullets(tail, max_items - len(chunks)))
            i += 2
    else:
        chunks.extend(_split_bullets(body, max_items))
    out: list[str] = []
    for c in chunks:
        c = re.sub(r"\s+", " ", c).strip()
        if len(c) < 4:
            continue
        if len(c) > 420:
            for piece in _sentence_split(c, 380):
                out.append(piece)
        else:
            out.append(c)
        if len(out) >= max_items:
            break
    return out


def _split_bullets(text: str, limit: int) -> list[str]:
    items: list[str] = []
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue
        if line.startswith("• "):
            items.append(line[2:].strip())
        elif re.match(r"^\(\d+\)", line):
            items.append(line)
        elif re.match(r"^[a-z]\.", line, re.I):
            items.append(line)
        elif line.startswith("Note:") or line.startswith("【"):
            items.append(line)
        elif items and len(line) < 200:
            items[-1] = f"{items[-1]} {line}"
        elif len(line) >= 20:
            items.append(line)
        if len(items) >= limit:
            break
    return items


def _sentence_split(text: str, width: int) -> list[str]:
    words = text.split(" ")
    lines: list[str] = []
    cur: list[str] = []
    for w in words:
        if sum(len(x) + 1 for x in cur) + len(w) > width and cur:
            lines.append(" ".join(cur))
            cur = [w]
        else:
            cur.append(w)
    if cur:
        lines.append(" ".join(cur))
    return lines