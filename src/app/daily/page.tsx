"use client";

import { useState } from "react";
import { computeDaily } from "@/lib/engines/daily";
import type { DailyResult } from "@/lib/engines/types";
import { PageShell } from "@/components/ui/PageShell";
import { Field, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ResultCard } from "@/components/ui/ResultCard";
import { ShareCard } from "@/components/ui/ShareCard";

/** 十二生肖选项（选择仅作仪式感，实际结果以引擎当日生肖为准） */
const ZODIACS = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];

/** 中文色名 → 展示色值（供幸运色圆点使用） */
const COLOR_HEX: Record<string, string> = {
  黑: "#3a3a40",
  蓝: "#4a7fd4",
  白: "#e6e3d8",
  金: "#c9a24b",
  黄: "#d9b94a",
  棕: "#8a6a45",
  红: "#cf4b3a",
  绿: "#4c9e6f",
  青: "#2fa8a8",
  粉: "#e08aa0",
  紫: "#8a6fc0",
  银: "#aab2bf",
  橙: "#d9823a",
};

/** 分项指数行配置 */
const SCORE_ITEMS: { key: "career" | "wealth" | "love" | "health"; label: string }[] = [
  { key: "career", label: "事业" },
  { key: "wealth", label: "财运" },
  { key: "love", label: "感情" },
  { key: "health", label: "健康" },
];

// ---------- 要诀点拨文案（按四维分数 / 宜忌 / 指引推导） ----------
type ScoreBand = "high" | "mid" | "low";
type ScoreKey = "career" | "wealth" | "love" | "health";

const DIM_ORDER: ScoreKey[] = ["career", "wealth", "love", "health"];

const DIM_LABEL: Record<ScoreKey, string> = {
  career: "事业",
  wealth: "财运",
  love: "感情",
  health: "健康",
};

function scoreBand(score: number): ScoreBand {
  return score >= 80 ? "high" : score >= 60 ? "mid" : "low";
}

// 各维度 高/中/低 分对应的针对性提示
const DIM_TIPS: Record<ScoreKey, Record<ScoreBand, string>> = {
  career: {
    high: "事业势头正盛，适合主动推进、展示能力，把重要的事安排在最清醒的时段。",
    mid: "事业平稳有序，适合处理日常事务与积压工作，打磨细节、稳住节奏即可。",
    low: "事业略显阻滞，易遇反复或阻力，宜低调做事、少作争执，收敛锋芒再徐图。",
  },
  wealth: {
    high: "财运处于上行通道，正财稳步进账，可适度进取，把握稳健的增收机会。",
    mid: "财运不温不火，以守成为主，开源节流皆宜，避免大额冲动投入。",
    low: "财运偏弱，支出易超预期，看紧钱包、慎重决策，远离高风险投机。",
  },
  love: {
    high: "感情运温暖顺畅，适合表达心意、拉近距离，把握当下的好氛围主动出击。",
    mid: "感情七分平稳，多些耐心与倾听，少些比较与猜疑，关系自会水到渠成。",
    low: "感情运需留心，易生误会或冷场，克制情绪、给对方空间，别把小事放大。",
  },
  health: {
    high: "身体状态在线、精力充沛，适合运动与户外活动，把元气用在对的地方。",
    mid: "健康整体无恙，但别仗着底子好就熬夜透支，规律作息是今日的功课。",
    low: "健康运偏弱，警惕疲劳与旧疾反复，早点休息、清淡饮食，别硬扛。",
  },
};

// 综合运势对应的心态指引
const MINDSET_TIPS: Record<ScoreBand, string> = {
  high: "好运是顺风，不是凭仗。保持平常心，把这一天过得扎实，别让顺境冲昏了头。",
  mid: "寻常日子最见功夫。不因平淡而懈怠，也不因点滴波澜而焦躁，稳稳走完今天就是收获。",
  low: "低迷只是暂时的气场。不与自己较劲、不与他人攀比，先安顿好心情，运势自有回旋余地。",
};

function makeDailyTips(result: DailyResult): { key: string; avoid: string; mindset: string } {
  const { scores, yi, ji, advice } = result;
  const sorted = [...DIM_ORDER].sort((a, b) => scores[a] - scores[b]);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];

  const key =
    `今日亮点在${DIM_LABEL[highest]}（${scores[highest]} 分），${DIM_TIPS[highest][scoreBand(scores[highest])]}` +
    `相对薄弱的是${DIM_LABEL[lowest]}（${scores[lowest]} 分），${DIM_TIPS[lowest][scoreBand(scores[lowest])]}`;

  const avoid =
    `今日忌「${ji.join("、")}」，看似小事却最易绊脚，能避则避；` +
    `宜「${yi.join("、")}」，顺势而为反而顺遂。` +
    `尤其${DIM_LABEL[lowest]}偏弱，${DIM_TIPS[lowest][scoreBand(scores[lowest])]}`;

  const mindset = `${MINDSET_TIPS[scoreBand(scores.overall)]}${advice ? ` ${advice}` : ""}`;

  return { key, avoid, mindset };
}

/** YYYY-MM-DD → YYYY年M月D日 */
function formatDateText(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

export default function DailyPage() {
  const [zodiac, setZodiac] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<DailyResult | undefined>();

  function handleSubmit() {
    if (!zodiac) {
      setError("请先选择你的属相");
      setResult(undefined);
      return;
    }
    setError(undefined);
    const res = computeDaily(new Date());
    if (res.ok && res.data) {
      setResult(res.data);
    } else {
      setError(res.error ?? "今日运势计算失败，请稍后再试");
    }
  }

  function handleReset() {
    setZodiac("");
    setError(undefined);
    setResult(undefined);
  }

  return (
    <PageShell title="每日运势" subtitle="今日吉凶 · 宜忌指引">
      {/* 表单区 */}
      <ResultCard title="今日起卦">
        <div className="space-y-4">
          <Field label="属相" error={error}>
            <Select
              value={zodiac}
              onChange={(e) => {
                setZodiac(e.target.value);
                setError(undefined);
              }}
            >
              <option value="" disabled>
                选择你的属相
              </option>
              {ZODIACS.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </Select>
          </Field>
          <Button onClick={handleSubmit} className="w-full">
            查看今日运势
          </Button>
        </div>
      </ResultCard>

      {/* 结果区 */}
      {result && (
        <>
          {/* 今日总览 */}
          <div className="anim-fade-up" style={{ animationDelay: "0.1s" }}>
            <ResultCard title="今日总览">
              <div className="flex items-baseline justify-between">
                <span className="text-sm" style={{ color: "var(--text-sub)" }}>
                  {formatDateText(result.date)}
                </span>
                <span className="text-xs" style={{ color: "var(--accent)" }}>
                  今日属相：{result.zodiac}
                </span>
              </div>
              <div className="mt-4 text-center">
                <div className="font-serif text-3xl font-medium" style={{ color: "var(--accent)" }}>
                  {result.scores.overall}
                </div>
                <div className="mt-1 text-xs" style={{ color: "var(--text-faint)" }}>
                  综合运势
                </div>
              </div>
              <div
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "color-mix(in srgb, var(--accent) 18%, transparent)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${result.scores.overall}%`, background: "var(--accent)" }}
                />
              </div>
            </ResultCard>
          </div>

          {/* 分项指数 */}
          <div className="anim-fade-up" style={{ animationDelay: "0.2s" }}>
            <ResultCard title="分项指数">
              <div className="space-y-3">
                {SCORE_ITEMS.map((item) => {
                  const score = result.scores[item.key];
                  return (
                    <div key={item.key} className="flex items-center gap-3">
                      <span
                        className="w-10 shrink-0 text-sm"
                        style={{ color: "var(--text-sub)" }}
                      >
                        {item.label}
                      </span>
                      <div
                        className="h-2 flex-1 overflow-hidden rounded-full"
                        style={{
                          background: "color-mix(in srgb, var(--accent) 18%, transparent)",
                        }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${score}%`, background: "var(--accent)" }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-sm">{score}</span>
                    </div>
                  );
                })}
              </div>
            </ResultCard>
          </div>

          {/* 宜 / 忌 */}
          <div className="anim-fade-up" style={{ animationDelay: "0.3s" }}>
            <ResultCard title="宜 / 忌">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-2 text-sm font-medium" style={{ color: "var(--accent)" }}>
                    宜
                  </h3>
                  <ul className="space-y-1.5">
                    {result.yi.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <span
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ background: "var(--accent)" }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium" style={{ color: "var(--text-sub)" }}>
                    忌
                  </h3>
                  <ul className="space-y-1.5">
                    {result.ji.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm">
                        <span
                          className="size-1.5 shrink-0 rounded-full"
                          style={{ background: "var(--text-faint)" }}
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ResultCard>
          </div>

          {/* 今日指引 */}
          <div className="anim-fade-up" style={{ animationDelay: "0.4s" }}>
            <ResultCard title="今日指引">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1.5 text-sm">
                    <span
                      className="size-2.5 shrink-0 rounded-full border"
                      style={{
                        background: COLOR_HEX[result.luckyColor] ?? "var(--accent)",
                        borderColor: "var(--border)",
                      }}
                    />
                    <span>{result.luckyColor}</span>
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "var(--text-faint)" }}>
                    幸运色
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">{result.luckyNumber}</div>
                  <div className="mt-1 text-xs" style={{ color: "var(--text-faint)" }}>
                    幸运数字
                  </div>
                </div>
                <div>
                  <div className="text-sm">{result.luckyDirection}</div>
                  <div className="mt-1 text-xs" style={{ color: "var(--text-faint)" }}>
                    幸运方位
                  </div>
                </div>
              </div>
              <div className="my-3" style={{ borderTop: "1px solid var(--border)" }} />
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-sub)" }}>
                {result.advice}
              </p>
            </ResultCard>
          </div>

          {/* 关键提示 / 避坑建议 / 心态指引（按四维分数与宜忌推导） */}
          <div className="anim-fade-up" style={{ animationDelay: "0.46s" }}>
            <ResultCard title="要诀点拨">
              <div className="space-y-3">
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    关键提示
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {makeDailyTips(result).key}
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    避坑建议
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {makeDailyTips(result).avoid}
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    心态指引
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {makeDailyTips(result).mindset}
                  </p>
                </div>
              </div>
            </ResultCard>
          </div>

          <div className="anim-fade-up flex flex-wrap items-center justify-center gap-3 pt-1" style={{ animationDelay: "0.5s" }}>
            <Button variant="ghost" onClick={handleReset}>
              重新查看
            </Button>
          </div>

          <div className="anim-fade-up" style={{ animationDelay: "0.56s" }}>
            <ShareCard
              theme="每日运势"
              title={`${result.date} · ${result.zodiac}`}
              icon="运"
              lines={[
                { label: "综合", value: `${result.scores.overall}分` },
                { label: "四维", value: `事业${result.scores.career} · 财运${result.scores.wealth} · 感情${result.scores.love} · 健康${result.scores.health}` },
                { label: "幸运", value: `色 ${result.luckyColor} · 数 ${result.luckyNumber} · 位 ${result.luckyDirection}` },
                { label: "宜", value: result.yi.join("、") },
                { label: "忌", value: result.ji.join("、") },
                { label: "指引", value: result.advice },
              ]}
            />
          </div>
        </>
      )}
    </PageShell>
  );
}
