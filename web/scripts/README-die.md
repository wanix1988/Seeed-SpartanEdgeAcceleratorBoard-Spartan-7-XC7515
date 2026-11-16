# XC7S15 器件版图资源

Web「走进芯片内部」使用 Vivado 导出的 **xc7s15ftgb196-1** 真实 Site 排布，非手绘方块。

## 重新生成 PNG

1. 安装：`pip install fpga-design-implview pymupdf matplotlib`
2. 用 Vivado 导出（已提供 `web/scripts/data/xc7s15-device.ivdev.gz` 时可跳过）：

```powershell
$tcl = "$env:LOCALAPPDATA\Programs\Python\Python312\Lib\site-packages\fpga_design_implview\tcl\batch.tcl"
& "J:\AMDDesignTools\2026.1\Vivado\bin\vivado.bat" -mode batch -source $tcl -tclargs device xc7s15ftgb196-1 web/scripts/data/xc7s15-device.ivdev.gz
```

3. 渲染：

```powershell
python web/scripts/render-xc7s15-floorplan.py
```

输出：`web/public/die/xc7s15-floorplan.png`、`xc7s15-floorplan-pick.png`。

公开库里尚无 XC7S15 光学显微照片；若获得解封 die 图，可替换 color 贴图并保留 pick 逻辑或重做 pick 映射。