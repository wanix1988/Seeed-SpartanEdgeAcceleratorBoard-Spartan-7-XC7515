export type TrackId = "intro" | "video" | "algo" | "packet" | "manual-fpga" | "manual-esp32" | "manual-exp";
export type WidgetId =
  | "power"
  | "blink"
  | "boot"
  | "hdmi"
  | "pipeline"
  | "sobel"
  | "aes"
  | "packet"
  | "manual";
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