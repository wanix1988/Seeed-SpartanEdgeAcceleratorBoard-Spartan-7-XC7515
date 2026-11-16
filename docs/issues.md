# 问题记录

本板开发里已经查清的问题记在这里。新问题按同样的格式往下加：日期、现象、原因、处理。不要写入本机路径、用户名或账号。

## 2026-11-16　ESP32 配置成功后立刻重启，灯序和串口都不正常

用没有 JTAG 下载器的方式做入门实验 01：Vivado 生成 `sea_blink.bit`，放到 microSD 的 `/overlay/default.bit`，K5 拨到 Slave，Arduino 示例 `01LoadDefaultBitstream` 由 ESP32 把 bitstream 写进 XC7S15。开发板选 DOIT ESP32 DEVKIT V1，串口监视器 115200。ESP32 Arduino 核心为 3.3.12。

正常时应停在下面的状态：

- 串口先打印 `FPGA Configuration success`，之后每 3 秒一行 `run`
- FPGA_DONE（红色）常亮
- L1（绿色，原理图 FPGA_LED1，封装脚 J1）以大约 3 Hz 连续闪
- L2（红色，原理图 FPGA_LED2，封装脚 A13）保持熄灭

实际现象：FPGA_DONE 闪一下，L1 闪完熄灭，接着 L2 闪。115200 下像乱码。把监视器改成 **74880** 后能看到复位日志，其中有：

- `rst:0xc (SW_CPU_RESET)`
- `FPGA Configuration success`
- `Guru Meditation Error: Core 1 panic'ed (LoadProhibited)`
- `EXCVADDR: 0x0000008c`

原因：bitstream 已经写完，崩溃发生在这之后。`xlibsSstream()` 声明返回 `int`，成功路径打印完 `FPGA Configuration success` 就结束，没有 `return`。核心 3.3 按带返回值的函数做异常退栈，销毁打开的 `File` 时读到空指针，软件复位。ESP32 的复位日志波特率是 74880，所以 115200 下是乱码。每次复位都会重新拉低 PROGRAM 再配置 FPGA，DONE 和两颗用户灯被打断，看起来像灯序错误。

处理：在 [wanix1988/spartan-edge-esp32-boot](https://github.com/wanix1988/spartan-edge-esp32-boot) 的 `src/spartan-edge-esp32-boot.cpp` 里，配置失败返回 `-1`，成功返回 `0`。重新编译上传后再按 RST。同一函数里，ESP32 Arduino 3.x 已删除 `sdmmc_host_pullup_en`，SD 卡 4 位模式改为对 GPIO14、GPIO15、GPIO2、GPIO4、GPIO12、GPIO13 打开内部上拉。
