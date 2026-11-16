export type ManualLang = "zh" | "en";

export const manualUi = {
  zh: {
    langTab: "中文",
    goal: "目标",
    purpose: "实验目的",
    content: "实验内容",
    requirement: "实验要求",
    result: "实验结果说明",
    chapterIntro: "本章导读",
    fullProcedure: "实验操作导读（中文校订）",
    chapterBody: "本章导读（中文校订）",
    steps: "实验步骤",
    stepsHint: "可勾选步骤见上列清单；更细流程见「实验操作导读」。English 页签为 PDF 原文与英文步骤。",
    procedureMissing: "中文导读缺失。请在仓库根目录运行：python scripts/apply-zh-guides.py",
  },
  en: {
    langTab: "English",
    goal: "Goal",
    purpose: "Purpose of experiment",
    content: "Content of experiment",
    requirement: "Requirement of experiment",
    result: "Experiment result",
    chapterIntro: "Chapter overview",
    fullProcedure: "Full procedure (Steps of experiment)",
    chapterBody: "Chapter text",
    steps: "Procedure steps",
    stepsHint: "Curated executable steps; see full procedure above for detail.",
    procedureMissing: "",
  },
} as const;