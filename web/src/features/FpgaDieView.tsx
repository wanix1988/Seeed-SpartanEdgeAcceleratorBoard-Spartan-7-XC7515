import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  fpgaDieFloorplanAssets,
  fpgaDieFloorplanNote,
  moduleIdFromPickRgb,
} from "../content/fpgaDiePick";
import {
  fpgaDieModules,
  fpgaDieTitle,
  type FpgaDieModuleId,
} from "../content/fpgaDie";

const DIE_T = 2.8;
const DIE_HOME = new THREE.Vector3(48, -38, 88);

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function buildHighlightTexture(
  colorImg: HTMLImageElement,
  pickImg: HTMLImageElement,
  selected: FpgaDieModuleId,
): THREE.CanvasTexture {
  const w = colorImg.naturalWidth;
  const h = colorImg.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context");
  const pickC = document.createElement("canvas");
  pickC.width = w;
  pickC.height = h;
  const pctx = pickC.getContext("2d");
  if (!pctx) throw new Error("pick 2d");
  pctx.drawImage(pickImg, 0, 0);
  const pickData = pctx.getImageData(0, 0, w, h).data;

  ctx.drawImage(colorImg, 0, 0);
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const isInt = selected === "int";
  for (let i = 0; i < w * h; i += 1) {
    const o = i * 4;
    const id = moduleIdFromPickRgb(pickData[o], pickData[o + 1], pickData[o + 2]);
    const hot = isInt ? id === "clb" || id === "int" : id === selected;
    const scale = hot ? 1.08 : 0.42;
    d[o] = Math.min(255, d[o] * scale);
    d[o + 1] = Math.min(255, d[o + 1] * scale);
    d[o + 2] = Math.min(255, d[o + 2] * scale);
  }
  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function FpgaDieView() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resetRef = useRef<() => void>(() => undefined);
  const [selected, setSelected] = useState<FpgaDieModuleId>("clb");
  const [dieReady, setDieReady] = useState(false);
  const selectedRef = useRef(selected);
  const pickRef = useRef<{ data: Uint8ClampedArray; w: number; h: number } | null>(null);
  const imagesRef = useRef<{ color: HTMLImageElement; pick: HTMLImageElement } | null>(null);
  const floorMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const aspectRef = useRef(0.7);
  selectedRef.current = selected;

  const module = fpgaDieModules.find((m) => m.id === selected) ?? fpgaDieModules[0];

  useEffect(() => {
    let alive = true;
    loadImage(fpgaDieFloorplanAssets.color)
      .then((color) => loadImage(fpgaDieFloorplanAssets.pick).then((pick) => ({ color, pick })))
      .then(({ color, pick }) => {
        if (!alive) return;
        imagesRef.current = { color, pick };
        aspectRef.current = color.naturalHeight / color.naturalWidth;
        const pc = document.createElement("canvas");
        pc.width = pick.naturalWidth;
        pc.height = pick.naturalHeight;
        const ctx = pc.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(pick, 0, 0);
        pickRef.current = {
          w: pick.naturalWidth,
          h: pick.naturalHeight,
          data: ctx.getImageData(0, 0, pc.width, pc.height).data,
        };
        setDieReady(true);
      })
      .catch(() => setDieReady(false));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const imgs = imagesRef.current;
    const mat = floorMatRef.current;
    if (!imgs || !mat) return;
    mat.map?.dispose();
    mat.map = buildHighlightTexture(imgs.color, imgs.pick, selected);
    mat.needsUpdate = true;
  }, [selected, dieReady]);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas || !dieReady || !imagesRef.current) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 400);
    camera.position.copy(DIE_HOME);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    controls.minDistance = 50;
    controls.maxDistance = 180;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI - 0.25;

    scene.add(new THREE.HemisphereLight(0xf0f4f8, 0x1a2830, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(24, 32, 48);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xc8d8e8, 0.35);
    fill.position.set(-30, -20, 20);
    scene.add(fill);

    const dieW = 72;
    const dieH = dieW * aspectRef.current;
    const substrate = new THREE.Mesh(
      new THREE.BoxGeometry(dieW, dieH, DIE_T),
      new THREE.MeshStandardMaterial({ color: 0x141c18, roughness: 0.8, metalness: 0.1 }),
    );
    substrate.position.z = -DIE_T / 2;
    scene.add(substrate);

    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.38,
      metalness: 0.05,
      emissive: new THREE.Color(0x080c0a),
      emissiveIntensity: 0.12,
    });
    floorMatRef.current = floorMat;
    if (imagesRef.current) {
      floorMat.map = buildHighlightTexture(
        imagesRef.current.color,
        imagesRef.current.pick,
        selectedRef.current,
      );
    }
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(dieW, dieH), floorMat);
    floor.position.z = DIE_T / 2 + 0.03;
    scene.add(floor);

    const edge = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(dieW, dieH, DIE_T)),
      new THREE.LineBasicMaterial({ color: 0x5a6a62, transparent: true, opacity: 0.5 }),
    );
    scene.add(edge);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    const onDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;
      const pick = pickRef.current;
      if (!pick) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(floor, false);
      const uv = hits[0]?.uv;
      if (!uv) return;
      const x = Math.min(pick.w - 1, Math.max(0, Math.floor(uv.x * pick.w)));
      const y = Math.min(pick.h - 1, Math.max(0, Math.floor((1 - uv.y) * pick.h)));
      const o = (y * pick.w + x) * 4;
      const id = moduleIdFromPickRgb(pick.data[o], pick.data[o + 1], pick.data[o + 2]);
      if (id) setSelected(id);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    resetRef.current = () => {
      camera.position.copy(DIE_HOME);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      controls.dispose();
      floorMat.map?.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((item) => item.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      floorMatRef.current = null;
    };
  }, [dieReady]);

  return (
    <div className="die-layout">
      <div className="stage3d stage-die" ref={stageRef}>
        {!dieReady ? <p className="die-loading">正在加载器件版图…</p> : null}
        <canvas ref={canvasRef} aria-label="XC7S15 晶圆级器件版图" />
        <button type="button" className="stage-reset die-reset" onClick={() => resetRef.current()}>
          复位视角
        </button>
      </div>
      <aside className="die-panel" aria-label="片上模块说明">
        <p className="die-title">{fpgaDieTitle}</p>
        <p className="die-hint">点击版图上的 Slice/BRAM/DSP/IOB 等区域，或用标签切换模块。拖动旋转、滚轮缩放。</p>
        <p className="die-footnote">{fpgaDieFloorplanNote}</p>
        <ul className="die-tabs" role="tablist" aria-label="片上模块">
          {fpgaDieModules.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                role="tab"
                aria-selected={selected === m.id}
                className={selected === m.id ? "on" : ""}
                onClick={() => setSelected(m.id)}
              >
                {m.name}
              </button>
            </li>
          ))}
        </ul>
        <section className="die-detail" aria-live="polite">
          <h3>{module.name}</h3>
          <p className="die-sub">{module.subtitle}</p>
          <dl className="die-specs">
            {module.specs.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
          {module.detail.map((para) => (
            <p key={para.slice(0, 24)}>{para}</p>
          ))}
        </section>
      </aside>
    </div>
  );
}