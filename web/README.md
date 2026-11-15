# SEA Labs

Spartan Edge Accelerator Board 的浏览器实验台。结构参考 [ESP32 Labs](https://github.com/wanix1988/esp-labs-web)：实验是数据，先仿真再上板，步骤勾选保存在浏览器本地。

```sh
cd web
npm install
npm test
npm run dev
```

打开 http://127.0.0.1:5180 。`npm run build` 生成 `dist/`，可用任意静态服务器打开。

器件是 XC7S15-1FTGB196C（Vivado 器件名 `xc7s15ftgb196-1`）。案例代码在 [wanix1988/SEA](https://github.com/wanix1988/SEA)，ESP32 加载库在 [wanix1988/spartan-edge-esp32-boot](https://github.com/wanix1988/spartan-edge-esp32-boot)。
