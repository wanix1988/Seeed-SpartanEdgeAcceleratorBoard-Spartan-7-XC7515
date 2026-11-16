/** Spartan-7 XC7S15-1FTGB196C 片上资源示意。数值来自 Seeed Wiki / AMD Spartan-7 数据手册。 */

export type FpgaDieModuleId =
  | "clb"
  | "bram"
  | "dsp"
  | "cmt"
  | "iob"
  | "config"
  | "int"
  | "xadc";

export type FpgaDieModule = {
  id: FpgaDieModuleId;
  name: string;
  subtitle: string;
  /** 芯片俯视归一化矩形 [u0, v0, u1, v1]，原点在左上。 */
  rect: [number, number, number, number];
  color: number;
  specs: { label: string; value: string }[];
  detail: string[];
};

export const fpgaDieTitle = "XC7S15（xc7s15ftgb196-1）";

export const fpgaDieModules: FpgaDieModule[] = [
  {
    id: "iob",
    name: "HP I/O 环",
    subtitle: "器件脚与片上逻辑的接口",
    rect: [0.04, 0.04, 0.96, 0.96],
    color: 0x2a6f8f,
    specs: [
      { label: "I/O 组", value: "HP（高性能），本板 FPGA 侧 IO 为 3.3 V LVCMOS" },
      { label: "封装", value: "FTGB196（19×19 mm，0.8 mm 球栅）" },
      { label: "板上用途", value: "10 路用户 IO（IO9~IO0）、Mini HDMI、CSI、ESP32 配置口等，见原理图" },
    ],
    detail: [
      "IOB 把封装上的焊球接到片内的互连和 CLB。不同 Bank 可走不同 I/O 标准，本开发板外围多是 3.3 V。",
      "时序约束（XDC）里要给每个端口写 PACKAGE_PIN 和 IOSTANDARD，和实验 01 里 led、clk 一样。",
    ],
  },
  {
    id: "clb",
    name: "CLB / Slice 阵列",
    subtitle: "组合逻辑与寄存器的主体",
    rect: [0.2, 0.2, 0.8, 0.8],
    color: 0x3d9a5a,
    specs: [
      { label: "Logic Cells", value: "12,800" },
      { label: "Slices", value: "2,000" },
      { label: "CLB Flip-Flops", value: "16,000" },
      { label: "分布式 RAM", value: "最大约 150 Kb" },
    ],
    detail: [
      "综合工具把你的 Verilog 译成 LUT + 触发器，主要落在这片区域。入门实验 01 的分频计数器就在这里。",
      "Slice 里的 LUT6 做组合函数，FF 在时钟沿锁存。布线不够时，工具会报 utilization 或 timing 失败。",
    ],
  },
  {
    id: "bram",
    name: "Block RAM",
    subtitle: "True Dual-Port 片上存储",
    rect: [0.06, 0.22, 0.18, 0.72],
    color: 0x7a5eb0,
    specs: [
      { label: "RAMB36 块数", value: "10（含 FIFO 模式，可选 ECC）" },
      { label: "总容量", value: "360 Kb（约 45 KB）" },
      { label: "典型宽度", value: "可配 1b～72b，双端口独立时钟" },
    ],
    detail: [
      "适合行缓存、FIFO、小 LUT。640×480 全帧 RGB 放不下，视频课要做成逐行流水。",
      "Vivado 里可用 IP 核（FIFO Generator、Block Memory）或直接属性推断。",
    ],
  },
  {
    id: "dsp",
    name: "DSP48E1",
    subtitle: "乘法累加硬单元",
    rect: [0.26, 0.06, 0.74, 0.16],
    color: 0xc4782a,
    specs: [
      { label: "DSP Slices", value: "20" },
      { label: "典型用途", value: "18×25 位乘法、MAC、有限 FIR" },
      { label: "本板尺度", value: "够做 Sobel 3×3、小规模滤波，不够大面积 CNN" },
    ],
    detail: [
      "算法课里的乘加应优先考虑映射到 DSP，而不是用 LUT 拼乘法器。",
      "一个 DSP48 可级联；位宽和流水线要在 RTL 或 IP 里写明。",
    ],
  },
  {
    id: "cmt",
    name: "CMT",
    subtitle: "时钟管理（MMCM + PLL）",
    rect: [0.32, 0.82, 0.68, 0.94],
    color: 0xd4a82c,
    specs: [
      { label: "Clock Management Tiles", value: "2（1×MMCM + 1×PLL）" },
      { label: "输入", value: "单端或差分时钟（本板 100 MHz 单端在 MRCC 脚 H4）" },
      { label: "输出", value: "多路、可倍频/分频/相移" },
    ],
    detail: [
      "HDMI 课需要像素时钟和 5 倍串行时钟，常用 Clocking Wizard 从 100 MHz 生成。",
      "约束里 create_clock 定义主时钟；生成的时钟用 create_generated_clock 声明。",
    ],
  },
  {
    id: "config",
    name: "配置逻辑",
    subtitle: "JTAG / Slave 加载 bitstream",
    rect: [0.72, 0.06, 0.9, 0.2],
    color: 0x8a5a4a,
    specs: [
      { label: "配置接口", value: "JTAG（K5=JTAG）或 SelectMAP（本板由 ESP32 Slave）" },
      { label: "bitstream", value: ".bit / .bin，存放 CLB、BRAM 初始化等" },
      { label: "DONE", value: "配置成功后 FPGA_DONE 拉高" },
    ],
    detail: [
      "配置单元把 bitstream 解压进 SRAM 配置点，决定 LUT/FF/布线连接。上电后未配置时 IO 多为高阻。",
      "本板 K5 拨到 Slave 时，ESP32 通过 PROGRAM_B、CCLK、DIN 完成下载。",
    ],
  },
  {
    id: "xadc",
    name: "XADC / SYSMON",
    subtitle: "片内监测（本料号未集成）",
    rect: [0.82, 0.22, 0.94, 0.38],
    color: 0x5a8a6a,
    specs: [
      { label: "XC7S15", value: "无片内 XADC（UG475：VCCADC 接 VCCAUX）" },
      { label: "较大 Spartan-7", value: "自 XC7S25 起带 SYSMON" },
      { label: "板上采样", value: "背面 ADC1173 → FPGA 用户 IO" },
    ],
    detail: [
      "版图上的配置/模拟角落在 7 系家族中复用相近布局；S15 不含可编程 SYSMON。",
      "板级模采请走 ADC1173 与对应 XDC 管脚。",
    ],
  },
  {
    id: "int",
    name: "互连",
    subtitle: "路由线与开关矩阵",
    rect: [0.38, 0.38, 0.62, 0.62],
    color: 0x4a5a6a,
    specs: [
      { label: "类型", value: "CLB 之间、CLB 到 BRAM/DSP/IOB 的多层金属线网" },
      { label: "实现注意", value: "拥塞时 hold/setup 变差，需改 RTL 或降频率" },
      { label: "工具阶段", value: "Place & Route 决定走线" },
    ],
    detail: [
      "图上半透明区域表示布线占用，不是独立 IP。时序报告里的 slack 反映时钟路径是否满足。",
      "12,800 LC 规模里，同时塞 HDMI + 大 BRAM + 高主频容易堵线，要分阶段验证。",
    ],
  },
];