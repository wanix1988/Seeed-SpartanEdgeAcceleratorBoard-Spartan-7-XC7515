import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { parts, type PartId } from "../content/catalog";
import outline from "./board-outline.json";

type Side = "left" | "right";
type Face = "front" | "back";

const slots: Record<PartId, { side: Side; y: number }> = {
  power: { side: "left", y: 8 },
  usb: { side: "left", y: 24 },
  hdmi: { side: "left", y: 46 },
  sd: { side: "left", y: 66 },
  csi: { side: "left", y: 86 },
  adc: { side: "left", y: 14 },
  txs: { side: "left", y: 36 },
  flash: { side: "left", y: 58 },
  io: { side: "right", y: 8 },
  led: { side: "right", y: 24 },
  jtag: { side: "right", y: 40 },
  fpga: { side: "right", y: 56 },
  esp32: { side: "right", y: 72 },
  k5: { side: "right", y: 88 },
};

/** u/v 以正面照片裁切后的左上角为原点，范围 0–1。背面坐标已对齐到同一张正面图。 */
const spots: { id: PartId; face: Face; rect: [number, number, number, number] }[] = [
  { id: "power", face: "front", rect: [0.0922, 0.0271, 0.1749, 0.0949] },
  { id: "usb", face: "front", rect: [0.0057, 0.1899, 0.1274, 0.3662] },
  { id: "io", face: "front", rect: [0.2766, 0.1048, 0.6283, 0.1517] },
  { id: "jtag", face: "front", rect: [0.8013, 0.1517, 0.8926, 0.3514] },
  { id: "led", face: "front", rect: [0.9002, 0.1665, 0.9515, 0.2873] },
  { id: "fpga", face: "front", rect: [0.423, 0.3551, 0.6388, 0.6338] },
  { id: "hdmi", face: "front", rect: [0.0133, 0.6375, 0.1321, 0.8594] },
  { id: "esp32", face: "front", rect: [0.7262, 0.5487, 0.8375, 0.7411] },
  { id: "k5", face: "front", rect: [0.4344, 0.7953, 0.5352, 0.8471] },
  { id: "csi", face: "front", rect: [0.0656, 0.8903, 0.3032, 0.9766] },
  { id: "sd", face: "back", rect: [0.1521, 0.7176, 0.3527, 0.9889] },
  { id: "adc", face: "back", rect: [0.655, 0.385, 0.77, 0.455] },
  { id: "flash", face: "back", rect: [0.653, 0.542, 0.726, 0.607] },
  { id: "txs", face: "back", rect: [0.802, 0.39, 0.876, 0.46] },
];

const BOARD_W = 100;
const BOARD_H = 77.09;
const BOARD_T = 2.15;
const HOME = new THREE.Vector3(42, -48, 132);

function ringGeometry(width: number, height: number, stroke: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -height / 2);
  shape.lineTo(width / 2, -height / 2);
  shape.lineTo(width / 2, height / 2);
  shape.lineTo(-width / 2, height / 2);
  const hole = new THREE.Path();
  const insetX = Math.max(width / 2 - stroke, 0.08);
  const insetY = Math.max(height / 2 - stroke, 0.08);
  hole.moveTo(-insetX, -insetY);
  hole.lineTo(-insetX, insetY);
  hole.lineTo(insetX, insetY);
  hole.lineTo(insetX, -insetY);
  shape.holes.push(hole);
  return new THREE.ShapeGeometry(shape);
}

function place(rect: [number, number, number, number], face: Face) {
  const [u0, v0, u1, v1] = rect;
  return {
    x: ((u0 + u1) / 2 - 0.5) * BOARD_W,
    y: (0.5 - (v0 + v1) / 2) * BOARD_H,
    z: face === "front" ? BOARD_T / 2 + 0.2 : -(BOARD_T / 2 + 0.2),
    w: (u1 - u0) * BOARD_W,
    h: (v1 - v0) * BOARD_H,
  };
}

export function BoardDiagram({ active, onSelect }: { active: PartId[]; onSelect?: (id: PartId) => void }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resetRef = useRef<() => void>(() => undefined);
  const activeRef = useRef(active);
  const selectRef = useRef(onSelect);
  const labelRefs = useRef<Partial<Record<PartId, HTMLButtonElement | HTMLSpanElement>>>({});
  const lineRefs = useRef<Partial<Record<PartId, SVGPolylineElement>>>({});
  const dotRefs = useRef<Partial<Record<PartId, SVGCircleElement>>>({});
  activeRef.current = active;
  selectRef.current = onSelect;

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 800);
    camera.position.copy(HOME);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.target.set(0, -1, 0);
    controls.minDistance = 70;
    controls.maxDistance = 280;
    controls.minPolarAngle = 0.28;
    controls.maxPolarAngle = Math.PI - 0.28;
    controls.autoRotate = false;

    scene.add(new THREE.HemisphereLight(0xf7f4ee, 0x1c241c, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15);
    sun.position.set(40, 30, 80);
    scene.add(sun);

    const xy: [number, number][] = outline.map(([u, v]) => [(u - 0.5) * BOARD_W, (0.5 - v) * BOARD_H]);
    let area = 0;
    for (let i = 0; i < xy.length; i += 1) {
      const [x1, y1] = xy[i];
      const [x2, y2] = xy[(i + 1) % xy.length];
      area += x1 * y2 - x2 * y1;
    }
    if (area < 0) xy.reverse();
    const shape = new THREE.Shape();
    xy.forEach(([x, y], index) => (index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
    const body = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: BOARD_T, bevelEnabled: false }),
      new THREE.MeshStandardMaterial({ color: 0x101614, roughness: 0.86, metalness: 0.04, side: THREE.DoubleSide }),
    );
    body.position.z = -BOARD_T / 2;
    scene.add(body);

    const anchors = new Map<PartId, THREE.Vector3>();
    const highlights = new Map<PartId, THREE.MeshBasicMaterial>();
    const frames = new Map<PartId, THREE.Mesh>();
    for (const spot of spots) {
      const at = place(spot.rect, spot.face);
      const material = new THREE.MeshBasicMaterial({
        color: 0x39d36a,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(at.w, at.h), material);
      mesh.position.set(at.x, at.y, at.z);
      mesh.renderOrder = 4;
      mesh.userData.partId = spot.id;
      scene.add(mesh);
      highlights.set(spot.id, material);
      if (spot.face === "back") {
        const frame = new THREE.Mesh(
          ringGeometry(at.w, at.h, Math.min(at.w, at.h) * 0.14),
          new THREE.MeshBasicMaterial({ color: 0x39d36a, side: THREE.DoubleSide }),
        );
        frame.position.set(at.x, at.y, at.z);
        frame.renderOrder = 5;
        frame.visible = false;
        scene.add(frame);
        frames.set(spot.id, frame);
      }
      anchors.set(spot.id, new THREE.Vector3(at.x, at.y, at.z));
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    const onDown = (event: PointerEvent) => {
      downX = event.clientX;
      downY = event.clientY;
    };
    const onUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - downX, event.clientY - downY) > 6) return;
      const select = selectRef.current;
      if (!select) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(scene.children, false).find((item) => item.object.userData.partId);
      const id = hit?.object.userData.partId as PartId | undefined;
      if (id) select(id);
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);

    const projected = new THREE.Vector3();
    const resize = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(stage);

    resetRef.current = () => {
      camera.position.copy(HOME);
      controls.target.set(0, -1, 0);
      controls.update();
    };

    const base = import.meta.env.BASE_URL;
    const loader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];
    let disposed = false;
    const loadMap = (file: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        loader.load(base + file, resolve, undefined, reject);
      });
    Promise.all([loadMap("board/front.webp"), loadMap("board/back.webp")])
      .then(([frontMap, backMap]) => {
        if (disposed) {
          frontMap.dispose();
          backMap.dispose();
          return;
        }
        for (const map of [frontMap, backMap]) {
          map.colorSpace = THREE.SRGBColorSpace;
          map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          textures.push(map);
        }
        backMap.wrapS = THREE.RepeatWrapping;
        backMap.repeat.x = -1;
        backMap.offset.x = 1;
        const photo = (map: THREE.Texture, z: number, yaw: number) => {
          const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(BOARD_W, BOARD_H),
            new THREE.MeshBasicMaterial({ map, alphaTest: 0.35, side: THREE.FrontSide }),
          );
          mesh.position.z = z;
          mesh.rotation.y = yaw;
          scene.add(mesh);
        };
        photo(frontMap, BOARD_T / 2 + 0.04, 0);
        photo(backMap, -(BOARD_T / 2 + 0.04), Math.PI);
      })
      .catch(() => undefined);

    let frame = 0;
    const drawLeaders = () => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const stageRect = stage.getBoundingClientRect();
      const backView = camera.position.z < 0;
      for (const spot of spots) {
        const anchor = anchors.get(spot.id);
        const line = lineRefs.current[spot.id];
        const dot = dotRefs.current[spot.id];
        const label = labelRefs.current[spot.id];
        const highlight = highlights.get(spot.id);
        if (!anchor || !line || !dot || !label || !highlight) continue;
        const hot = activeRef.current.includes(spot.id);
        const onBack = spot.face === "back";
        const show = backView ? onBack : !onBack || spot.id === "sd";
        highlight.opacity = show && onBack ? (hot ? 0.45 : 0.2) : show && hot ? 0.5 : 0;
        const box = frames.get(spot.id);
        if (box) box.visible = backView;
        label.classList.toggle("hot", hot);
        line.classList.toggle("hot", onBack ? backView || hot : hot);
        dot.classList.toggle("hot", onBack ? backView || hot : hot);
        projected.copy(anchor).project(camera);
        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;
        const behind = projected.z > 1;
        let side = slots[spot.id].side;
        if (backView && spot.id === "sd") side = "right";
        label.style.left = side === "left" ? "10px" : "auto";
        label.style.right = side === "right" ? "10px" : "auto";
        label.style.visibility = show ? "visible" : "hidden";
        if (!show) {
          line.style.opacity = "0";
          dot.style.opacity = "0";
          continue;
        }
        void label.offsetWidth;
        const labelRect = label.getBoundingClientRect();
        const x1 = (side === "left" ? labelRect.right : labelRect.left) - stageRect.left;
        const y1 = labelRect.top + labelRect.height / 2 - stageRect.top;
        const elbow = x1 + (side === "left" ? 18 : -18);
        line.setAttribute("points", `${x1},${y1} ${elbow},${y1} ${x},${y}`);
        dot.setAttribute("cx", String(x));
        dot.setAttribute("cy", String(y));
        const faded = behind ? "0.28" : "1";
        line.style.opacity = faded;
        dot.style.opacity = faded;
      }
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
      drawLeaders();
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      controls.dispose();
      textures.forEach((texture) => texture.dispose());
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material;
        if (Array.isArray(material)) material.forEach((item) => item.dispose());
        else material?.dispose();
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div className="stage3d" ref={stageRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <svg className="leaders" aria-hidden="true">
        {spots.map((spot) => (
          <g key={spot.id}>
            <polyline
              ref={(node) => {
                if (node) lineRefs.current[spot.id] = node;
              }}
            />
            <circle
              r="3.5"
              ref={(node) => {
                if (node) dotRefs.current[spot.id] = node;
              }}
            />
          </g>
        ))}
      </svg>
      {parts.map((part) => {
        const slot = slots[part.id];
        const hot = active.includes(part.id);
        const className = hot ? "callout hot" : "callout";
        const style = { top: `${slot.y}%`, [slot.side]: "10px" } as const;
        if (onSelect) {
          return (
            <button
              key={part.id}
              type="button"
              className={className}
              style={style}
              aria-pressed={hot}
              ref={(node) => {
                if (node) labelRefs.current[part.id] = node;
              }}
              onClick={() => onSelect(part.id)}
            >
              {part.name}
            </button>
          );
        }
        return (
          <span
            key={part.id}
            className={className}
            style={style}
            ref={(node) => {
              if (node) labelRefs.current[part.id] = node;
            }}
          >
            {part.name}
          </span>
        );
      })}
      <button type="button" className="stage-reset" onClick={() => resetRef.current()}>
        复位视角
      </button>
    </div>
  );
}
