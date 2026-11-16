"""Executable bilingual checklists for manual lessons (replaces PDF text shredding)."""

from __future__ import annotations

# id -> {"zh": [...], "en": [...]}

CURATED: dict[str, dict[str, list[str]]] = {
    "E01": {
        "zh": [
            "启动 Vivado，新建 RTL 工程（如 Lab_1），器件选择 xc7s15ftgb196-1，语言 Verilog。",
            "添加顶层 Verilog 与板级约束 XDC（时钟、LED 等引脚见手册或 fpga/01-blink）。",
            "Run Synthesis → Run Implementation → Generate Bitstream，确认无报错。",
            "编写 testbench，Run Behavioral Simulation，核对 LED/输出波形。",
            "K5 拨到 JTAG，USB 连接板子，Open Hardware Manager → Program Device 下载 bitstream。",
            "观察板上 LED 现象是否与仿真一致，记录结果。",
        ],
        "en": [
            "Launch Vivado; create RTL project (e.g. Lab_1), part xc7s15ftgb196-1, Verilog.",
            "Add top-level Verilog and XDC constraints (see manual or fpga/01-blink).",
            "Run Synthesis → Implementation → Generate Bitstream.",
            "Create testbench and run behavioral simulation; check LED/waveforms.",
            "Set K5 to JTAG, connect USB, Program Device from Hardware Manager.",
            "Verify on-board LED behavior matches simulation; record results.",
        ],
    },
    "E02": {
        "zh": [
            "新建工程 Lab_2_1，实现 4-2 编码器（或按手册 Lab 编号）；器件 xc7s15ftgb196-1。",
            "编写 Verilog 并综合；按键/输入绑板载 K1–K3 或扩展 IO，输出绑 LED。",
            "时序仿真，对照真值表检查编码输出。",
            "下载 bitstream，按实验现象表验证输入组合与 LED。",
            "新建 Lab_2_2，实现 2-4 译码器，重复仿真→约束→下载流程。",
        ],
        "en": [
            "New project Lab_2_1: 4-to-2 encoder; part xc7s15ftgb196-1.",
            "Synthesize; map inputs to keys/IO, outputs to LEDs.",
            "Simulate and verify outputs against the truth table.",
            "Program FPGA and check LED patterns on the board.",
            "New project Lab_2_2: 2-to-4 decoder; repeat simulate → constrain → program.",
        ],
    },
    "E03": {
        "zh": [
            "新建 Lab_3_1，添加顶层 Verilog；打开 IP Catalog，例化 Multiplier（4×4 无符号）。",
            "完成连线、Generate Output Products，综合并联仿乘法器功能。",
            "新建 Lab_3_2，添加并例化 RGB LED 板载 IP（或官方案例工程）。",
            "编写激励改变 RGB 分量，仿真/下载后观察级联 RGB LED 颜色。",
        ],
        "en": [
            "Project Lab_3_1; instantiate Multiplier IP (4×4 unsigned) from IP Catalog.",
            "Generate IP output products, synthesize, simulate multiplier.",
            "Project Lab_3_2; add RGB LED IP from board examples.",
            "Drive RGB inputs, program FPGA, observe RGB LEDs.",
        ],
    },
    "E04": {
        "zh": [
            "按手册依次实现各 D 触发器变体（基本型、同步/异步复位等），每段代码单独仿真。",
            "实现模 5 计数器（或指定计数器），写 testbench 看计数值与进位。",
            "添加 XDC，K5=JTAG 下载，用 LED 或逻辑分析仪验证计数值。",
            "必要时用示波器观察时钟与输出边沿。",
        ],
        "en": [
            "Implement each D flip-flop variant from the manual; simulate each module.",
            "Implement modulo-5 counter; simulate count sequence.",
            "Add XDC, program via JTAG, verify count on LEDs or probes.",
            "Use oscilloscope if needed for clock and edges.",
        ],
    },
    "E05": {
        "zh": [
            "以板载 100 MHz 系统时钟为输入，设计偶数分频（如 ÷4）并在仿真中对比示例波形。",
            "实现奇数或半整数分频（按手册要求任选一种）。",
            "约束输出引脚，下载后用示波器测频率是否与分频比一致。",
        ],
        "en": [
            "Design even divider (e.g. ÷4) from 100 MHz; compare simulation to reference.",
            "Implement odd or half-integer divider per manual.",
            "Program FPGA; measure output frequency with oscilloscope.",
        ],
    },
    "E06": {
        "zh": [
            "按状态图画 Moore 密码锁（如序列 10010），划分状态与输出（LED）。",
            "用独热码或二进制编码状态寄存器，写 Verilog 并仿真全状态转移。",
            "板上下载，用按键输入序列，验证正确码点亮 LED、错误码保持灭。",
        ],
        "en": [
            "Draw Moore state diagram (e.g. lock code 10010); assign LED outputs.",
            "Code FSM in Verilog; simulate all transitions.",
            "Program board; enter codes on keys, verify LED behavior.",
        ],
    },
    "E07": {
        "zh": [
            "打开 Lab_7_1（Gray 码）与 Lab_7_2（One-hot）例程或自建工程。",
            "按手册微调状态/输出，分别跑行为仿真并保存波形。",
            "对比两种编码的资源占用与仿真结果，记录差异。",
            "下载其一或两者到板验证（若例程含 IO）。",
        ],
        "en": [
            "Open Lab_7_1 (Gray) and Lab_7_2 (One-hot) projects or create your own.",
            "Apply manual tweaks; run behavioral simulation for each.",
            "Compare resource use and waveforms between encodings.",
            "Program FPGA if IO is wired in the example.",
        ],
    },
    "E08": {
        "zh": [
            "将实验 5 的分频模块放入 Lab_8_1，Run Synthesis。",
            "Tools → Create and Package New IP，按向导完成封装与版本信息。",
            "新建工程，从 IP Catalog 添加自封装 IP，顶层例化并综合。",
            "仿真/下载，确认分频输出与封装前一致。",
        ],
        "en": [
            "Put divider from Exp.5 into Lab_8_1; run synthesis.",
            "Tools → Create and Package New IP; finish wizard.",
            "New project; add your packaged IP and instantiate.",
            "Simulate/program; verify divider output unchanged.",
        ],
    },
    "E09": {
        "zh": [
            "用 MATLAB/Octave 按手册生成波形 ROM 系数（如三角波），导出 .coe 或 .mif。",
            "Vivado 中添加 ROM IP 加载系数，设计地址累加与 DAC 接口逻辑。",
            "仿真地址与 DAC 数据，检查幅度与周期。",
            "下载后连接示波器到 DAC 输出，对比设定频率/波形。",
        ],
        "en": [
            "Generate ROM coefficients (e.g. triangle) in MATLAB; export COE/MIF.",
            "Add ROM IP in Vivado; build address counter and DAC interface.",
            "Simulate DAC codes and timing.",
            "Program FPGA; probe DAC with oscilloscope.",
        ],
    },
    "E10": {
        "zh": [
            "阅读附件 HDMI 时序手册，记录 1080p@60 的 H/V 同步与消隐参数。",
            "新建 Lab_10，添加 Driver_HDMI 与顶层，按参数产生像素与同步信号。",
            "仿真一行/一帧时序，确认 H_ACTIVE=1920、V_ACTIVE=1080。",
            "生成 bitstream，HDMI 接显示器，上电看测试图是否稳定全屏。",
        ],
        "en": [
            "From HDMI timing doc, note 1080p@60 sync/front-porch/back-porch values.",
            "Project Lab_10: Driver_HDMI + top; generate pixel and sync signals.",
            "Simulate line/frame timing (H_ACTIVE=1920, V_ACTIVE=1080).",
            "Program FPGA; connect HDMI monitor; check stable test pattern.",
        ],
    },
    "E11": {
        "zh": [
            "查阅 OV5647 手册寄存器表，确定目标分辨率与时钟（如 1080p 或 720p）。",
            "导入/创建 MIPI 接收与摄像头配置模块工程（可参考 SEA 案例）。",
            "仿真或 ILA 确认 DVP/MIPI 数据有效；必要时先低分辨率调试。",
            "配合 HDMI 或缓存显示通路，上电看是否出图。",
        ],
        "en": [
            "Read OV5647 register tables; set resolution and clock.",
            "Import/create MIPI RX and sensor config (SEA examples).",
            "Simulate or use ILA on capture path; start at lower resolution if needed.",
            "Bring up HDMI/display path; confirm live image.",
        ],
    },
    "E12": {
        "zh": [
            "在图像流水线中插入 Sobel（或手册指定）边缘检测模块。",
            "用测试图或摄像头静态场景做仿真/在线对比原图与边缘图。",
            "调整卷积核阈值（若有），下载后在 HDMI 上查看效果。",
        ],
        "en": [
            "Insert Sobel (or specified) edge detector in the video pipeline.",
            "Simulate or run with test pattern / camera still.",
            "Tune threshold if applicable; check HDMI output.",
        ],
    },
    "E13": {
        "zh": [
            "ADC 采样模块接入单通道模拟输入（板上 ADC1173）。",
            "实现 Vpp、频率估算与波形 RAM 缓存逻辑。",
            "在 HDMI 上绘制波形并标注测量值，与信号源对比。",
        ],
        "en": [
            "Connect ADC sample path to on-board ADC1173 input.",
            "Implement Vpp, frequency estimate, waveform buffer.",
            "Draw trace on HDMI with readouts; compare to signal generator.",
        ],
    },
    "E14": {
        "zh": [
            "实现 RGB→HSV 转换模块（按手册公式），仿真纯色块输入。",
            "与后续颜色分割/跟踪模块联调（若案例含）。",
            "摄像头输入实时画面，在 HDMI 观察 HSV 处理效果。",
        ],
        "en": [
            "Implement RGB→HSV per manual; simulate solid-color inputs.",
            "Integrate with color segmentation/tracking if in example.",
            "Run live camera feed; view HSV result on HDMI.",
        ],
    },
    "E15": {
        "zh": [
            "在 Arduino 扩展模式下确认 SPI 引脚与 SEA 手册一致。",
            "FPGA 侧例化 SPI 主机，按 EEPROM（或从设备）时序读写。",
            "仿真片选/时钟/数据相位，下载后用逻辑分析仪或 LED 指示验证读写。",
        ],
        "en": [
            "Confirm SPI pins in Arduino shield mode per manual.",
            "Instantiate SPI master in FPGA; read/write EEPROM (or slave).",
            "Simulate CS/clock/data; program and verify with analyzer or LEDs.",
        ],
    },
    "E16": {
        "zh": [
            "K5 拨 Slave；理解 QSPI 地址 0x00–0x0f 写、0x10–0x1f 读回的数据通路。",
            "FPGA 实现 QSPI Slave 与 RAM；数据处理模块（如 +5）按手册例程。",
            "ESP32 侧用 MicroPython/Arduino 例程发起 QSPI 写读（见 esp32/qspi-fpga）。",
            "写已知数据，读回比对或观察 HDMI/串口打印是否一致。",
        ],
        "en": [
            "K5 to Slave; map QSPI writes 0x00–0x0f and readback 0x10–0x1f.",
            "FPGA: QSPI slave + RAM + processing (e.g. +5) per manual.",
            "ESP32: run MicroPython/Arduino QSPI example (esp32/qspi-fpga).",
            "Write known data; verify readback or host logs.",
        ],
    },
    "F01": {
        "zh": [
            "记住 FPGA 型号 xc7s15ftgb196-1 与主要资源（LUT/FF/BRAM/DSP）。",
            "对照手册引脚表，弄清 HDMI、MIPI、ADC/DAC、Arduino 口对应 FPGA 脚位。",
            "在实验台「板子」页点亮本课相关功能块，和原理图概念对齐。",
        ],
        "en": [
            "Note FPGA part xc7s15ftgb196-1 and key resources.",
            "Map HDMI, MIPI, ADC/DAC, Arduino headers to FPGA pins from the manual.",
            "Use the Board page in the lab UI to match peripherals.",
        ],
    },
    "F02": {
        "zh": [
            "连接 JTAG 下载器或 USB-JTAG 路径；确认 K5=JTAG 时可被 Vivado 识别。",
            "熟悉 K1–K3、RGB/L1–L2、DONE 灯位置与默认电平。",
            "如需外接 MIPI 摄像头或 HDMI 屏，断电后接线再上电。",
        ],
        "en": [
            "Connect JTAG path; K5=JTAG for Vivado Hardware Manager.",
            "Locate keys K1–K3, LEDs, DONE and default levels.",
            "Power off before attaching MIPI camera or HDMI display.",
        ],
    },
    "F03": {
        "zh": [
            "安装 Vivado 2018.2 或本仓库 2026.1，在 License Manager 中确认许可有效。",
            "新建工程并走完仿真 → 综合 → 实现 → 生成 bitstream 一次。",
            "打开一份 Implementation 报告的时序与资源摘要，确认会找 WNS 与 LUT 占用。",
        ],
        "en": [
            "Install Vivado 2018.2 or 2026.1; confirm license in License Manager.",
            "Create a project and run sim → synth → impl → bitstream once.",
            "Open timing/utilization summary and locate WNS and LUT usage.",
        ],
    },
    "F04": {
        "zh": [
            "复习 module、always、assign 与阻塞/非阻塞赋值区别。",
            "完成手册小练习 testbench 编写与 XDC 基本语法。",
            "在后续 E 实验中套用相同语法习惯。",
        ],
        "en": [
            "Review module, always, assign, blocking vs non-blocking.",
            "Practice testbench and basic XDC from the manual.",
            "Apply same style in E01–E16 labs.",
        ],
    },
    "S01": {
        "zh": [
            "了解 ESP32-D0WDQ6、板载 Flash 与 FPGA 配置脚（CCLK、DIN 等）关系。",
            "对照 ESP32 引脚表，弄清 QSPI 与 SD 卡所占 IO。",
        ],
        "en": [
            "Understand ESP32, flash, and FPGA config pins (CCLK, DIN, etc.).",
            "Map QSPI and SD card pins from the ESP32 table.",
        ],
    },
    "S02": {
        "zh": [
            "Type-C 连接 PC，安装 CP210x 驱动并在设备管理器确认串口。",
            "需要时按手册使用 Flash Download Tool 烧录 ESP32 固件。",
            "上电后 PWR 与串口枚举正常再进入后续实验。",
        ],
        "en": [
            "Install CP210x driver; confirm COM port over Type-C.",
            "Use Flash Download Tool if reflashing ESP32 firmware.",
            "Verify power and USB enum before later labs.",
        ],
    },
    "S03": {
        "zh": [
            "安装 uPyCraft 或 Thonny；插入 TF 卡（若例程需要）。",
            "连接串口，Download&Run 官方或仓库 microPython 例程。",
            "练习通过 xfpga 库从 SD 加载 bitstream（K5=Slave）。",
        ],
        "en": [
            "Install uPyCraft or Thonny; insert TF card if required.",
            "Connect serial; flash/run MicroPython examples.",
            "Load bitstream from SD via xfpga with K5=Slave.",
        ],
    },
    "S04": {
        "zh": [
            "Arduino IDE 安装 ESP32 板卡包与 SEA 所需库。",
            "选择正确 COM 口与开发板型号，编译 Blink 测通。",
        ],
        "en": [
            "Install ESP32 board package and SEA libraries in Arduino IDE.",
            "Select correct port/board; build Blink sketch.",
        ],
    },
    "S05": {
        "zh": [
            "阅读 MicroPython 库目录与 boot.py/main.py 加载顺序。",
            "运行 GPIO/UART/I2C/SPI 单功能例程各一个。",
            "运行加载默认 FPGA bit 的例程，确认 DONE 亮。",
        ],
        "en": [
            "Review library layout and boot.py/main.py boot order.",
            "Run one example each for GPIO/UART/I2C/SPI.",
            "Run default bitstream load example; check DONE LED.",
        ],
    },
    "S06": {
        "zh": [
            "Arduino 下编译 Wi-Fi 连接或 GPIO 与串口例程。",
            "与 FPGA 协同实验时固定 K5=Slave，避免 JTAG 占用配置脚。",
        ],
        "en": [
            "Build Wi-Fi or GPIO/serial Arduino sketches.",
            "For FPGA co-design use K5=Slave to avoid JTAG conflict.",
        ],
    },
}


def apply_curated(row: dict) -> bool:
    pack = CURATED.get(row["id"])
    if not pack:
        return False
    row["steps"] = pack["en"]
    row["steps_zh"] = pack["zh"]
    row["steps_curated"] = True
    return True