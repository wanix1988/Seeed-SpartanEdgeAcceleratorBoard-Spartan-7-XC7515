import { useEffect, useMemo, useRef, useState } from "react";
import { aes128Encrypt, bytesToHex, hexToBytes } from "../domain/aes";
import { hexDump, parseFrame, sampleUdpFrame } from "../domain/packet";
import { rectangleScene, sobelMagnitude } from "../domain/sobel";
import type { WidgetId } from "../content/catalog";

const NIST_KEY = "000102030405060708090a0b0c0d0e0f";
const NIST_BLOCK = "00112233445566778899aabbccddeeff";

export function Simulator({ widget }: { widget: WidgetId }) {
  switch (widget) {
    case "power":
      return <PowerSim />;
    case "blink":
      return <BlinkSim />;
    case "boot":
      return <BootSim />;
    case "hdmi":
      return <HdmiSim />;
    case "pipeline":
      return <PipelineSim />;
    case "sobel":
      return <SobelSim />;
    case "aes":
      return <AesSim />;
    case "packet":
      return <PacketSim />;
    case "manual":
      return <ManualSim />;
    default:
      return null;
  }
}

function ManualSim() {
  return (
    <div className="sim">
      <p>
        本课正文与分步清单已在页面内嵌（摘自官方手册）。在 Vivado / uPyCraft / Arduino 中按步骤操作，用 JTAG 或 K5=Slave 验证即可；无单独网页仿真时可对照板上 LED、HDMI
        等直观现象。
      </p>
    </div>
  );
}

function PowerSim() {
  const [usb, setUsb] = useState(true);
  const [slave, setSlave] = useState(true);
  return (
    <div className="sim">
      <div className="sim-row">
        <button type="button" className={usb ? "on" : ""} onClick={() => setUsb((value) => !value)}>
          电源：{usb ? "USB Type-C" : "关闭"}
        </button>
        <button type="button" className={slave ? "on" : ""} onClick={() => setSlave((value) => !value)} disabled={!usb}>
          K5：{slave ? "Slave" : "JTAG"}
        </button>
      </div>
      <div className="board-mini" data-powered={usb}>
        <span className={usb ? "lamp on" : "lamp"} />
        <p>{usb ? "PWR 亮。CP2102 枚举串口。" : "没有供电。"}</p>
        <p>{usb && slave ? "ESP32 可以配置 FPGA。" : usb ? "Vivado Hardware Manager 走 JTAG。" : "拨码没有意义。"}</p>
      </div>
    </div>
  );
}

function BlinkSim() {
  return (
    <div className="sim">
      <div className="leds" aria-hidden="true">
        <i className="led blink" />
        <i className="led" />
        <i className="led done" />
      </div>
      <p>L1 按分频器高位翻转。L2 保持灭。DONE 只在配置完成时亮，点灯工程本身不会点它。</p>
    </div>
  );
}

function BootSim() {
  const [slave, setSlave] = useState(true);
  const [lines, setLines] = useState<string[]>(["等待加载。K5 需要在 Slave。"]);
  const [done, setDone] = useState(false);

  function load() {
    if (!slave) {
      setDone(false);
      setLines(["K5 在 JTAG。ESP32 写不进 FPGA。", "把 K5 拨到 Slave 再试。"]);
      return;
    }
    setDone(false);
    setLines(["挂载 SD", "打开 /overlay/default.bit", "写入 XC7S15 …"]);
    window.setTimeout(() => {
      setLines(["挂载 SD", "打开 /overlay/default.bit", "写入 XC7S15 …", "FPGA_DONE = 1"]);
      setDone(true);
    }, 700);
  }

  return (
    <div className="sim">
      <div className="sim-row">
        <button type="button" className={slave ? "on" : ""} onClick={() => setSlave((value) => !value)}>
          K5：{slave ? "Slave" : "JTAG"}
        </button>
        <button type="button" onClick={load}>
          加载 default.bit
        </button>
        <i className={done ? "led done on" : "led done"} aria-label={done ? "DONE 亮" : "DONE 灭"} />
      </div>
      <pre className="terminal">{lines.join("\n")}</pre>
    </div>
  );
}

function HdmiSim() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    const context = node.getContext("2d");
    if (!context) return;
    const colors = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0", "#101010"];
    const width = node.width / colors.length;
    colors.forEach((color, index) => {
      context.fillStyle = color;
      context.fillRect(index * width, 0, width, node.height);
    });
  }, []);
  return (
    <div className="sim">
      <canvas ref={canvas} width={320} height={180} aria-label="640×480 彩条的缩小预览" />
      <p>八条彩条只由列号生成。这一步不读摄像头，也不占 Block RAM。</p>
    </div>
  );
}

const stages = ["CSI / OV5647", "RGB 流", "行对齐", "Mini HDMI"];

function PipelineSim() {
  const [stage, setStage] = useState(0);
  return (
    <div className="sim">
      <ol className="pipeline">
        {stages.map((label, index) => (
          <li key={label} className={index <= stage ? "lit" : ""}>
            {label}
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => setStage((value) => (value + 1) % stages.length)}>
        推进一拍
      </button>
      <p>画面跟着镜头动之后，再插入灰度和 Sobel。插入点在 RGB 流和 HDMI 之间。</p>
    </div>
  );
}

function paintGray(canvas: HTMLCanvasElement, pixels: Uint8Array, width: number, height: number) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const image = context.createImageData(width, height);
  for (let index = 0; index < pixels.length; index += 1) {
    const value = pixels[index];
    image.data[index * 4] = value;
    image.data[index * 4 + 1] = value;
    image.data[index * 4 + 2] = value;
    image.data[index * 4 + 3] = 255;
  }
  context.putImageData(image, 0, 0);
}

function SobelSim() {
  const source = useRef<HTMLCanvasElement>(null);
  const edges = useRef<HTMLCanvasElement>(null);
  const scene = useMemo(() => rectangleScene(96, 64), []);
  const magnitude = useMemo(() => sobelMagnitude(scene, 96, 64), [scene]);

  useEffect(() => {
    if (source.current) paintGray(source.current, scene, 96, 64);
    if (edges.current) paintGray(edges.current, magnitude, 96, 64);
  }, [magnitude, scene]);

  return (
    <div className="sim">
      <div className="pair">
        <figure>
          <canvas ref={source} width={96} height={64} />
          <figcaption>灰度</figcaption>
        </figure>
        <figure>
          <canvas ref={edges} width={96} height={64} />
          <figcaption>Sobel</figcaption>
        </figure>
      </div>
      <p>右边只剩矩形的边。FPGA 上用两行缓存得到同样的 3×3 窗口。</p>
    </div>
  );
}

function AesSim() {
  const [key, setKey] = useState(NIST_KEY);
  const [block, setBlock] = useState(NIST_BLOCK);
  const keyBytes = hexToBytes(key);
  const blockBytes = hexToBytes(block);
  const valid = keyBytes?.length === 16 && blockBytes?.length === 16;
  const cipher = valid && keyBytes && blockBytes ? bytesToHex(aes128Encrypt(keyBytes, blockBytes)) : "";

  return (
    <div className="sim">
      <label>
        密钥 16 字节
        <input value={key} onChange={(event) => setKey(event.target.value)} spellCheck={false} />
      </label>
      <label>
        明文 16 字节
        <input value={block} onChange={(event) => setBlock(event.target.value)} spellCheck={false} />
      </label>
      <p className="cipher">{valid ? cipher : "需要各 32 个十六进制字符。"}</p>
      <p>这是 FIPS-197 的 AES-128。默认向量的密文以 69c4e0d8 开头。</p>
    </div>
  );
}

function PacketSim() {
  const frame = useMemo(() => sampleUdpFrame(), []);
  const parsed = parseFrame(frame);
  return (
    <div className="sim">
      <pre className="terminal">{hexDump(frame)}</pre>
      {"error" in parsed ? (
        <p>{parsed.error}</p>
      ) : (
        <dl className="fields">
          <div>
            <dt>目的 MAC</dt>
            <dd>{parsed.dstMac}</dd>
          </div>
          <div>
            <dt>源 MAC</dt>
            <dd>{parsed.srcMac}</dd>
          </div>
          <div>
            <dt>EtherType</dt>
            <dd>0x{parsed.etherType.toString(16)}</dd>
          </div>
          <div>
            <dt>IPv4</dt>
            <dd>
              {parsed.ipv4?.src} → {parsed.ipv4?.dst}
            </dd>
          </div>
          <div>
            <dt>UDP</dt>
            <dd>
              {parsed.udp?.srcPort} → {parsed.udp?.dstPort}
            </dd>
          </div>
          <div>
            <dt>载荷</dt>
            <dd>{parsed.udp ? new TextDecoder().decode(parsed.udp.payload) : ""}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
