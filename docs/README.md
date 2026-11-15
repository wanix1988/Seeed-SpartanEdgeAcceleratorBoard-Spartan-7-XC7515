# Spartan Edge Accelerator Board 官方资料

Seeed Studio 的 **Spartan Edge Accelerator Board**（简称 SEA Board，SKU `102030005`）。板上 FPGA 为 Xilinx / AMD Spartan-7 **XC7S15-1FTGB196C**，Vivado 器件名 `xc7s15ftgb196-1`。工程目录名中的 XC7515 指的就是这颗芯片。

无线协处理器为 Espressif **ESP32-D0WDQ6**。板型兼容 Arduino UNO Shield，也可独立使用。

版权归 Seeed Studio、Digi-Key、AMD（Xilinx）、Espressif 各自所有。此处仅作本地开发查阅。

## 来源

- 产品页：<https://www.seeedstudio.com/Spartan-Edge-Accelerator-Board-p-4261.html>
- 官方 Wiki：<https://wiki.seeedstudio.com/Spartan-Edge-Accelerator-Board/>
- 官方文档仓库：<https://github.com/SeeedDocument/Spartan-Edge-Accelerator-Board>
- 开发手册（Seeed 与 Digi-Key 联合发布，Revision V1.0，2020-09-15）
  - <https://media.digikey.com/Resources/Seeed/SEA-Dev-Manual-FPGA.pdf>
  - <https://media.digikey.com/Resources/Seeed/SEA-Dev-Manual-ESP32.pdf>
  - <https://media.digikey.com/Resources/Seeed/SEA-Dev-Manual-Experiment.pdf>

ESP32 加载 bitstream 的库按 [wanix1988/spartan-edge-esp32-boot](https://github.com/wanix1988/spartan-edge-esp32-boot) 开发。Wiki 原链接 [sea-s7/spartan-edge-esp32-boot](https://github.com/sea-s7/spartan-edge-esp32-boot) 已不可用，内容来自 [Pillar1989/spartan-edge-esp32-boot](https://github.com/Pillar1989/spartan-edge-esp32-boot)。

案例仓库（Hello-World / Examples / Demos）按 [wanix1988/SEA](https://github.com/wanix1988/SEA) 开发，内容来自 [DoneSEA/SEA](https://github.com/DoneSEA/SEA)。

可移植的算法、图像、视频和网络包处理项目见 [awesome-projects.md](awesome-projects.md)。

## 目录

### `board/` 板级硬件

| 文件 | 说明 |
| --- | --- |
| `Spartan-Edge-Accelerator-Board-v1.0-schematic.pdf` | v1.0 原理图与 PCB（Seeed 文档仓库） |
| `Spartan-Edge-Accelerator-Board-v1.0.sch` | Eagle 原理图 |
| `Spartan-Edge-Accelerator-Board-v1.0.brd` | Eagle PCB |
| `Spartan-Edge-Accelerator-Board-v1.0-eagle.zip` | Wiki Resources 中的 Eagle 压缩包，内容与上面三个文件相同 |
| `Spartan-Edge-Accelerator-Board-product-sheet.pdf` | Digi-Key 上的 Seeed 产品资料 |

### `chips/` 芯片手册

| 文件 | 说明 |
| --- | --- |
| `Spartan-7-FPGAs-Data-Sheet.pdf` | Spartan-7 数据手册（Wiki 资源） |
| `spartan-7-product-brief.pdf` | Spartan-7 产品简介 |
| `ESP32-datasheet.pdf` | ESP32 数据手册（Wiki 资源） |

### `manuals/` 开发手册

三册均为 Shenzhen Seeed Technology 与东南大学、西南交通大学合作编写，面向入门开发。

| 文件 | 内容 |
| --- | --- |
| `SEA-Dev-Manual-FPGA.pdf` | 板载 FPGA 资源、引脚、Vivado 环境与开发流程 |
| `SEA-Dev-Manual-ESP32.pdf` | 板载 ESP32 引脚、驱动固件、MicroPython 与 Arduino IDE |
| `SEA-Dev-Manual-Experiment.pdf` | 综合实验（逻辑、IP、DAC / HDMI / MIPI、图像处理等） |

手册约定的 FPGA 工具版本为 **Vivado 2018.2**，目标器件 `xc7s15ftgb196-1`。

### `wiki/` 与 `images/`

- `wiki/Seeed-Wiki-Spartan-Edge-Accelerator-Board.md`：Seeed 文档仓库中的 Wiki 原文（英文）。文内图片仍指向 GitHub。
- `images/`：正反面、引脚标注和硬件总览图，来自同一官方仓库。

## 板上要点

- FPGA：12,800 logic cells，360 Kb Block RAM，20 个 DSP slice，最高约 100 MHz
- 编程：JTAG（K5 拨到 JTAG，用 Xilinx 工具）；或 Slave 模式，由 ESP32 从 microSD 加载 bitstream
- 外设：Mini HDMI、CSI（兼容树莓派 Camera V1 / OV5640）、microSD、8-bit ADC1173、6 轴 LSM6DS3、DAC7311、2 个 Grove、10 路 FPGA 用户 IO（IO9–IO0）
- IO 电平：Shield 侧为 5 V，FPGA IO 为 3.3 V，中间有分压。官方说明目前只保证 5 V IO 的 Arduino（如 UNO、Seeeduino V4.2），SAMD21 一类 3.3 V 板电平不够
