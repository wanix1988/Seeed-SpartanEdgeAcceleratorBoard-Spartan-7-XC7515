# SEA 三册手册 · 实验索引

本目录把 **`docs/manuals/`** 中三本官方手册的内容映射到本仓库的 **Web 实验台**（`web/`）、**FPGA 目录**（`fpga/`）与 **ESP32 目录**（`esp32/`），并与 [wanix1988/SEA](https://github.com/wanix1988/SEA) 官方案例对齐。

手册版本：Revision V1.0（2020-09-15）。器件统一为 **`xc7s15ftgb196-1`**，工具链手册约定 **Vivado 2018.2**。

## 手册文件

| PDF | 用途 |
| --- | --- |
| [SEA-Dev-Manual-FPGA.pdf](../manuals/SEA-Dev-Manual-FPGA.pdf) | 板上 FPGA 资源、引脚、Vivado、Verilog |
| [SEA-Dev-Manual-ESP32.pdf](../manuals/SEA-Dev-Manual-ESP32.pdf) | CP210x 驱动、MicroPython、Arduino、与 FPGA 协同 |
| [SEA-Dev-Manual-Experiment.pdf](../manuals/SEA-Dev-Manual-Experiment.pdf) | **16 个综合实验**（数字电路 → 视频 → QSPI） |

## Web 实验台分组

在仓库 `web/` 启动后打开首页，除原有「入门 / 视频 / 算法 / 网络包」外，新增。各课 **目的、内容与分步清单已内嵌在网页**（`web/src/content/manualContent.json`），做实验时不必再打开 PDF；示意图仍以手册附件为准。

| 分组 | 课号 | 对应手册 |
| --- | --- | --- |
| FPGA 开发手册 | F01–F04 | SEA-Dev-Manual-FPGA 第 1–4 章 |
| ESP32 开发手册 | S01–S06 | SEA-Dev-Manual-ESP32 第 1–4 章 |
| 综合实验（16 课） | E01–E16 | SEA-Dev-Manual-Experiment 全文 |

## 综合实验一览

机器可读的元数据：[manifest.json](manifest.json)（由 `scripts/extract-manual-experiments.py` 从 PDF 提取）。SEA 路径映射：[sea-map.json](sea-map.json)。

| 编号 | 中文题名 | 本地目录 | 主要 SEA 参考 |
| --- | --- | --- | --- |
| E01 | 熟悉开发板与 Vivado 环境 | [fpga/01-blink](../../fpga/01-blink/) | Hello-World/FPGA |
| E02 | 组合逻辑设计 | [fpga/02-combo-logic](../../fpga/02-combo-logic/) | Examples/FPGA/1.Digital-Circuits/1.Combination-Logic-Circuit-Design |
| E03 | 调用 IP 核 | [fpga/03-ip-core](../../fpga/03-ip-core/) | Examples/FPGA-IP/RGB-LED-IP |
| E04 | 时序逻辑（一） | [fpga/04-sequential-1](../../fpga/04-sequential-1/) | 2.Sequential-Logic-Circuit-Design |
| E05 | 时序逻辑（二） | [fpga/05-sequential-2](../../fpga/05-sequential-2/) | 同上 |
| E06 | 状态机（Moore） | [fpga/06-fsm-moore](../../fpga/06-fsm-moore/) | 3.State-Machine-Design |
| E07 | 状态机（Mealy） | [fpga/07-fsm-mealy](../../fpga/07-fsm-mealy/) | 同上 |
| E08 | IP 核封装 | [fpga/08-ip-packaging](../../fpga/08-ip-packaging/) | 按手册在 Vivado 中封装 |
| E09 | DAC 波形发生 | [fpga/09-dac-waveform](../../fpga/09-dac-waveform/) | Data-Interface / Instrumentation |
| E10 | HDMI 视频输出 | [fpga/10-hdmi-output](../../fpga/10-hdmi-output/) | Module-Interface、HDMI-IP |
| E11 | MIPI 摄像头输入 | [fpga/11-mipi-camera](../../fpga/11-mipi-camera/) | Module-Interface、Camera-IP |
| E12 | 视频图像处理 | [fpga/12-video-processing](../../fpga/12-video-processing/) | Demos/3.Image-Processing、Image-Process-IP |
| E13 | 单通道简易示波器 | [fpga/13-oscilloscope](../../fpga/13-oscilloscope/) | Demos/6.Instrumentation |
| E14 | 机器视觉 | [fpga/14-machine-vision](../../fpga/14-machine-vision/) | Demos/3.Image-Processing |
| E15 | SPI 与 Arduino 接口 | [fpga/15-spi-arduino](../../fpga/15-spi-arduino/) | Extension-Interface |
| E16 | ESP32 与 FPGA 的 QSPI | [esp32/qspi-fpga](../../esp32/qspi-fpga/) | ESP32-QSPI-FPGA-Waveform-Generator |

**说明：** E01 在本仓库已有可综合的 `sea_blink` 工程（`fpga/01-blink/src/`）；其余目录目前以 README + 官方案例链接为主，按手册步骤迁入工程即可。

## 维护脚本

| 脚本 | 作用 |
| --- | --- |
| `scripts/extract-manual-experiments.py` | 从实验手册 PDF 刷新 `manifest.json` |
| `scripts/enrich-manual-manifest.py` | 写入中文标题、SEA 链接、本地路径 |
| `scripts/build-experiment-readmes.py` | 生成各 `fpga/*/README.md` |
| `scripts/extract-manual-web-content.py` | 从三册 PDF 抽取正文 → `docs/labs/web-content/` 与 `web/src/content/manualContent.json` |
| `scripts/gen-web-manual-lessons.py` | 生成 `web/src/content/experimentCatalog.ts` |

更新 PDF 后依次运行：`extract-manual-experiments.py` → `enrich-manual-manifest.py` → `extract-manual-web-content.py` → `gen-web-manual-lessons.py`，再在 `web/` 执行 `npm run build` 验证。

可勾选**实验步骤**来自 `scripts/lib/curated_steps.py`。**中文 Tab** 目的/导读来自 `scripts/lib/zh_guides.py`（大模型校订，非离线机翻）；**English Tab** 仍为 PDF 提取原文。更新：`python scripts/extract-manual-web-content.py` 或 `python scripts/apply-zh-guides.py`。