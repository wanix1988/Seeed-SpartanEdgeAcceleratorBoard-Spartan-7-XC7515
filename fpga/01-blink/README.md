# E01 熟悉开发板与 Vivado 环境

对应手册：**`docs/manuals/SEA-Dev-Manual-Experiment.pdf`** 第 12 页起（Experiment 1）。

## 目的（摘自手册）

1. Familiar with the logic resources and peripheral resources of the SEA development board. 2. Familiar with Vivado's compilation environment. 3. Familiar with the programming and development flow using Verilog language under the Vivado environment, including source program writing, compilation, simulation and program download.

## 内容

1. Hello Word program programming under Vivado environment. 2. Timing waveform simulation. 3. Download verification. 1.3

## 官方工程参考（wanix1988/SEA）

- [FPGA](https://github.com/wanix1988/SEA/tree/master/Hello-World/FPGA)
- [Verilog](https://github.com/wanix1988/SEA/tree/master/Hello-World/FPGA/Verilog)

## 本仓库（已可综合）

- 源码：`src/sea_blink.v`
- 约束：`constrs/sea_blink.xdc`
- 建工程：`create_project.tcl`，或打开 `sea_blink/sea_blink.xpr`
- 器件：`xc7s15ftgb196-1` · 工具：手册 2018.2 / 本机可用 Vivado 2026.1

更完整的实验索引见 [docs/labs/README.md](../../docs/labs/README.md)。
