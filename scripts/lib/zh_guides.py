"""Human-reviewed Simplified Chinese for manual lessons (LLM-authored, not machine MT)."""

from __future__ import annotations

# id -> fields merged into manualContent.json (Chinese tab only)

ZH_GUIDES: dict[str, dict[str, str]] = {
    "E01": {
        "purpose_zh_body": (
            "熟悉 SEA 板 FPGA 资源、Vivado 编译环境，以及 Verilog 从编写、综合、仿真到下载的完整流程。"
        ),
        "content_zh_body": "在 Vivado 下完成 Hello World/点灯工程、行为级仿真、JTAG 下载验证。",
        "requirement_zh_body": "完成简单电路仿真；下载 bitstream 并在板上验证 LED 等现象。",
        "guide_zh": (
            "一、环境与工程\n"
            "启动 Vivado，File → New Project，工程名如 Lab_1。器件搜索并选择 xc7s15ftgb196-1。"
            "工程类型选 RTL Project，仿真语言 Verilog 或 Mixed，可暂不添加源与约束，在向导后补加。\n\n"
            "二、源文件与约束\n"
            "添加顶层 Verilog（可参考仓库 fpga/01-blink）。新建或导入 XDC，绑定系统时钟与用户 LED 引脚"
            "（以手册或开发板用户指南为准）。\n\n"
            "三、综合实现与仿真\n"
            "Run Synthesis → Run Implementation → Generate Bitstream。"
            "编写 testbench，在 Flow Navigator 中 Run Simulation，观察 LED 或输出端口波形是否与预期一致。\n\n"
            "四、下载\n"
            "板卡 K5 拨至 JTAG，Type-C 供电。Open Hardware Manager → Auto Connect → Program Device，"
            "选择生成的 .bit 文件烧录。对照仿真结果观察板上 LED。\n\n"
            "更细的 Vivado 界面说明见 FPGA 手册 F03；引脚定义见 F01。"
        ),
        "result_zh": "LED 按分频或赋值逻辑闪烁/常亮，与仿真波形一致即通过。",
    },
    "E02": {
        "guide_zh": (
            "实验分编码器与译码器两部分。\n\n"
            "编码器（Lab_2_1）：按真值表实现 4-2 编码器，输入低有效。综合后用按键或拨码作输入、LED 作输出，"
            "仿真核对 enc 输出，再下载板上验证。\n\n"
            "译码器（Lab_2_2）：实现 2-4 译码器，输入 D0/D1 与使能 EN 低有效，输出 Q0–Q3 互斥有效。"
            "流程同为：建工程 → 编码 → 仿真 → 约束 → 下载。\n\n"
            "引脚绑定见手册实验结果表格（K1–K3、Arduino D2/D3、LED 等）。"
        ),
        "result_zh": "输入每一种有效组合时，LED 显示与真值表一致。",
    },
    "E03": {
        "guide_zh": (
            "Lab_3_1：IP Catalog → Math Functions → Multiplier，配置 4 位无符号输入，生成例化文件；"
            "在顶层连接 A、B 与 P，仿真乘法结果，综合通过。\n\n"
            "Lab_3_2：添加板载 RGB LED IP 或导入 SEA 官方案例；在顶层驱动 RGB 分量，"
            "下载后观察两颗级联 RGB LED 颜色变化。\n\n"
            "注意：生成 IP 后须 Run「Generate Output Products」再综合。"
        ),
    },
    "E04": {
        "guide_zh": (
            "按手册顺序实现多种 D 触发器（基本、同步复位、异步复位等），每个模块单独仿真波形。\n"
            "再实现模 5 计数器（或指定计数器），检查复位与进位。\n"
            "统一添加 XDC 后下载；必要时用示波器观察输出周期与占空比。"
        ),
    },
    "E05": {
        "guide_zh": (
            "以板载 100 MHz 时钟为输入，用计数器翻转或 D 触发器级联实现偶数分频（如 4 分频、20 MHz）。\n"
            "按手册完成奇数或半整数分频扩展。仿真对比参考设计波形，下载后用示波器实测频率。"
        ),
    },
    "E06": {
        "guide_zh": (
            "根据状态转移图画 Moore 型密码锁（示例序列如 10010）。状态寄存器编码推荐先二进制或独热码；"
            "输出驱动 LED 表示开锁成功。完整仿真覆盖所有转移后再下载，用 K1 等按键输入序列测试。"
        ),
    },
    "E07": {
        "guide_zh": (
            "使用手册提供的 Lab_7_1（Gray 码）与 Lab_7_2（One-hot）源文件。"
            "对状态或输出做小幅修改后分别做行为仿真，比较资源占用与波形。"
            "理解 Mealy 与 Moore 在本实验中的编码差异；按手册完成下载（若例程含板级约束）。"
        ),
    },
    "E08": {
        "guide_zh": (
            "将实验 5 已验证的分频模块放入工程 Lab_8_1 并成功综合。"
            "Tools → Create and Package New IP，按向导填写名称、版本与路径。"
            "新建工程从 IP Catalog 添加自封装 IP 并例化，仿真/下载确认分频功能未变。"
        ),
    },
    "E09": {
        "guide_zh": (
            "在 MATLAB 中按手册公式生成三角波（或其他波形）采样点，导出 COE/MIF 供 Block Memory 初始化。\n"
            "Vivado 中配置 ROM、地址发生器与 DAC 接口时序；仿真 DAC 数据率与幅度。\n"
            "下载后用示波器测量 DAC 输出并与 MATLAB 预期对比。"
        ),
    },
    "E10": {
        "guide_zh": (
            "在附件 HDMI 时序手册中查 1080p@60 Hz 参数：H_ACTIVE=1920、V_ACTIVE=1080，"
            "以及各段 sync、front porch、back porch 计数值。\n"
            "工程 Lab_10 含 Driver_HDMI 与顶层，依参数产生 DE、HS、VS 与像素流。\n"
            "仿真检查一行内像素计数，再烧录接 Mini HDMI 显示器看测试图。"
        ),
    },
    "E11": {
        "guide_zh": (
            "阅读 OV5647 数据手册相关寄存器（分辨率、时钟、输出格式）。\n"
            "导入或搭建 MIPI CSI 接收链路与摄像头 I2C 配置逻辑（可参考 wanix1988/SEA Camera 工程）。\n"
            "先低分辨率联调，再在 HDMI 通路显示实时画面。"
        ),
    },
    "E12": {
        "guide_zh": (
            "在图像流水线中插入 Sobel 等边缘检测模块（或手册指定算子）。\n"
            "用静态测试图或摄像头场景对比原图与边缘图；可调阈值后下载，在 HDMI 上观察效果。"
        ),
    },
    "E13": {
        "guide_zh": (
            "ADC1173 采样通道进入 FPGA，缓存波形至 RAM。\n"
            "实现 Vpp、频率估算与 HDMI 绘图模块；用信号源输入正弦/方波，核对屏幕读数。"
        ),
    },
    "E14": {
        "guide_zh": (
            "按手册公式实现 RGB→HSV 转换模块，先用仿真向量验证纯色输入。\n"
            "与后续颜色识别/跟踪例程联调，摄像头实时画面显示处理结果。"
        ),
    },
    "E15": {
        "guide_zh": (
            "Arduino 扩展模式下核对 SPI 线序（CS、SCK、MOSI、MISO）。\n"
            "FPGA 作 SPI 主机读写 EEPROM（或从设备）；仿真片选时序，下载后用分析仪或现象验证数据正确。"
        ),
    },
    "E16": {
        "guide_zh": (
            "架构：ESP32 作 QSPI 主机，FPGA 解析命令/地址/数据写入片内 RAM；"
            "数据处理核从 0x00–0x0F 读入、处理（如加 5）后写入 0x10–0x1F。\n"
            "K5=Slave。分别完成 FPGA Slave 与 ESP32 例程（见 esp32/qspi-fpga），"
            "写已知向量并读回比对。"
        ),
    },
    "F01": {
        "guide_zh": (
            "SEA 板 FPGA 为 Xilinx Spartan-7 xc7s15ftgb196-1：约 8k LUT、16k FF、360 Kb BRAM 等。\n"
            "板载 Mini HDMI、MIPI CSI、ADC1173/DAC、六轴传感器、按键与 RGB/LED、Arduino 兼容口、"
            "JTAG 与 ESP32 配置接口。查阅手册引脚总表与「板子」实验台视图，建立外设与 FPGA 脚的对应关系。"
        ),
    },
    "F02": {
        "guide_zh": (
            "JTAG 六针接口用于 Vivado 直接烧录（K5=JTAG）。\n"
            "熟悉 K1–K3 默认电平、L1/L2 与 DONE 含义。外接 MIPI 摄像头或 HDMI 显示器前务必断电操作。"
        ),
    },
    "F03": {
        "guide_zh": (
            "掌握工程创建 → RTL 仿真 → 综合 → 实现 → 生成 bitstream → Hardware Manager 下载的完整路径。\n"
            "熟悉 Flow Navigator 各阶段入口，以及 Timing / Utilization 报告的读法。\n"
            "许可证在 Vivado License Manager 中确认；2018.2 与 2026.1 均可用于本板 xc7s15。"
        ),
    },
    "F04": {
        "guide_zh": (
            "复习 Verilog：module、端口、wire/reg、assign、always 及阻塞/非阻塞赋值。\n"
            "testbench 中 initial、#延时与系统任务；XDC 中时钟、IOSTANDARD 与 PACKAGE_PIN 写法。\n"
            "为后续 E 系列实验打语法与约束基础。"
        ),
    },
    "S01": {
        "guide_zh": (
            "板载 ESP32-D0WDQ6：Wi-Fi/BT、与 FPGA 共享的配置与 QSPI 线。"
            "W25Q32 作启动 Flash。对照 ESP32 手册引脚表理解 SD 卡、QSPI_HD、FPGA_CCLK 等互联。"
        ),
    },
    "S02": {
        "guide_zh": (
            "Type-C 连接 PC，安装 Silicon Labs CP210x 驱动，设备管理器出现串口。\n"
            "出厂已烧录固件；若需重烧，用乐鑫 Flash Download Tool，烧录时按住 BOOT。\n"
            "上电后 PWR 点亮、串口可打开再进行 MicroPython/Arduino 实验。"
        ),
    },
    "S03": {
        "guide_zh": (
            "推荐 uPyCraft 或 Thonny；部分例程需 TF 卡与 boot.py 配置 bit 加载列表。\n"
            "串口连接成功后 Download&Run；K5=Slave 时可通过 xfpga 库从 SD 加载 FPGA 比特流。"
        ),
    },
    "S04": {
        "guide_zh": (
            "Arduino IDE 安装 Espressif ESP32 开发板包与 SEA 相关库。\n"
            "选择正确串口与板型，先编译运行 Blink 确认工具链正常。"
        ),
    },
    "S05": {
        "guide_zh": (
            "阅读 SEA MicroPython 库说明：GPIO、UART、I2C、SPI、Network 等子模块。\n"
            "逐个运行单功能例程；最后运行加载 FPGA 默认 bit 的脚本，确认 DONE 与功能正常。"
        ),
    },
    "S06": {
        "guide_zh": (
            "Arduino 下运行 Wi-Fi 连接、GPIO、串口通信等例程。\n"
            "与 FPGA 协同时保持 K5=Slave，避免 JTAG 与 ESP32 配置脚冲突。"
        ),
    },
}


def apply_zh_guide(row: dict) -> bool:
    pack = ZH_GUIDES.get(row["id"])
    if not pack:
        return False
    for key, value in pack.items():
        if value:
            row[key] = value
    # Drop unreliable machine translations if present
    row.pop("procedure_zh", None)
    row["zh_reviewed"] = True
    return True