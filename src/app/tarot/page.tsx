"use client";

import { useState } from "react";
import { drawTarot } from "@/lib/engines/tarot";
import type { TarotQuestionType, TarotSpread, TarotResult } from "@/lib/engines/types";
import { PageShell } from "@/components/ui/PageShell";
import { ResultCard } from "@/components/ui/ResultCard";
import { Field, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { FlipCard } from "./FlipCard";

const QUESTION_OPTIONS: { value: TarotQuestionType; label: string }[] = [
  { value: "career", label: "事业" },
  { value: "love", label: "感情" },
  { value: "study", label: "学业" },
  { value: "general", label: "综合" },
];

const SPREAD_OPTIONS: { value: TarotSpread; label: string }[] = [
  { value: "one", label: "单张 · 现时指引" },
  { value: "three", label: "三张 · 过去现在未来" },
];

type Phase = "idle" | "shuffling" | "done";

// 洗牌仪式：晃动的牌堆 + 静心文案
function ShuffleDeck() {
  return (
    <div className="flex flex-col items-center py-6">
      <div className="anim-shake relative h-40 w-28" style={{ perspective: 900 }}>
        {[0, 1, 2].map((k) => (
          <div
            key={k}
            className="absolute inset-0 flex items-center justify-center rounded-xl border"
            style={{
              background:
                "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 55%, var(--surface)))",
              borderColor: "color-mix(in srgb, var(--accent) 55%, var(--bg))",
              transform: `translateY(${k * 3}px) rotate(${(k - 1) * 7}deg)`,
            }}
          >
            <span className="text-xl" style={{ color: "var(--bg)" }}>
              ✦
            </span>
          </div>
        ))}
      </div>
      <p className="anim-pop mt-5 text-sm" style={{ color: "var(--text-sub)" }}>
        洗牌中 · 请静心凝神…
      </p>
    </div>
  );
}

export default function TarotPage() {
  const [questionType, setQuestionType] = useState<TarotQuestionType>("general");
  const [spread, setSpread] = useState<TarotSpread>("three");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<TarotResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isBusy = phase === "shuffling";

  const handleDraw = () => {
    setError(null);
    setResult(null);
    setPhase("shuffling");
    // 短暂洗牌仪式后再开牌
    setTimeout(() => {
      const res = drawTarot(questionType, spread);
      if (res.ok && res.data) {
        setResult(res.data);
        setPhase("done");
      } else {
        setError(res.error ?? "占卜出错了，请重试");
        setPhase("idle");
      }
    }, 800);
  };

  const handleReset = () => {
    setPhase("idle");
    setResult(null);
    setError(null);
  };

  return (
    <PageShell
      title="塔罗占卜"
      subtitle="七十八张牌 · 一事一问。先静心十秒，再抽牌看指引。"
    >
      {/* 起卦表单 */}
      <ResultCard title="起卦" tag={spread === "three" ? "过去 · 现在 · 未来" : "现时指引"}>
        <div className="space-y-4">
          <Field label="问题类型">
            <Select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as TarotQuestionType)}
              disabled={isBusy}
            >
              {QUESTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="牌阵" hint="占卜前先静心十秒，心中默念所问之事">
            <Select
              value={spread}
              onChange={(e) => setSpread(e.target.value as TarotSpread)}
              disabled={isBusy}
            >
              {SPREAD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Button onClick={handleDraw} disabled={isBusy} className="w-full">
            {isBusy ? "洗牌中…" : "洗牌开牌"}
          </Button>
        </div>
      </ResultCard>

      {/* 洗牌仪式动效 */}
      {phase === "shuffling" && <ShuffleDeck />}

      {/* 翻牌仪式与解读 */}
      {phase === "done" && result && (
        <>
          <ResultCard
            title="翻牌仪式"
            tag={result.spread === "three" ? "三张 · 过去现在未来" : "单张 · 现时指引"}
          >
            {result.spread === "three" ? (
              <div className="grid grid-cols-3 gap-3">
                {result.draws.map((draw, i) => (
                  <div
                    key={draw.card.index}
                    className="anim-fade-up"
                    style={{ animationDelay: `${0.2 + i * 0.25}s` }}
                  >
                    <FlipCard
                      card={draw.card}
                      reversed={draw.reversed}
                      position={draw.position}
                      delay={i * 0.2}
                      size="md"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="anim-fade-up flex justify-center" style={{ animationDelay: "0.2s" }}>
                <FlipCard card={result.draws[0].card} reversed={result.draws[0].reversed} size="lg" />
              </div>
            )}
          </ResultCard>

          <ResultCard title="综合解读">
            <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
              {result.summary}
            </p>
          </ResultCard>

          <div className="flex justify-center pt-1">
            <Button variant="ghost" onClick={handleReset}>
              重新洗牌
            </Button>
          </div>
        </>
      )}

      {/* 错误提示 */}
      {error && (
        <ResultCard title="出了点问题">
          <p className="text-sm leading-relaxed" style={{ color: "#e5534b" }}>
            {error}
          </p>
        </ResultCard>
      )}
    </PageShell>
  );
}
