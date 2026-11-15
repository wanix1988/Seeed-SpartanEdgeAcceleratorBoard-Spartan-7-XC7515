export type TrackId = "intro" | "video" | "algo" | "packet";
export type WidgetId = "power" | "blink" | "boot" | "hdmi" | "pipeline" | "sobel" | "aes" | "packet";
export type PartId =
  | "usb"
  | "power"
  | "k5"
  | "fpga"
  | "esp32"
  | "hdmi"
  | "csi"
  | "sd"
  | "led"
  | "io"
  | "jtag"
  | "adc"
  | "flash"
  | "txs";

export type Lesson = {
  id: string;
  track: TrackId;
  title: string;
  heading: string;
  goal: string;
  learn: string[];
  steps: string[];
  command: string;
  note: string;
  parts: PartId[];
  widget: WidgetId;
  code: { language: string; source: string };
  sourceHref: string;
  sourceLabel: string;
};

export type Track = {
  id: TrackId;
  title: string;
  summary: string;
  lessonIds: string[];
};

export const tracks: Track[] = [
  {
    id: "intro",
    title: "入门",
    summary: "上电、点灯，再用 ESP32 把 bitstream 送进 FPGA。",
    lessonIds: ["00", "01", "02"],
  },
  {
    id: "video",
    title: "图像与视频",
    summary: "Mini HDMI 输出，CSI 摄像头进来，中间只缓存行、不缓存整帧。",
    lessonIds: ["V1", "V2", "V3"],
  },
  {
    id: "algo",
    title: "算法",
    summary: "3×3 窗口和一轮 AES-128。都放得进 12,800 个逻辑单元。",
    lessonIds: ["A1", "A2"],
  },
  {
    id: "packet",
    title: "网络包",
    summary: "板上没有以太网 PHY。先解析帧，再经 ESP32 的 QSPI 把载荷交给 FPGA。",
    lessonIds: ["P1", "P2"],
  },
];

const sea = "https://github.com/wanix1988/SEA/tree/master";
const boot = "https://github.com/wanix1988/spartan-edge-esp32-boot";

export const lessons: Lesson[] = [
  {
    id: "00",
    track: "intro",
    title: "上电",
    heading: "找到电源、串口和 K5",
    goal: "用 USB Type-C 给板子供电，确认 CP2102 串口出现，并分清 K5 的 JTAG 与 Slave。",
    learn: ["USB Type-C 与 VIN 8–17 V 两路供电", "K5 决定谁配置 FPGA", "CP2102 串口"],
    steps: [
      "电源开关拨到 USB，用数据线插入 Type-C。PWR 灯亮。",
      "在系统里看到 CP2102 对应的串口。",
      "把 K5 拨到 Slave，准备让 ESP32 配置 FPGA；要用 Vivado 下载时再拨回 JTAG。",
    ],
    command: "器件 xc7s15ftgb196-1\n串口芯片 CP2102\nArduino 开发板选 DOIT ESP32 DEVKIT V1",
    note: "Shield 侧 IO 是 5 V，FPGA IO 是 3.3 V，中间有分压。官方只保证 Arduino UNO 这类 5 V 板。",
    parts: ["usb", "power", "k5", "esp32"],
    widget: "power",
    code: {
      language: "text",
      source: "K5 = JTAG   使用 Vivado Hardware Manager\nK5 = Slave  ESP32 从 microSD 的 /overlay/*.bit 配置 XC7S15\nFPGA_DONE 在配置成功后点亮",
    },
    sourceHref: "https://wiki.seeedstudio.com/Spartan-Edge-Accelerator-Board/",
    sourceLabel: "Seeed Wiki：电源与拨码",
  },
  {
    id: "01",
    track: "intro",
    title: "点灯",
    heading: "用 Verilog 翻转 L1",
    goal: "建一个只含分频器的 Vivado 工程，把 L1 接到板级时钟的高位。",
    learn: ["xc7s15ftgb196-1", "时钟分频", "约束只绑时钟和 LED"],
    steps: [
      "Vivado 里新建 RTL 工程，器件选 xc7s15ftgb196-1。手册使用的版本是 2018.2。",
      "加入下面的 blink 模块，并把 clk、led 写进板级 XDC。",
      "K5 拨到 JTAG，综合实现后用 Hardware Manager 下载。",
      "L1 以大约 1 Hz 闪烁。",
    ],
    command: "Vivado → xc7s15ftgb196-1 → Generate Bitstream → Hardware Manager",
    note: "不要在约束里猜封装脚位。以原理图和板级 XDC 上的 L1、板载时钟为准。",
    parts: ["fpga", "led", "jtag"],
    widget: "blink",
    code: {
      language: "verilog",
      source: `module sea_blink (
  input  wire clk,
  output reg  led
);
  reg [24:0] div;
  always @(posedge clk) begin
    div <= div + 1'b1;
    led <= div[24];
  end
endmodule`,
    },
    sourceHref: `${sea}/Hello-World/FPGA/Verilog`,
    sourceLabel: "SEA HelloWorld-Verilog",
  },
  {
    id: "02",
    track: "intro",
    title: "加载 bitstream",
    heading: "ESP32 从 microSD 配置 FPGA",
    goal: "把 .bit 放进 SD 卡的 overlay 目录，用板上 ESP32 在 Slave 模式写入 XC7S15。",
    learn: ["FAT 文件系统", "/overlay/default.bit", "FPGA_DONE"],
    steps: [
      "SD 卡格式化成 FAT16 或 FAT32，建立顶层目录 overlay。",
      "把 bitstream 命名为 default.bit 放进 overlay。",
      "K5 拨到 Slave，Arduino IDE 打开库示例 01LoadDefaultBitstream 并烧录 ESP32。",
      "复位后串口出现加载日志，FPGA_DONE 点亮。",
    ],
    command: "Arduino IDE\n开发板 DOIT ESP32 DEVKIT V1\n示例 01LoadDefaultBitstream\n串口 115200",
    note: "02LoadConfigBitstream 会读卡根目录的 board_config.ini，按 overlay_on_boot 选择文件。",
    parts: ["esp32", "sd", "k5", "fpga"],
    widget: "boot",
    code: {
      language: "text",
      source: `SD 卡
  /overlay/default.bit
  /board_config.ini      ← 仅 02 号示例需要

K5 = Slave
ESP32 读出 .bit → 配置 XC7S15 → FPGA_DONE = 1`,
    },
    sourceHref: boot,
    sourceLabel: "spartan-edge-esp32-boot",
  },
  {
    id: "V1",
    track: "video",
    title: "彩条",
    heading: "Mini HDMI 先输出测试图",
    goal: "不接摄像头，用像素计数生成 640×480 彩条，经 TMDS 从 Mini HDMI 送出。",
    learn: ["像素时钟与 5 倍串行时钟", "两块 CMT", "先做 640×480"],
    steps: [
      "工程器件仍是 xc7s15ftgb196-1。",
      "用 MMCM 产生像素时钟和五倍时钟。",
      "彩条只依赖计数器，不占帧缓存。",
      "显示器上看到八条竖彩条。1080p60 先不要上。",
    ],
    command: "目标时序 640×480\n像素时钟约 25 MHz，串行时钟约 125 MHz",
    note: "hdl-util/hdmi 已在这块板上测过，可替换官方的 DVI 风格输出。360 Kb Block RAM 放不下一帧 720p。",
    parts: ["fpga", "hdmi"],
    widget: "hdmi",
    code: {
      language: "verilog",
      source: `// x 是有效像素列。八条彩条，不读存储器。
wire [2:0] bar = x[9:7];
assign rgb = { {8{bar[2]}}, {8{bar[1]}}, {8{bar[0]}} };`,
    },
    sourceHref: "https://github.com/hdl-util/hdmi",
    sourceLabel: "hdl-util/hdmi",
  },
  {
    id: "V2",
    track: "video",
    title: "摄像头",
    heading: "CSI 进，HDMI 出",
    goal: "用板载 CSI 接树莓派 Camera V1（OV5647），把像素流原样送到 Mini HDMI。",
    learn: ["OV5647 不是 OV5640", "行有效 RGB_DE", "流式通路"],
    steps: [
      "接上 OV5647。排线方向以板上丝印为准。",
      "打开案例仓库里的 MIPI 摄像头接口工程。",
      "先不做算法，确认显示器上的画面跟着镜头动。",
      "记录一行有多少有效像素，后面的行缓存按这个宽度算。",
    ],
    command: "案例路径 Examples/FPGA/4.Module-Interface\n摄像头 IP Examples/FPGA-IP/Camera-IP",
    note: "网上很多 OV5640 例程寄存器表不能直接用。本板官方摄像头是 OV5647。",
    parts: ["csi", "fpga", "hdmi"],
    widget: "pipeline",
    code: {
      language: "text",
      source: "CSI → 像素流 (RGB_DE, RGB) → HDMI\n中间不要插入整帧 DDR。这颗 FPGA 没有高速收发器，也没有片外 DRAM 控制器可照搬。",
    },
    sourceHref: `${sea}/Examples/FPGA/4.Module-Interface`,
    sourceLabel: "Module-Interface",
  },
  {
    id: "V3",
    track: "video",
    title: "边缘",
    heading: "灰度之后做 Sobel",
    goal: "在像素流上串 RGB 转灰度，再用两行缓存做 3×3 Sobel，结果送 HDMI。",
    learn: ["移位代替小数乘法", "两行 Shift RAM", "Delay_Num 对齐"],
    steps: [
      "插入 Examples/FPGA-IP/Image-Process-IP 的 RGB2GRAY。",
      "灰度后面接 Edge_Check，阈值用板上开关或常量。",
      "把 RGB_DE 延迟 Delay_Num 拍，避免边框错位。",
      "镜头前放一张高对比的卡片，屏幕上只剩轮廓。",
    ],
    command: "IP：RGB2GRAY、Edge_Check\n演示：Demos/3.Image-Processing",
    note: "640 宽、8 位、两行缓存大约 10 Kb，360 Kb Block RAM 够用。不要把整帧放进片内。",
    parts: ["csi", "fpga", "hdmi"],
    widget: "sobel",
    code: {
      language: "text",
      source: `Gray = (R + (G << 1) + B) >> 2
Gx = [-1 0 1; -2 0 2; -1 0 1]
Gy = [-1 -2 -1; 0 0 0; 1 2 1]
边缘 = |Gx| + |Gy| > 阈值`,
    },
    sourceHref: `${sea}/Examples/FPGA-IP/Image-Process-IP`,
    sourceLabel: "Image-Process-IP",
  },
  {
    id: "A1",
    track: "algo",
    title: "窗口",
    heading: "一个 3×3 窗口就够做滤波",
    goal: "把 Sobel 拆成可复用的窗口：缓存两行，第三行用寄存器拼出 9 个像素。",
    learn: ["行缓存", "流水线节拍", "DSP 只用在真正的乘法上"],
    steps: [
      "用仿真读一张小图，确认窗口中心和输出延迟。",
      "Sobel 的系数是 1 和 2，用移位和加减，不占通用乘法器。",
      "均值滤波才需要除以 9；标定阶段就算好，像素通路里避免除法。",
      "窗口模块替换 V3 里的 Edge_Check 后，画面延迟不变。",
    ],
    command: "先仿真，再上板\n参考 FPGA_image_process 的 BMP 激励写法",
    note: "20 个 DSP 够几路 3×3。展开的卷积神经网络放不进 XC7S15。",
    parts: ["fpga"],
    widget: "sobel",
    code: {
      language: "verilog",
      source: `// 两行 Shift RAM 之后，用 9 个寄存器拼窗口。
// p11 p12 p13
// p21 p22 p23
// p31 p32 p33
wire signed [10:0] gx = -p11 + p13 - (p21 << 1) + (p23 << 1) - p31 + p33;`,
    },
    sourceHref: "https://github.com/iharbour-heyaonan/FPGA_image_process",
    sourceLabel: "FPGA_image_process",
  },
  {
    id: "A2",
    track: "algo",
    title: "AES",
    heading: "一个分组、十轮、迭代做完",
    goal: "在 FPGA 里用迭代 AES-128 加密 16 字节。密钥来自拨码或 QSPI 寄存器，不要展开全部轮。",
    learn: ["16 字节分组", "约 46 拍一块", "100 Mbit/s 链路远慢于 100 MHz 的迭代核"],
    steps: [
      "在仿真里对 FIPS-197 向量得到 69c4e0d86a7b0430d8cdb78070b4c55a。",
      "只综合加密通路。CTR 不需要解密，面积可以再降。",
      "板上演示把 ADC 或 QSPI 写入的 16 字节送进核，密文从 QSPI 读回 ESP32。",
      "不要用展开的全流水 AES，逻辑单元不够。",
    ],
    command: "参考核 secworks/aes\n板上数据通路 Demos/5.Algorithm/AES-Algorithm",
    note: "案例仓库里的 AES 说明指向网盘。后续开发用 secworks 的迭代核，接口接到已有的 QSPI。",
    parts: ["fpga", "esp32"],
    widget: "aes",
    code: {
      language: "text",
      source: `密钥 000102030405060708090a0b0c0d0e0f
明文 00112233445566778899aabbccddeeff
密文 69c4e0d86a7b0430d8cdb78070b4c55a`,
    },
    sourceHref: "https://github.com/secworks/aes",
    sourceLabel: "secworks/aes",
  },
  {
    id: "P1",
    track: "packet",
    title: "交给 FPGA",
    heading: "ESP32 收 UDP，FPGA 处理载荷",
    goal: "Wi-Fi 停在 ESP32。FPGA 只看到 QSPI 上的字节流，并把它送进 AES 或校验。",
    learn: ["本板没有以太网 PHY", "QSPI 寄存器", "算法和协议分开"],
    steps: [
      "ESP32 连接 Wi-Fi，在 UDP 端口上收一个数据报。",
      "把载荷按 16 字节写入 FPGA 的 QSPI 窗口。",
      "FPGA 加密或做 SHA-256，ESP32 读回结果再发回去。",
      "波形发生器示例里的 QSPI 时序可以直接复用。",
    ],
    command: "复用 Demos/6.Instrumentation/ESP32-QSPI-FPGA-Waveform-Generator 的 QSPI\n算法接 Demos/5.Algorithm/AES-Algorithm",
    note: "10 路用户 IO 可以外接一颗 RMII PHY，那是下一步。这一课先不焊 PHY。",
    parts: ["esp32", "fpga", "io"],
    widget: "packet",
    code: {
      language: "text",
      source: "手机或电脑 --UDP--> ESP32 Wi-Fi\nESP32 --QSPI--> FPGA 字节窗口\nFPGA 做 AES / SHA-256\nESP32 读回并回复",
    },
    sourceHref: `${sea}/Demos/6.Instrumentation/ESP32-QSPI-FPGA-Waveform-Generator`,
    sourceLabel: "QSPI 示例",
  },
  {
    id: "P2",
    track: "packet",
    title: "帧头",
    heading: "先认以太网、IPv4 和 UDP",
    goal: "写一个与 PHY 无关的解析器：14 字节以太网头，然后按 EtherType 看 IPv4，协议号 17 再看 UDP。",
    learn: ["EtherType 0x0800", "IHL", "UDP 端口"],
    steps: [
      "用下面的仿真帧核对目的 MAC、源 IP 和端口。",
      "解析器吃 AXI-Stream 或普通字节流，不要例化 1G/10G MAC。",
      "XC7S15 没有 GTP，做不了 SGMII 和 10G。",
      "若外接 LAN8720，MAC 只用 100 Mbit/s RMII，解析仍用这一课的模块。",
    ],
    command: "协议模块可参考 verilog-ethernet 的 eth_axis_rx 与 UDP 解析\n不要综合它的 10G PCS",
    note: "RMII 需要 REF_CLK、TXD[1:0]、TX_EN、RXD[1:0]、CRS_DV、MDC、MDIO，共 9 根。IO9–IO0 有 10 根。",
    parts: ["fpga", "io"],
    widget: "packet",
    code: {
      language: "text",
      source: `字节 0..5   目的 MAC
字节 6..11  源 MAC
字节 12..13 EtherType
IPv4 从字节 14 开始，协议号在 IP 头偏移 9
UDP 跟在 IHL×4 之后`,
    },
    sourceHref: "https://github.com/alexforencich/verilog-ethernet",
    sourceLabel: "verilog-ethernet",
  },
];

export const parts: { id: PartId; name: string; detail: string }[] = [
  { id: "usb", name: "USB Type-C", detail: "5 V 供电，CP2102 转串口。" },
  { id: "power", name: "电源开关", detail: "USB，或 VIN 8–17 V。另有开关隔离 Arduino 与 Shield 电源。" },
  { id: "k5", name: "K5", detail: "JTAG 用 Vivado 下载。Slave 由 ESP32 配置 FPGA。" },
  { id: "fpga", name: "XC7S15", detail: "12,800 逻辑单元，360 Kb Block RAM，20 个 DSP，没有高速收发器。" },
  { id: "esp32", name: "ESP32-D0WDQ6", detail: "Wi-Fi 和蓝牙，并负责从 SD 卡加载 bitstream。" },
  { id: "hdmi", name: "Mini HDMI", detail: "视频输出。先做 640×480。" },
  { id: "csi", name: "CSI", detail: "接树莓派 Camera V1，传感器是 OV5647。" },
  { id: "sd", name: "microSD", detail: "FAT16/FAT32，bitstream 放在 /overlay。" },
  { id: "led", name: "L1 / L2 / DONE", detail: "用户灯，以及配置完成后的 FPGA_DONE。" },
  { id: "io", name: "IO9–IO0", detail: "10 路 3.3 V 用户 IO。够一颗 100 Mbit/s RMII PHY。" },
  { id: "jtag", name: "JTAG", detail: "六线下载口。K5 在 JTAG 位置时使用。" },
  { id: "adc", name: "ADC1173", detail: "背面的 8 位 ADC，接在模拟输入那一排。" },
  { id: "flash", name: "W25Q32", detail: "背面的 32 Mbit SPI Flash。" },
  { id: "txs", name: "TXS0104", detail: "背面的 4 位电平转换。" },
];

export function lessonById(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}

export function trackById(id: TrackId): Track {
  const track = tracks.find((item) => item.id === id);
  if (!track) throw new Error(id);
  return track;
}
