import { useEffect, useMemo, useState } from "react";
import { lessons, lessonById, parts, tracks, type Lesson, type PartId } from "../content/catalog";
import { stepCountForLesson } from "../content/manualBundle";
import { lessonDone, toggleStep, visitLesson, type Progress } from "../domain/progress";
import { BoardDiagram } from "../features/BoardDiagram";
import {
  hasManualContent,
  ManualLangTabs,
  ManualLessonPanels,
  manualGoalForLesson,
  manualStepsForLesson,
} from "../features/ManualLessonPanels";
import { isGenericManualCommand } from "../features/manualDedupe";
import type { ManualLang } from "../features/manualI18n";
import { manualUi } from "../features/manualI18n";
import { Simulator } from "../labs/Simulators";
import { loadProgress, saveProgress } from "../lib/storage";

type Route =
  | { name: "home" }
  | { name: "lesson"; id: string }
  | { name: "board" }
  | { name: "bench" };

function parseRoute(hash: string): Route {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/board") return { name: "board" };
  if (path === "/bench") return { name: "bench" };
  const lesson = /^\/lessons\/([^/]+)$/.exec(path);
  if (lesson) return { name: "lesson", id: decodeURIComponent(lesson[1]) };
  return { name: "home" };
}

function useRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function App() {
  const route = useRoute();
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
    document.documentElement.dataset.theme = progress.theme;
  }, [progress]);

  useEffect(() => {
    if (route.name === "lesson") {
      setProgress((current) => (current.lastLessonId === route.id ? current : visitLesson(current, route.id)));
    }
  }, [route]);

  const doneCount = lessons.filter((lesson) => lessonDone(progress, lesson.id, stepCountForLesson(lesson))).length;

  return (
    <>
      <header className="top">
        <a className="brand" href="#/">
          SEA Labs
        </a>
        <nav>
          <a href="#/" aria-current={route.name === "home" ? "page" : undefined}>
            实验
          </a>
          <a href="#/board" aria-current={route.name === "board" ? "page" : undefined}>
            板子
          </a>
          <a href="#/bench" aria-current={route.name === "bench" ? "page" : undefined}>
            工作台
          </a>
        </nav>
        <button
          type="button"
          className="ghost"
          onClick={() => setProgress((current) => ({ ...current, theme: current.theme === "dark" ? "light" : "dark" }))}
        >
          {progress.theme === "dark" ? "浅色" : "深色"}
        </button>
      </header>
      <main>
        {route.name === "home" ? <Home progress={progress} doneCount={doneCount} /> : null}
        {route.name === "board" ? <BoardPage /> : null}
        {route.name === "bench" ? <BenchPage /> : null}
        {route.name === "lesson" ? (
          <LessonPage
            lesson={lessonById(route.id)}
            progress={progress}
            onToggle={(index) => {
              const lesson = lessonById(route.id);
              if (!lesson) return;
              setProgress((current) => toggleStep(current, lesson.id, stepCountForLesson(lesson), index));
            }}
          />
        ) : null}
      </main>
      <footer>
        实验台的结构参考{" "}
        <a href="https://github.com/wanix1988/esp-labs-web">ESP32 Labs</a>
        （Abderrehmen Gharsallah）。内容针对 Spartan Edge Accelerator Board，与 Seeed、AMD、Espressif 无隶属关系。
      </footer>
    </>
  );
}

function Home({ progress, doneCount }: { progress: Progress; doneCount: number }) {
  const last = progress.lastLessonId ? lessonById(progress.lastLessonId) : lessons[0];
  return (
    <div className="sheet">
      <p className="kicker">Spartan-7 XC7S15 · ESP32</p>
      <h1>先在页面里走通，再下载到板子上。</h1>
      <p className="lede">
        每个实验有目标、用到的功能块、命令、可勾选的步骤，以及一个和板上行为一致的仿真。进度只存在这台浏览器里。
      </p>
      <p className="meter">
        已完成 {doneCount} / {lessons.length}
      </p>
      {last ? (
        <a className="continue" href={`#/lessons/${last.id}`}>
          <span>继续</span>
          <strong>
            {last.id} {last.title}
          </strong>
          <em>{last.heading}</em>
        </a>
      ) : null}
      {tracks.map((track) => {
        const items = track.lessonIds.map((id) => lessonById(id)).filter((item): item is Lesson => item !== undefined);
        const finished = items.filter((item) => lessonDone(progress, item.id, stepCountForLesson(item))).length;
        return (
          <section key={track.id} className="track">
            <header>
              <h2>{track.title}</h2>
              <p>{track.summary}</p>
              <span>
                {finished}/{items.length}
              </span>
            </header>
            <ul>
              {items.map((lesson) => (
                <li key={lesson.id}>
                  <a href={`#/lessons/${lesson.id}`}>
                    <b>{lesson.id}</b>
                    <span>{lesson.title}</span>
                    {lessonDone(progress, lesson.id, stepCountForLesson(lesson)) ? <i>完成</i> : null}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function LessonPage({
  lesson,
  progress,
  onToggle,
}: {
  lesson: Lesson | undefined;
  progress: Progress;
  onToggle: (index: number) => void;
}) {
  const [view, setView] = useState<"lab" | "code">("lab");
  const [manualLang, setManualLang] = useState<ManualLang>("zh");
  if (!lesson) {
    return (
      <div className="sheet">
        <h1>没有这个实验</h1>
        <a href="#/">返回目录</a>
      </div>
    );
  }
  const checks = progress.checks[lesson.id] ?? [];
  const track = tracks.find((item) => item.id === lesson.track);
  const index = track?.lessonIds.indexOf(lesson.id) ?? 0;
  const nextId = track && index >= 0 ? track.lessonIds[index + 1] : undefined;
  const next = nextId ? lessonById(nextId) : undefined;
  const manual = hasManualContent(lesson.id);
  const stepList = manualStepsForLesson(lesson.id, lesson.steps, manualLang);
  const stepTotal = stepList.length;
  const manualTexts = manualGoalForLesson(lesson.id, lesson.goal, lesson.learn, manualLang);
  const ui = manualUi[manualLang];
  const showLearn = manualTexts.learn.length > 0;
  const showCommand = !manual || !isGenericManualCommand(lesson.command);

  return (
    <article className="sheet lesson">
      <p className="kicker">
        {track?.title} · {lesson.id}
      </p>
      <h1>{lesson.heading}</h1>
      <div className="dock">
        <button type="button" className={view === "lab" ? "on" : ""} onClick={() => setView("lab")}>
          做实验
        </button>
        <button type="button" className={view === "code" ? "on" : ""} onClick={() => setView("code")}>
          读代码
        </button>
      </div>
      {view === "lab" && manual ? <ManualLangTabs lang={manualLang} onChange={setManualLang} /> : null}
      {view === "code" ? (
        <section>
          <pre>
            <code>{lesson.code.source}</code>
          </pre>
          <p>
            <a href={lesson.sourceHref}>{lesson.sourceLabel}</a>
          </p>
        </section>
      ) : (
        <>
          <section>
            <h2>{manual ? ui.goal : "目标"}</h2>
            <p>{manualTexts.goal}</p>
            {showLearn ? (
              <ul className="learn">
                {manualTexts.learn.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
          <ManualLessonPanels lessonId={lesson.id} lang={manualLang} />
          <section>
            <h2>用到哪里</h2>
            <BoardDiagram active={lesson.parts} />
            <p className="note">拖动旋转，滚轮缩放。亮起的区域是这一课用到的器件。microSD 在板子背面，把板子转过去就能看到。</p>
          </section>
          {showCommand ? (
            <section>
              <h2>命令</h2>
              <pre>
                <code>{lesson.command}</code>
              </pre>
            </section>
          ) : null}
          <section>
            <h2>{manual && stepTotal > lesson.steps.length ? ui.steps : "步骤"}</h2>
            <p className="note subtle">
              {manual && stepTotal > lesson.steps.length ? ui.stepsHint : null}
            </p>
            <ol className="steps">
              {stepList.map((step, stepIndex) => (
                <li key={`${stepIndex}-${step.slice(0, 40)}`}>
                  <label>
                    <input type="checkbox" checked={checks[stepIndex] === true} onChange={() => onToggle(stepIndex)} />
                    <span>{step}</span>
                  </label>
                </li>
              ))}
            </ol>
          </section>
          <section className="stage">
            <h2>仿真</h2>
            <Simulator widget={lesson.widget} />
          </section>
          <p className="note">{lesson.note}</p>
          {next ? (
            <a className="continue" href={`#/lessons/${next.id}`}>
              <span>下一课</span>
              <strong>
                {next.id} {next.title}
              </strong>
            </a>
          ) : (
            <a className="continue" href="#/">
              <span>这一组结束</span>
              <strong>回到目录</strong>
            </a>
          )}
        </>
      )}
    </article>
  );
}

function BoardPage() {
  const [active, setActive] = useState<PartId>("fpga");
  const part = parts.find((item) => item.id === active);
  const usedBy = useMemo(
    () => lessons.filter((lesson) => lesson.parts.includes(active)),
    [active],
  );
  return (
    <div className="sheet">
      <h1>板子上的功能块</h1>
      <p className="lede">
        拖动旋转这块板，点器件或连线上的名字。翻到背面能看到 microSD、ADC1173、W25Q32 和 TXS0104。点「走进芯片内部」可浏览
        XC7S15 各功能块及参数。封装脚位以原理图为准。
      </p>
      <BoardDiagram active={[active]} onSelect={setActive} />
      <div className="part-list">
        {parts.map((item) => (
          <button key={item.id} type="button" className={item.id === active ? "on" : ""} onClick={() => setActive(item.id)}>
            {item.name}
          </button>
        ))}
      </div>
      {part ? (
        <section>
          <h2>{part.name}</h2>
          <p>{part.detail}</p>
          <ul>
            {usedBy.map((lesson) => (
              <li key={lesson.id}>
                <a href={`#/lessons/${lesson.id}`}>
                  {lesson.id} {lesson.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

type BenchStatus = {
  board: string;
  fpga: string;
  part: string;
  wireless: string;
  tool: string;
  mode: string;
  flashed: string;
  links: { label: string; href: string }[];
};

function BenchPage() {
  const [status, setStatus] = useState<BenchStatus | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const url = new URL("data/bench-status.json", document.baseURI);
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<BenchStatus>;
      })
      .then(setStatus)
      .catch(() => setError("读不到工作台状态。"));
  }, []);
  return (
    <div className="sheet">
      <h1>工作台</h1>
      {error ? <p>{error}</p> : null}
      {status ? (
        <>
          <dl className="fields">
            <div>
              <dt>板</dt>
              <dd>{status.board}</dd>
            </div>
            <div>
              <dt>FPGA</dt>
              <dd>
                {status.fpga} · {status.part}
              </dd>
            </div>
            <div>
              <dt>无线</dt>
              <dd>{status.wireless}</dd>
            </div>
            <div>
              <dt>工具</dt>
              <dd>{status.tool}</dd>
            </div>
            <div>
              <dt>配置方式</dt>
              <dd>{status.mode}</dd>
            </div>
            <div>
              <dt>当前 bitstream</dt>
              <dd>{status.flashed}</dd>
            </div>
          </dl>
          <ul>
            {status.links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
