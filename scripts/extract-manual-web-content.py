"""Extract structured manual content for the web lab (no PDF required in browser)."""

from __future__ import annotations

import json
from pathlib import Path

import pymupdf

from lib.curated_steps import apply_curated
from lib.zh_guides import apply_zh_guide
from lib.manual_text import clean_manual_text, section_between, split_procedure_steps

ROOT = Path(__file__).resolve().parents[1]
MANUALS = ROOT / "docs" / "manuals"
OUT_DIR = ROOT / "docs" / "labs" / "web-content"

EXP_PDF = MANUALS / "SEA-Dev-Manual-Experiment.pdf"
EXP_START_PAGES = [12, 29, 35, 44, 54, 59, 64, 68, 71, 80, 90, 98, 113, 128, 144, 155]

PURPOSE_ZH = {
    "E01": "熟悉 SEA 板上 FPGA 资源、Vivado 编译环境，以及 Verilog 从编写、综合、仿真到下载的完整流程。",
    "E02": "掌握 Verilog 组合逻辑（4-2 编码器、2-4 译码器等）的设计与仿真。",
    "E03": "在 Vivado 中创建/调用 IP 核，并完成 RGB LED 等板载 IP 实例化。",
    "E04": "理解 D 触发器与计数器，完成多种 D 触发器变体与计数器设计的仿真与下载。",
    "E05": "掌握时钟与分频器概念，实现偶数/奇数分频并与参考设计对比波形。",
    "E06": "用状态图设计 Moore 型有限状态机并完成仿真。",
    "E07": "设计 Mealy 型状态机，比较 Gray 码与 One-hot 编码实现。",
    "E08": "将已验证的分频模块封装为自定义 IP 并在工程中调用。",
    "E09": "用 ROM + 地址产生 + DAC 实现波形发生器，MATLAB 生成系数表。",
    "E10": "按 HDMI 时序参数编写 1080p@60Hz 驱动并输出图像。",
    "E11": "配置 OV5647 MIPI 摄像头寄存器并接入采集流水线。",
    "E12": "实现图像边缘检测等处理链路（Sobel 等算子思路）。",
    "E13": "搭建简易数字示波器：采样、Vpp/频率计算与 HDMI 显示。",
    "E14": "RGB/HSV 色彩空间转换与机器视觉相关处理。",
    "E15": "SPI 协议与板载 Arduino 扩展口上的 SPI 外设交互。",
    "E16": "ESP32 作 QSPI 主机与 FPGA Slave RAM 读写及数据处理协同。",
}

CONTENT_ZH = {
    "E01": "Vivado 下 Hello World、时序波形仿真、JTAG 或 Slave 方式下载验证。",
    "E02": "4-2 编码器、2-4 译码器，绑定的 IO/LED 现象验证。",
    "E03": "乘法器 IP 调用与 RGB LED IP 调用两套流程。",
    "E04": "基本/同步复位/异步复位等 D 触发器与模 5 计数器。",
    "E05": "以 100 MHz 系统时钟分频得到目标频率（如 20 MHz）。",
    "E06": "按状态转移图完成 Moore FSM 编码与仿真。",
    "E07": "Lab_7_1 / Lab_7_2：Gray 与 One-hot 状态机仿真对比。",
    "E08": "Lab_8_1 综合后通过 Create and Package New IP 向导封装。",
    "E09": "MATLAB 生成三角波等样点，FPGA 侧 ROM + DAC 输出。",
    "E10": "Lab_10：Driver_HDMI 与主模块，按附件时序手册填空。",
    "E11": "读 OV5647 数据手册寄存器表，配置分辨率与时钟。",
    "E12": "卷积/移位寄存器等 IP 与图像处理流水线联调。",
    "E13": "ADC 采样 + 算法模块 + 波形 RAM + 显示模块。",
    "E14": "RGB→HSV 转换模块与视觉例程。",
    "E15": "SPI 主机读写 EEPROM 等外设的时序与引脚。",
    "E16": "QSPI 解析、RAM 地址映射，数据处理示例（+5）。",
}

REQUIREMENT_ZH = {
    "E01": "完成简单电路仿真；下载配置并在 SEA 板上验证 LED 等现象。",
    "E02": "综合通过；完成时序仿真并分析波形；下载观察实验现象。",
    "E03": "熟练完成 IP Catalog 添加、例化与约束。",
    "E04": "完成时序仿真；必要时用示波器看输出波形。",
    "E05": "仿真波形与参考分频设计对比；下载后用示波器验证频率。",
    "E06": "状态机仿真结果与状态图一致。",
    "E07": "两套装码的状态机仿真均通过。",
    "E08": "封装 IP 可在新工程中正常添加并综合。",
    "E09": "DAC 输出波形与 MATLAB 设定一致（幅度/频率可调范围内）。",
    "E10": "显示器能稳定显示 1080p 测试图案。",
    "E11": "摄像头输出指定分辨率图像并能在 HDMI 看到。",
    "E12": "边缘检测效果图与预期一致。",
    "E13": "单通道波形 Vpp、频率与显示正确。",
    "E14": "色彩转换与后续视觉算法模块联调通过。",
    "E15": "SPI 读写外设数据正确。",
    "E16": "ESP32 写入 RAM 后 FPGA 处理结果可通过读回或现象验证。",
}

FPGA_CHAPTERS = [
    ("F01", "FPGA 资源与引脚", 11, 24),
    ("F02", "JTAG 与外设", 25, 27),
    ("F03", "Vivado 环境", 28, 42),
    ("F04", "Verilog 语法要点", 43, 48),
]

ESP_CHAPTERS = [
    ("S01", "ESP32 资源与引脚", 10, 13),
    ("S02", "驱动与供电", 14, 18),
    ("S03", "MicroPython 环境", 19, 24),
    ("S04", "Arduino 环境", 25, 34),
    ("S05", "MicroPython 例程", 35, 45),
    ("S06", "Arduino 例程", 46, 48),
]

CHAPTER_GOAL_ZH = {
    "F01": "读懂 xc7s15ftgb196-1 资源、管脚表与板载 HDMI/MIPI/ADC/DAC 等接口含义。",
    "F02": "接好 JTAG 下载线；了解 K 键、LED 与可选 MIPI/显示屏外设。",
    "F03": "安装 Vivado 2018.2（或本仓库 2026.1）、License 与 IDE 主流程。",
    "F04": "module、always、仿真与 XDC 约束等 Verilog 开发要点。",
    "S01": "ESP32-D0WDQ6 资源、与 FPGA 的 QSPI/配置脚及 W25Q32 连接。",
    "S02": "CP210x USB 驱动安装、Type-C 上电与出厂固件烧录流程。",
    "S03": "uPyCraft / thonny 连接串口、SD 卡与 xfpga 加载 bit 文件。",
    "S04": "Arduino IDE 安装 ESP32 开发板包与所需库。",
    "S05": "MicroPython 库结构、GPIO/UART/I2C/SPI/Network 例程与 SEA 库。",
    "S06": "Arduino 下 Wi-Fi、GPIO、串口等与板载 FPGA 协同示例。",
}


def pages_text(doc: pymupdf.Document, start: int, end: int) -> str:
    parts = []
    for p in range(start - 1, min(end, doc.page_count)):
        parts.append(doc[p].get_text("text"))
    return "\n".join(parts)


def extract_experiments() -> list[dict]:
    doc = pymupdf.open(EXP_PDF)
    items = []
    for idx, start in enumerate(EXP_START_PAGES):
        n = idx + 1
        eid = f"E{n:02d}"
        end = EXP_START_PAGES[idx + 1] if idx + 1 < len(EXP_START_PAGES) else doc.page_count + 1
        raw = pages_text(doc, start, end - 1)
        purpose = section_between(
            raw,
            "Purpose of experiment",
            ["Content of experiment", "Requirement of experiment", "Steps of experiment"],
        )
        content = section_between(
            raw,
            "Content of experiment",
            ["Requirement of experiment", "Steps of experiment"],
        )
        requirement = section_between(
            raw,
            "Requirement of experiment",
            ["Steps of experiment", "Introduction of"],
        )
        steps_raw = section_between(
            raw,
            "Steps of experiment",
            ["Experiment result", f"Experiment {n + 1}:"],
        )
        if not steps_raw:
            steps_raw = section_between(raw, "Steps of experiment", ["Experiment result"])
        result = section_between(raw, "Experiment result", [f"Experiment {n + 1}:"])
        procedure = clean_manual_text(steps_raw)
        step_list = split_procedure_steps(procedure, 100)
        row = {
                "id": eid,
                "number": n,
                "start_page": start,
                "purpose_zh": PURPOSE_ZH.get(eid, ""),
                "content_zh": CONTENT_ZH.get(eid, ""),
                "requirement_zh": REQUIREMENT_ZH.get(eid, ""),
                "purpose_en": purpose[:2000],
                "content_en": content[:2000],
                "requirement_en": requirement[:2000],
                "result_en": result[:3000],
                "procedure": procedure[:80000],
                "steps": step_list,
        }
        if not apply_curated(row):
            row["steps_curated"] = False
        apply_zh_guide(row)
        items.append(row)
    return items


def extract_chapters(pdf_name: str, ranges: list[tuple]) -> list[dict]:
    doc = pymupdf.open(MANUALS / pdf_name)
    out = []
    for cid, title, start, end in ranges:
        raw = pages_text(doc, start, end)
        body = clean_manual_text(raw)
        steps = split_procedure_steps(body, 60)
        if len(steps) < 4:
            steps = [line for line in body.split("\n") if len(line.strip()) > 30][:40]
        intro = body[:480].strip() if body else title
        row = {
            "id": cid,
            "title": title,
            "goal_zh": CHAPTER_GOAL_ZH.get(cid, title),
            "goal_en": intro,
            "procedure": body[:50000],
            "steps": steps[:60],
        }
        if not apply_curated(row):
            row["steps_curated"] = False
        apply_zh_guide(row)
        out.append(row)
    return out


def _merge_zh(prev: dict | None, row: dict) -> None:
    if not prev:
        return
    if prev.get("zh_reviewed"):
        for key in (
            "guide_zh",
            "result_zh",
            "purpose_zh_body",
            "content_zh_body",
            "requirement_zh_body",
            "zh_reviewed",
        ):
            if prev.get(key):
                row[key] = prev[key]
        row.pop("procedure_zh", None)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    web_out = ROOT / "web" / "src" / "content" / "manualContent.json"
    prev = json.loads(web_out.read_text(encoding="utf-8")) if web_out.is_file() else None
    prev_exp = {r["id"]: r for r in (prev or {}).get("experiments", [])}
    prev_fpga = {r["id"]: r for r in (prev or {}).get("fpga", [])}
    prev_esp = {r["id"]: r for r in (prev or {}).get("esp32", [])}

    experiments = extract_experiments()
    for row in experiments:
        _merge_zh(prev_exp.get(row["id"]), row)

    fpga = extract_chapters("SEA-Dev-Manual-FPGA.pdf", FPGA_CHAPTERS)
    for row in fpga:
        _merge_zh(prev_fpga.get(row["id"]), row)

    esp32 = extract_chapters("SEA-Dev-Manual-ESP32.pdf", ESP_CHAPTERS)
    for row in esp32:
        _merge_zh(prev_esp.get(row["id"]), row)
    (OUT_DIR / "experiments.json").write_text(
        json.dumps(experiments, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "fpga-chapters.json").write_text(
        json.dumps(fpga, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_DIR / "esp32-chapters.json").write_text(
        json.dumps(esp32, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    web_out.write_text(
        json.dumps({"experiments": experiments, "fpga": fpga, "esp32": esp32}, ensure_ascii=False),
        encoding="utf-8",
    )
    print("wrote", OUT_DIR, "experiments", len(experiments))
    print("wrote", web_out)


if __name__ == "__main__":
    main()