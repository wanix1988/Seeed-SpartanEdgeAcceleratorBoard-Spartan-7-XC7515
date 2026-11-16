"""Render xc7s15ftgb196-1 Vivado device floorplan PNGs for the web die view.

Requires: fpga-design-implview, pymupdf optional.
Input:  web/public/die/xc7s15-device.ivdev.gz (from Vivado implview export).
Output: xc7s15-floorplan.png, xc7s15-floorplan-pick.png
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from matplotlib.collections import PolyCollection  # noqa: E402

from fpga_design_implview.design import Design
from fpga_design_implview.device import load_device
from fpga_design_implview.layout import build_layout
from fpga_design_implview.placement import build_placement

ROOT = Path(__file__).resolve().parents[2]
DIE_DIR = ROOT / "web" / "public" / "die"
DEVICE = ROOT / "web" / "scripts" / "data" / "xc7s15-device.ivdev.gz"

MODULE_COLORS = {
    "iob": "#2a6f8f",
    "clb": "#3d9a5a",
    "bram": "#7a5eb0",
    "dsp": "#c4782a",
    "cmt": "#d4a82c",
    "config": "#8a5a4a",
    "xadc": "#5a8a6a",
    "int": "#4a5a6a",
}

PICK_RGB = {
    "iob": (0x2A, 0x6F, 0x8F),
    "clb": (0x3D, 0x9A, 0x5A),
    "bram": (0x7A, 0x5E, 0xB0),
    "dsp": (0xC4, 0x78, 0x2A),
    "cmt": (0xD4, 0xA8, 0x2C),
    "config": (0x8A, 0x5A, 0x4A),
    "xadc": (0x5A, 0x8A, 0x6A),
    "int": (0x4A, 0x5A, 0x6A),
}


def module_for_type(site_type: str) -> str:
    t = site_type or ""
    if t.startswith("SLICE"):
        return "clb"
    if t.startswith("RAMB"):
        return "bram"
    if t.startswith("DSP"):
        return "dsp"
    if t.startswith(("IOB", "HPIO", "HDIO", "RIU", "BITSLICE")):
        return "iob"
    if t.startswith(("MMCM", "PLLE", "PLL", "BUFG", "BUFH", "BUFR", "MMCME", "PLLE4")):
        return "cmt"
    if t.startswith(("CFG", "ICAP", "EFUSE", "STARTUP", "FRAME", "DNA")):
        return "config"
    if t.startswith("SYSMON") or "XADC" in t:
        return "xadc"
    if t.startswith("INT"):
        return "int"
    return "int"


def _verts(rects: np.ndarray) -> np.ndarray:
    r = np.asarray(rects, dtype=float)
    return np.stack([r[:, [0, 1]], r[:, [2, 1]], r[:, [2, 3]], r[:, [0, 3]]], axis=1)


def main() -> int:
    if not DEVICE.is_file():
        print("missing", DEVICE, file=sys.stderr)
        return 1
    dev = load_device(DEVICE)
    lay = build_layout(dev)
    des = Design()
    place = build_placement(dev, des, [], {}, False)

    mods = [module_for_type(s.type) for s in dev.sites]
    display_colors = [MODULE_COLORS[m] for m in mods]
    pick_colors = [f"#{PICK_RGB[m][0]:02x}{PICK_RGB[m][1]:02x}{PICK_RGB[m][2]:02x}" for m in mods]

    w, h = lay.width, lay.height
    fig_w = w / 25.4
    fig_h = h / 25.4
    target_px = 2800
    dpi = int(target_px / max(fig_w, fig_h))
    fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=dpi)
    fig.patch.set_facecolor("#1a2420")
    ax.set_facecolor("#121816")
    ax.set_xlim(0, w)
    ax.set_ylim(h, 0)
    ax.set_aspect("equal")
    ax.axis("off")

    r = lay.site_rect
    ok = np.isfinite(r[:, 0])
    idx = np.nonzero(ok)[0]
    int_mask = np.array([m == "int" for m in mods])

    # INT interconnect tiles (narrow columns)
    int_idx = idx[int_mask[idx]]
    if len(int_idx):
        pc = PolyCollection(
            _verts(r[int_idx]),
            facecolors=[display_colors[i] for i in int_idx],
            edgecolors="none",
            alpha=0.35,
            antialiased=False,
        )
        ax.add_collection(pc)

    logic_idx = idx[~int_mask[idx]]
    if len(logic_idx):
        pc = PolyCollection(
            _verts(r[logic_idx]),
            facecolors=[display_colors[i] for i in logic_idx],
            edgecolors="#0d1210",
            linewidths=0.08,
            antialiased=False,
        )
        ax.add_collection(pc)

    for cr, rect in lay.cr_rect:
        ax.plot(
            [rect[0], rect[2], rect[2], rect[0], rect[0]],
            [rect[1], rect[1], rect[3], rect[3], rect[1]],
            color="#ffffff22",
            linewidth=0.4,
        )

    out = DIE_DIR / "xc7s15-floorplan.png"
    fig.savefig(out, bbox_inches="tight", pad_inches=0.02, facecolor=fig.get_facecolor())
    plt.close(fig)

    fig2, ax2 = plt.subplots(figsize=(fig_w, fig_h), dpi=dpi)
    ax2.set_facecolor("#000000")
    ax2.set_xlim(0, w)
    ax2.set_ylim(h, 0)
    ax2.set_aspect("equal")
    ax2.axis("off")
    pc2 = PolyCollection(
        _verts(r[idx]),
        facecolors=[pick_colors[i] for i in idx],
        edgecolors="none",
        antialiased=False,
    )
    ax2.add_collection(pc2)
    pick_out = DIE_DIR / "xc7s15-floorplan-pick.png"
    fig2.savefig(pick_out, bbox_inches="tight", pad_inches=0.02, facecolor="#000000")
    plt.close(fig2)

    meta = {
        "part": dev.part,
        "source": "Vivado 2026.1 link_design + implview::export_device",
        "pickMap": {k: list(v) for k, v in PICK_RGB.items()},
        "note": "按 Vivado 器件窗口逐 Site 绘制的 xc7s15ftgb196-1 版图，非光学显微照片。",
    }
    (DIE_DIR / "xc7s15-floorplan.meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("wrote", out.name, pick_out.name)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())