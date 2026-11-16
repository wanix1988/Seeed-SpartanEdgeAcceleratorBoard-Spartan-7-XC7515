# E10 HDMI 视频输出

对应手册：**`docs/manuals/SEA-Dev-Manual-Experiment.pdf`** 第 80 页起（Experiment 10）。

## 目的（摘自手册）

1. Familiar with Mini HDMI peripherals and video signal output format. 10.2

## 内容

1. Check the HDMI timing of 1080p to realize HDMI driver. 2. Use Matlab, read the picture (100*100), and save the picture data as a coe file. 3. Write the image generation module, and use HDMI to display the picture on the screen. 10.3

## 官方工程参考（wanix1988/SEA）

- [4.Module-Interface](https://github.com/wanix1988/SEA/tree/master/Examples/FPGA/4.Module-Interface)
- [HDMI-IP](https://github.com/wanix1988/SEA/tree/master/Examples/FPGA-IP/HDMI-IP)

## 本仓库

- 本地目录：`fpga/10-hdmi-output`
- 器件：`xc7s15ftgb196-1`
- 工具：手册约定 Vivado 2018.2；本机可用 Vivado 2026.1 WebPACK。

更完整的实验索引见 [docs/labs/README.md](../../docs/labs/README.md)。
