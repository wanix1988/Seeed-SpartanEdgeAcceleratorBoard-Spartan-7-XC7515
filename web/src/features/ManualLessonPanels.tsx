import type { ReactNode } from "react";
import { manualChapter, manualExperiment } from "../content/manualBundle";
import { dedupeTextList } from "./manualDedupe";
import { manualUi, type ManualLang } from "./manualI18n";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="manual-block">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function ManualLangTabs({ lang, onChange }: { lang: ManualLang; onChange: (lang: ManualLang) => void }) {
  return (
    <div className="dock lang-dock" role="tablist" aria-label="手册语言">
      {(["zh", "en"] as const).map((code) => (
        <button
          key={code}
          type="button"
          role="tab"
          aria-selected={lang === code}
          className={lang === code ? "on" : ""}
          onClick={() => onChange(code)}
        >
          {manualUi[code].langTab}
        </button>
      ))}
    </div>
  );
}

export function ManualLessonPanels({ lessonId, lang }: { lessonId: string; lang: ManualLang }) {
  const ui = manualUi[lang];
  const exp = manualExperiment(lessonId);
  const ch = manualChapter(lessonId);
  if (!exp && !ch) return null;

  if (exp) {
    const reviewed = Boolean(exp.zh_reviewed);
    const result = lang === "zh" ? exp.result_zh ?? "" : exp.result_en ?? "";
    const procedure = lang === "zh" ? exp.guide_zh ?? "" : exp.procedure;

    if (lang === "zh" && reviewed) {
      return (
        <>
          {result ? (
            <Section title={ui.result}>
              <pre className="procedure-text">{result}</pre>
            </Section>
          ) : null}
          {procedure ? (
            <details className="procedure-fold" open>
              <summary>{ui.fullProcedure}</summary>
              <pre className="procedure-text">{procedure}</pre>
            </details>
          ) : (
            <p className="note subtle">{ui.procedureMissing}</p>
          )}
        </>
      );
    }

    const purpose = lang === "zh" ? exp.purpose_zh_body || exp.purpose_zh : exp.purpose_en || "";
    const content = lang === "zh" ? exp.content_zh_body || exp.content_zh : exp.content_en || "";
    const requirement = lang === "zh" ? exp.requirement_zh_body || exp.requirement_zh : exp.requirement_en || "";
    const blocks = dedupeTextList([purpose, content, requirement].filter(Boolean));

    return (
      <>
        {lang === "en" && blocks.length > 0 ? (
          <Section title={ui.purpose}>
            <ul className="learn">
              {blocks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Section>
        ) : null}
        {result ? (
          <Section title={ui.result}>
            <pre className="procedure-text">{result}</pre>
          </Section>
        ) : null}
        {procedure ? (
          <details className="procedure-fold">
            <summary>{ui.fullProcedure}</summary>
            <pre className="procedure-text">{procedure}</pre>
          </details>
        ) : lang === "zh" ? (
          <p className="note subtle">{ui.procedureMissing}</p>
        ) : null}
      </>
    );
  }

  const reviewed = Boolean(ch!.zh_reviewed);
  const procedure = lang === "zh" ? ch!.guide_zh ?? "" : ch!.procedure;

  if (lang === "zh" && reviewed && procedure) {
    return (
      <details className="procedure-fold" open>
        <summary>{ui.chapterBody}</summary>
        <pre className="procedure-text">{procedure}</pre>
      </details>
    );
  }

  const goal = lang === "zh" ? ch!.goal_zh : ch!.goal_en ?? "";
  return (
    <>
      {goal && !(lang === "zh" && procedure) ? (
        <Section title={ui.chapterIntro}>
          <p>{goal}</p>
        </Section>
      ) : null}
      {procedure ? (
        <details className="procedure-fold" open={lang === "zh"}>
          <summary>{ui.chapterBody}</summary>
          <pre className="procedure-text">{procedure}</pre>
        </details>
      ) : lang === "zh" ? (
        <p className="note subtle">{ui.procedureMissing}</p>
      ) : null}
    </>
  );
}

export function manualStepsForLesson(
  lessonId: string,
  fallback: string[],
  lang: ManualLang,
): string[] {
  const exp = manualExperiment(lessonId);
  if (exp) {
    if (lang === "zh" && exp.steps_zh?.length) return exp.steps_zh;
    if (lang === "en" && exp.steps.length) return exp.steps;
  }
  const ch = manualChapter(lessonId);
  if (ch) {
    if (lang === "zh" && ch.steps_zh?.length) return ch.steps_zh;
    if (lang === "en" && ch.steps.length) return ch.steps;
  }
  if (lang === "en") return fallback;
  return [];
}

export function hasManualContent(lessonId: string): boolean {
  return Boolean(manualExperiment(lessonId) ?? manualChapter(lessonId));
}

export function manualGoalForLesson(
  lessonId: string,
  catalogGoal: string,
  learn: string[],
  lang: ManualLang,
): { goal: string; learn: string[] } {
  const exp = manualExperiment(lessonId);
  if (exp && lang === "en") {
    const goal = exp.purpose_en?.trim() || catalogGoal;
    const items = dedupeTextList(
      [exp.content_en, exp.requirement_en].filter((x): x is string => Boolean(x?.trim())),
      goal,
    );
    return { goal, learn: items };
  }
  if (exp && lang === "zh") {
    const goal = exp.purpose_zh_body || exp.purpose_zh || catalogGoal;
    if (exp.zh_reviewed) {
      const items = dedupeTextList(
        [exp.content_zh_body || exp.content_zh, exp.requirement_zh_body || exp.requirement_zh].filter(Boolean),
        goal,
      );
      return { goal, learn: items };
    }
    const items = dedupeTextList(
      [exp.content_zh_body || exp.content_zh, exp.requirement_zh_body || exp.requirement_zh].filter(Boolean),
      goal,
    );
    return { goal, learn: items };
  }
  const ch = manualChapter(lessonId);
  if (ch && lang === "en") {
    const goal = ch.goal_en?.trim() || catalogGoal;
    return { goal, learn: [] };
  }
  if (ch && lang === "zh") {
    const goal = ch.goal_zh || catalogGoal;
    if (ch.zh_reviewed && ch.guide_zh) return { goal, learn: [] };
    return { goal, learn: dedupeTextList(learn, goal) };
  }
  return { goal: catalogGoal, learn: dedupeTextList(learn, catalogGoal) };
}