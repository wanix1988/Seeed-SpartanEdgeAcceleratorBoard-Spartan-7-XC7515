# 适合 SEA Board 的实践项目

面向 Spartan Edge Accelerator Board（Spartan-7 **XC7S15-1FTGB196C**）。优先收算法、图像、视频和网络包处理。板上案例在 [wanix1988/SEA](https://github.com/wanix1988/SEA)，下表路径相对于该仓库根目录。

## 这块板能做什么

| 资源 | 数量 | 对项目的影响 |
| --- | --- | --- |
| Logic cells | 12,800 | 一条像素流水线、一个迭代型 AES/SHA-256、一个 100M RMII MAC 可以放下。完整 CNN、10G MAC、软核加 DDR 控制器会不够。 |
| Block RAM | 360 Kb | 只能缓存若干行像素，不能帧缓存 720p。算法要做成逐像素流水，不要整帧读进片内。 |
| DSP | 20 | 够 3×3 卷积、定点 PID、小规模 MAC。不够并行大卷积。 |
| 收发器 | 无 | 没有 GTP/GTX，做不了 SGMII、PCIe、10G/25G。 |
| 视频口 | Mini HDMI 输出，CSI 输入 | 官方摄像头是树莓派 Camera V1（OV5647）。很多外部例程写的是 OV5640，寄存器和引脚都要改。 |
| 网络 | 板载只有 ESP32 Wi-Fi/BLE | FPGA 上没有以太网 PHY。包处理要么走 ESP32 的 SPI/QSPI，要么外接 RMII PHY。 |

下面的「适配」分三档：

- **板上已有**：fork 里就能打开的工程。
- **适合移植**：RTL 小，数据是流，改引脚和时钟后可以落到 XC7S15。
- **只作结构参考**：依赖大 FPGA、DDR 或高速串行口，不要整工程搬过来。

## 先做这几条

1. 摄像头到 HDMI 打通，再在中间插入已有的灰度、HSV、Sobel IP。通路在 `Examples/FPGA/4.Module-Interface`，算法 IP 在 `Examples/FPGA-IP/Image-Process-IP`。
2. 用 [hdl-util/hdmi](https://github.com/hdl-util/hdmi) 替换或对照官方 HDMI。这个库在 SEA Board 上实测过。
3. 把颜色识别或形状识别接到 ESP32：FPGA 出坐标或类别，ESP32 经 Wi-Fi 送出去。板上已有 SPI/QSPI 寄存器协议。
4. 包处理先不接 PHY。ESP32 收 UDP，把载荷经 QSPI 交给 FPGA 做 AES 或 SHA-256，再回传。AES 演示已经是这条数据通路。
5. 若要 FPGA 直接看以太网帧，用 10 路用户 IO（IO9–IO0）外接 LAN8720 一类 RMII PHY，只做 100 Mbit/s。

## 图像与视频

### 板上已有

| 项目 | 本地路径 | 做什么 |
| --- | --- | --- |
| 图像处理 IP | `Examples/FPGA-IP/Image-Process-IP` | RGB 转灰度、RGB↔HSV、Sobel 边缘。灰度用移位代替小数乘法，边缘用行缓存加 3×3 窗口。 |
| MIPI 摄像头与 HDMI | `Examples/FPGA/4.Module-Interface` | 板载 CSI、Mini HDMI 的接口工程，图像 IP 的推荐接法写在 Image-Process-IP 的说明里。 |
| 颜色识别与跟踪 | `Demos/3.Image-Processing/Color-Recognition-and-Object-Traking` | 框选颜色后全屏跟踪最大色块，SPI 读出中心坐标和近似度。 |
| 二维形状识别 | `Demos/3.Image-Processing/2-D-Geometric-Shape-Recognition` | 灰度、阈值之后，用三条扫描线上的像素计数区分圆、三角形、矩形。作者给出的吞吐超过 30 帧/秒，结果走 SPI 或 QSPI。 |

颜色识别和形状识别的 Vivado 源码说明里指向百度网盘，仓库里主要是使用说明和协议，移植前要先把源码补进 fork。

### 适合移植

| 项目 | 地址 | 为什么值得看 |
| --- | --- | --- |
| hdl-util/hdmi | <https://github.com/hdl-util/hdmi> | SystemVerilog 的 HDMI 1.4b 源端，含数据包、音频和 InfoFrame。README 写明在 Spartan Edge Accelerator Board 上测过。像素时钟加 5 倍串行时钟，用板上两块 CMT 可以生成。1080p60 的 148.5 MHz 对这颗芯片偏紧，先做 640×480 或 720p30。 |
| hdl-util/hdmi-demo | <https://github.com/hdl-util/hdmi-demo> | 上面这个 HDMI 核的演示工程，含测试图案和 PLL 例程。 |
| Project F | <https://github.com/projf/projf-explore> | 从 Pong、精灵、画线到定点乘除。明确支持 Xilinx 7 系列，包括 Spartan-7 的 `MMCME2`、`OBUFDS`、`OSERDES2`。图形部分默认是 VGA 时序，接到本板要换成 HDMI TMDS。MIT。 |
| FPGA_image_process | <https://github.com/iharbour-heyaonan/FPGA_image_process> | 灰度、二值化、均值/中值滤波、Sobel、膨胀、腐蚀、开闭运算。用 BMP 仿真激励看结果，再串进摄像头流水线。行缓存用 Shift RAM，和板上 Edge_Check 是同一类结构。 |
| fpga_sobel_ov5640_hdmi | <https://github.com/xiesicong/fpga_sobel_ov5640_hdmi> | 摄像头、Sobel、HDMI 串在一个工程里。传感器是 OV5640，本板官方摄像头是 OV5647，引脚和 I2C 寄存器表不能直接用。 |

### 只作结构参考

| 项目 | 地址 | 限制 |
| --- | --- | --- |
| FPGA-Based-Spatial-Image-Filter | <https://github.com/amartya-rao/FPGA-Based-Spatial-Image-Filter> | 3×3 卷积和 Sobel 的 AXI-Stream 写法清楚，但顶层是 Zynq 加 AXI DMA，本板没有 PS。 |
| kiran-vuksanaj/ov5640-probe | <https://github.com/kiran-vuksanaj/ov5640-probe> | OV5640 到 HDMI 的活例子，目标是 Spartan-7 XC7S50，并用了片外 DRAM。XC7S15 没有那么多 BRAM，也不能照搬 MIG。 |

## 算法

### 板上已有

| 项目 | 本地路径 | 做什么 |
| --- | --- | --- |
| AES | `Demos/5.Algorithm/AES-Algorithm` | ADC 采样值加密，密钥来自拨码，密文经 QSPI 到 ESP32，再上云；回程在 FPGA 解密。源码说明指向百度网盘。 |
| SHA-256 | `Demos/5.Algorithm/SHA256` | 目录在算法演示里。仓库说明把 AES 和哈希放在物联网方向。 |
| PID | `Demos/5.Algorithm/PID-Algorithm-On-FPGA` | 离散 PID，接口是 50 MHz 时钟、9 位带符号误差和调节量。适合接 ADC 误差、DAC 输出。源码同样在网盘。 |

### 适合移植

| 项目 | 地址 | 为什么值得看 |
| --- | --- | --- |
| secworks/aes | <https://github.com/secworks/aes> | 迭代式 AES-128/256，每块 128 位、约 46 拍。Artix-7 上大约 2300 slice。只做 CTR/GCM 时可以砍掉解密通路，面积再降一截。比网盘里的 AES 更适合当后续开发的核。BSD。 |
| secworks/sha256 | <https://github.com/secworks/sha256> | 低面积 SHA-256/224，逐轮迭代。Spartan-6 参考数据约 2012 LUT、70 MHz。调用方自己做填充。适合给 ESP32 送来的数据包做摘要。 |
| Project F 数学部分 | <https://projectf.io/posts/fpga-math-library/> | 定点、DSP 乘法、除法、开方。20 个 DSP 够这些算子，也是图像里除法和归一化的替代实现。代码在 [projf-explore](https://github.com/projf/projf-explore) 的 `lib/`。 |

图像流水线里优先用移位和阈值，把除法留在标定阶段。板上 RGB2HSV 已经因为除法多出若干拍延迟，新算法要沿用它的 `Delay_Num` 做法，把控制信号一起对齐。

## 网络包处理

本板没有以太网 PHY，也没有高速收发器。能做的是 100 Mbit/s RMII，或者把 ESP32 已经收到的帧拆给 FPGA。

10 路 FPGA IO 刚好够一颗 RMII PHY：`REF_CLK`、`TXD[1:0]`、`TX_EN`、`RXD[1:0]`、`CRS_DV`、`MDC`、`MDIO`，还剩 1 根给复位或中断。不要规划千兆 RGMII。

### 适合移植

| 项目 | 地址 | 怎么用在本板 |
| --- | --- | --- |
| verilog-ethernet | <https://github.com/alexforencich/verilog-ethernet> | 以太网帧、ARP、IPv4、UDP 的 AXI-Stream 组件，带 cocotb。先只用 `eth_axis_rx`、UDP/IP 解析这些与 PHY 无关的模块，输入改成 ESP32 经 QSPI 送进来的字节流。不要例化 1G/10G/25G MAC 或 PCS。 |
| rmii-ethernet-mac | <https://github.com/MasterPlayer/rmii-ethernet-mac> | 面向 LAN8720 的 10/100 RMII MAC，输出字节流，带 CRC。作者标明 10 Mbit/s 没测过，也没有 MDIO。适合作为外接 PHY 时的 MAC，解析仍用上面的协议模块。 |
| Nexys-4-DDR-Ethernet-Mac | <https://github.com/chasep255/Nexys-4-DDR-Ethernet-Mac> | 另一份 RMII MAC，带 SMI 和 AXI-Stream，封装成 Vivado IP。板级引脚是 Nexys，只借 MAC。 |
| rmiiSDR | <https://github.com/radiolab81/rmiiSDR> | 从 RMII 到以太网、IPv4、UDP 端口分流，全程 Verilog，带 Verilator。顶层是 SDR，要拆的是帧解析和 UDP 路由，不是 DAC。 |

### 板上已有的数据通路

这些工程不是以太网 MAC，但已经把「外部进来的数据 ↔ FPGA 算法」走通，包处理应接在这里：

| 项目 | 本地路径 | 可接上的处理 |
| --- | --- | --- |
| AES 上云 | `Demos/5.Algorithm/AES-Algorithm` | UDP 载荷替换 ADC 采样，成为加密网关。 |
| 形状结果读出 | `Demos/3.Image-Processing/2-D-Geometric-Shape-Recognition` | QSPI 寄存器读 8 位类别，ESP32 打包上报。 |
| 波形发生器 | `Demos/6.Instrumentation/ESP32-QSPI-FPGA-Waveform-Generator` | QSPI 主从时序可直接复用。 |

### 不要整库搬的项目

Corundum、NetFPGA、P4→FPGA、liteX 上的千兆交换，都依赖 PCIe、大量 BRAM 或高速串行口。XC7S15 上只适合读它们的帧格式和状态机，不能综合进本板。

## 和本板资源匹配的实现习惯

- 像素和报文都用流：`valid` 表示当前拍数据有效，行、帧或包结束单独一根信号。图像侧可以沿用现有的 `RGB_DE`。
- 3×3 窗口只缓存两行。640 宽、8 位灰度大约 10 Kb，360 Kb BRAM 够用。不要把 1280×720 彩色帧放进片内。
- 乘加用 DSP 推断或移位加法。Sobel 系数是 1 和 2，不需要通用乘法器。
- 加密用迭代核，不要展开全部轮。secworks 的 AES 约 46 拍一块，100 MHz 下仍远高于 100 Mbit/s 链路。
- 协议解析和算法分开。MAC/字节流在一侧，AES、SHA-256、阈值和质心在另一侧，中间用很小的 FIFO 跨时钟。
