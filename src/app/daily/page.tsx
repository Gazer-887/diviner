"use client";

import { useState } from "react";
import { computeDaily } from "@/lib/engines/daily";
import type { DailyResult } from "@/lib/engines/types";
import { PageShell } from "@/components/ui/PageShell";
import { Field, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ResultCard } from "@/components/ui/ResultCard";
import { ShareButton } from "@/components/ui/ShareButton";

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

          <div className="anim-fade-up flex flex-wrap items-center justify-center gap-3 pt-1" style={{ animationDelay: "0.5s" }}>
            <ShareButton
              title={`每日运势 · ${result.date} ${result.zodiac}`}
              text={`今日属相：${result.zodiac}\n综合运势：${result.scores.overall}/100\n事业：${result.scores.career}　财运：${result.scores.wealth}　感情：${result.scores.love}　健康：${result.scores.health}\n宜：${result.yi.join("、 ")}\n忌：${result.ji.join("、 ")}\n今日指引：${result.advice}`}
            />
            <Button variant="ghost" onClick={handleReset}>
              重新查看
            </Button>
          </div>
        </>
      )}
    </PageShell>
  );
}
