"use client";

import { useState, type ReactNode } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { ResultCard } from "@/components/ui/ResultCard";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ShareButton } from "@/components/ui/ShareButton";
import { computeBazi } from "@/lib/engines/bazi";
import type { BaziResult } from "@/lib/engines/types";

// ---------- 时辰表：值 = 起始小时数（0-23），label 覆盖小时段 ----------
const SHICHEN = [
  { value: "0", label: "子时 (23-01)" },
  { value: "2", label: "丑时 (01-03)" },
  { value: "4", label: "寅时 (03-05)" },
  { value: "6", label: "卯时 (05-07)" },
  { value: "8", label: "辰时 (07-09)" },
  { value: "10", label: "巳时 (09-11)" },
  { value: "12", label: "午时 (11-13)" },
  { value: "14", label: "未时 (13-15)" },
  { value: "16", label: "申时 (15-17)" },
  { value: "18", label: "酉时 (17-19)" },
  { value: "20", label: "戌时 (19-21)" },
  { value: "22", label: "亥时 (21-23)" },
];

// ---------- 五行标注：天干/地支 → 五行中文（用于单柱五行小字） ----------
const STEM_EL: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土",
  己: "土", 庚: "金", 辛: "金", 壬: "水", 癸: "水",
};
const BRANCH_EL: Record<string, string> = {
  子: "水", 亥: "水", 寅: "木", 卯: "木", 巳: "火", 午: "火",
  申: "金", 酉: "金", 辰: "土", 戌: "土", 丑: "土", 未: "土",
};

// ---------- 四柱顺序 ----------
const PILLARS = [
  { key: "year", label: "年柱" },
  { key: "month", label: "月柱" },
  { key: "day", label: "日柱" },
  { key: "hour", label: "时柱" },
] as const;

// ---------- 五行分布展示顺序：金木水火土 ----------
const FIVE_ORDER = [
  { key: "metal", label: "金" },
  { key: "wood", label: "木" },
  { key: "water", label: "水" },
  { key: "fire", label: "火" },
  { key: "earth", label: "土" },
] as const;

/** 让 ResultCard 的淡入动画按 delay 错开出现 */
function Stagger({ delay, children }: { delay: string; children: ReactNode }) {
  return (
    <div className="anim-fade-up" style={{ animationDelay: delay }}>
      {children}
    </div>
  );
}

export default function BaziPage() {
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("12");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BaziResult | null>(null);

  function handleSubmit() {
    if (!year.trim() || !month.trim() || !day.trim()) {
      setError("请填写完整信息");
      return;
    }
    const res = computeBazi({
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour: Number(hour),
      gender,
    });
    if (res.ok && res.data) {
      setError(null);
      setResult(res.data);
    } else {
      setError(res.error ?? "排盘失败，请检查输入");
    }
  }

  function handleClear() {
    setYear("");
    setMonth("");
    setDay("");
    setHour("12");
    setGender("male");
    setError(null);
    setResult(null);
  }

  function handleReset() {
    setError(null);
    setResult(null);
  }

  return (
    <PageShell title="生辰八字" subtitle="输入出生时间，起出四柱八字，观五行之分布，断性格之趋向">
      {/* ---------- 表单区 ---------- */}
      <ResultCard title="出生信息">
        {error && (
          <p className="mb-3 text-sm" style={{ color: "#e5534b" }}>
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-4">
            <Field label="出生年份">
              <TextInput
                type="number"
                min={1900}
                max={2100}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="如 1995"
              />
            </Field>
          </div>
          <Field label="出生月份">
            <TextInput
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="如 8"
            />
          </Field>
          <Field label="出生日期">
            <TextInput
              type="number"
              min={1}
              max={31}
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="如 15"
            />
          </Field>
          <Field label="时辰">
            <Select value={hour} onChange={(e) => setHour(e.target.value)}>
              {SHICHEN.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="性别">
            <Select
              value={gender}
              onChange={(e) => setGender(e.target.value as "male" | "female")}
            >
              <option value="male">男</option>
              <option value="female">女</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={handleSubmit}>起卦排盘</Button>
          <Button variant="ghost" onClick={handleClear}>
            清空
          </Button>
        </div>
      </ResultCard>

      {/* ---------- 结果区 ---------- */}
      {result && (
        <>
          <ResultCard title="四柱排盘">
            <div className="flex">
              {PILLARS.map((p) => {
                const pillar = result.pillars[p.key];
                return (
                  <div key={p.key} className="flex-1 text-center">
                    <div className="text-xs" style={{ color: "var(--text-faint)" }}>
                      {p.label}
                    </div>
                    <div
                      className="mt-1 font-serif text-2xl"
                      style={{ color: "var(--accent)" }}
                    >
                      {pillar.full}
                    </div>
                    <div className="mt-1 text-xs" style={{ color: "var(--text-sub)" }}>
                      {STEM_EL[pillar.stem]}
                      {BRANCH_EL[pillar.branch]}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs" style={{ color: "var(--text-sub)" }}>
              日主：
              <span className="font-serif" style={{ color: "var(--accent)" }}>
                {result.dayMaster}
              </span>
              {" · 生肖："}
              {result.zodiac}
            </p>
          </ResultCard>

          <Stagger delay="0.1s">
            <ResultCard title="五行分布">
              <div className="space-y-2.5">
                {FIVE_ORDER.map((f) => {
                  const count = result.fiveElements[f.key];
                  return (
                    <div key={f.key} className="flex items-center gap-3">
                      <span className="w-4 text-sm" style={{ color: "var(--text-sub)" }}>
                        {f.label}
                      </span>
                      <div
                        className="h-2 flex-1 overflow-hidden rounded-full"
                        style={{ background: "var(--border)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(count / 8) * 100}%`,
                            background: "var(--accent)",
                          }}
                        />
                      </div>
                      <span className="w-6 text-right text-xs" style={{ color: "var(--text-sub)" }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
              {result.missing.length > 0 && (
                <p className="mt-3 text-xs" style={{ color: "var(--text-faint)" }}>
                  五行缺：{result.missing.join("、")}
                </p>
              )}
            </ResultCard>
          </Stagger>

          <Stagger delay="0.2s">
            <ResultCard title="命理解读">
              <div className="space-y-4">
                {[
                  { title: "性格", text: result.personality },
                  { title: "事业", text: result.careerHint },
                  { title: "感情", text: result.loveHint },
                  { title: "流年", text: result.yearHint },
                ].map((sec) => (
                  <div key={sec.title}>
                    <h3
                      className="font-serif text-sm font-medium"
                      style={{ color: "var(--accent)" }}
                    >
                      {sec.title}
                    </h3>
                    <p
                      className="mt-1 whitespace-pre-line text-sm leading-relaxed"
                      style={{ color: "var(--text)" }}
                    >
                      {sec.text}
                    </p>
                  </div>
                ))}
              </div>
            </ResultCard>
          </Stagger>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <ShareButton
              title={`生辰八字 · ${result.pillars.year.full}年 ${result.dayMaster}日主`}
              text={`四柱：${result.pillars.year.full} ${result.pillars.month.full} ${result.pillars.day.full} ${result.pillars.hour.full}\n日主：${result.dayMaster}　生肖：${result.zodiac}\n五行：金${result.fiveElements.metal} 木${result.fiveElements.wood} 水${result.fiveElements.water} 火${result.fiveElements.fire} 土${result.fiveElements.earth}`}
            />
            <Button variant="ghost" onClick={handleReset}>
              重新测算
            </Button>
          </div>
        </>
      )}
    </PageShell>
  );
}
