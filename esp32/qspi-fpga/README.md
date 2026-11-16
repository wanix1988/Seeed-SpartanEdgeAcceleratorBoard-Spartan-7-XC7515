# E16 ESP32 与 FPGA 的 QSPI

对应手册：**`docs/manuals/SEA-Dev-Manual-Experiment.pdf`** 第 155 页起（Experiment 16）。

## 目的（摘自手册）

1. Familiar with the QSPI communication protocol, and learn the QSPI communication method between ESP32 and FPGA. 2. Learn how to use the QSPI port on ESP32 and Arduino side; 3. Learn the RTL design of the QSPI slave on the FPGA side. 16.2

## 内容

1. Use Micropython to implement QSPI interface (host) on ESP32, and use Arduino IDE to call ESP32 QSPI interface (master). 2. Use Verilog HDL language to complete the circuit design of the QSPI slave on the FPGA side. 3. The ESP32 side sends data to 0x00 ~ 0x1F of FPGA internal RAM for storage through the QSPI interface. 4. Arduino side sends and reads and writes the 0x00 ~ 0x01 data of FPGA internal RAM through QSPI interface. 5. On the FPGA side, build a simple addition module and store the calculation result in the address 0x10 ~ 0x1F. 6. Use QSPI on the ESP32 side to read the data from 0x10 ~ 0x1F and check whether the result is correct. 16.3

## 官方工程参考（wanix1988/SEA）

- [ESP32-QSPI-FPGA-Waveform-Generator](https://github.com/wanix1988/SEA/tree/master/Demos/6.Instrumentation/ESP32-QSPI-FPGA-Waveform-Generator)
- [ESP32](https://github.com/wanix1988/SEA/tree/master/Examples/ESP32)

## 本仓库

- 本地目录：`esp32/qspi-fpga`
- 器件：`xc7s15ftgb196-1`
- 工具：手册约定 Vivado 2018.2；本机可用 Vivado 2026.1 WebPACK。

更完整的实验索引见 [docs/labs/README.md](../../docs/labs/README.md)。
