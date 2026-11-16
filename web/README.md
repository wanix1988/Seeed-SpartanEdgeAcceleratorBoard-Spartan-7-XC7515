# SEA Labs 网页实验台

## 启动

```powershell
cd web
npm install
npm run dev
```

浏览器打开 **http://localhost:5180/** 或 **http://127.0.0.1:5180/**（不要直接双击 `index.html`，需要用开发服务器）。

若提示端口占用，先结束旧的 Node 进程，或执行：

```powershell
npm run build
npm run preview
```

## 说明

- 使用 Hash 路由（`#/board`、`#/lessons/01`）。
- `experimentCatalog.ts` 由 `scripts/gen-web-manual-lessons.py` 生成；勿与 `catalog.ts` 形成循环依赖（类型在 `catalog-types.ts`）。