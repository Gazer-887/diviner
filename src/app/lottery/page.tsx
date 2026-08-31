"use client";

import { useState, type CSSProperties } from "react";
import { drawLottery } from "@/lib/engines/lottery";
import type { LotteryResult, LotteryStick } from "@/lib/engines/types";
import { PageShell } from "@/components/ui/PageShell";
import { Field, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ResultCard } from "@/components/ui/ResultCard";

const SHAKE_MS = 900;

// ---------- 私有小组件：签筒（容器晃动 + 签条装饰） ----------
const STICKS = [
  { left: "20%", height: "56%", rotate: -14 },
  { left: "34%", height: "70%", rotate: -5 },
  { left: "49%", height: "64%", rotate: 3 },
  { left: "63%", height: "72%", rotate: 11 },
  { left: "76%", height: "54%", rotate: 19 },
];

function StickHolder({ shaking }: { shaking: boolean }) {
  return (
    <div className="flex justify-center py-3">
      <div
        className={`relative h-36 w-24 rounded-t-xl rounded-b-[3rem] border-2 ${shaking ? "anim-shake" : ""}`}
        style={{ background: "var(--surface)", borderColor: "var(--accent)" }}
        aria-hidden
      >
        {STICKS.map((s, i) => (
          <span
            key={i}
            className="absolute bottom-[6%] w-1.5 rounded-full"
            style={{
              left: s.left,
              height: s.height,
              transform: `rotate(${s.rotate}deg)`,
              transformOrigin: "bottom center",
              background: "color-mix(in srgb, var(--accent) 42%, transparent)",
            }}
          />
        ))}
        <span
          className="absolute left-1/2 top-[6%] h-2 w-14 -translate-x-1/2 rounded-full"
          style={{ background: "color-mix(in srgb, var(--accent) 55%, transparent)" }}
        />
      </div>
    </div>
  );
}

// ---------- 私有小组件：吉凶徽章 ----------
function LevelBadge({ level }: { level: LotteryStick["level"] }) {
  let style: CSSProperties;
  if (level === "上上" || level === "上吉") {
    style = { background: "var(--accent)", color: "var(--bg)" };
  } else if (level === "中吉") {
    style = { border: "1px solid var(--accent)", color: "var(--accent)" };
  } else if (level === "中平" || level === "下吉") {
    style = { border: "1px solid var(--border)", color: "var(--text-sub)" };
  } else {
    style = { border: "1px solid #e5534b", color: "#e5534b" };
  }
  return (
    <span className="inline-block rounded-full px-3 py-0.5 text-sm" style={style}>
      {level}
    </span>
  );
}

// ---------- 工具：ISO 时间转本地 YYYY-MM-DD HH:mm ----------
function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LotteryPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<LotteryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  const handleDraw = () => {
    if (shaking) return;
    setShaking(true);
    setError(null);
    window.setTimeout(() => {
      const res = drawLottery(question.trim() || undefined);
      if (res.ok && res.data) {
        setResult(res.data);
      } else {
        setError(res.error ?? "摇签失败，请稍后再试");
      }
      setShaking(false);
    }, SHAKE_MS);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setQuestion("");
  };

  return (
    <PageShell title="抽签解签" subtitle="四十签藏玄机，一事一签，心诚则灵。">
      {!result && (
        <ResultCard title="求签">
          <div className="space-y-4">
            <StickHolder shaking={shaking} />
            <Field label="所问之事" hint="心诚则灵，一事一签。摇签前先默念你的问题。">
              <TextArea
                rows={2}
                maxLength={60}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="可留空，默念于心"
              />
            </Field>
            <Button onClick={handleDraw} disabled={shaking} className="w-full">
              {shaking ? "摇签中…" : "摇一签"}
            </Button>
            {error && (
              <p className="text-xs" style={{ color: "#e5534b" }}>
                {error}
              </p>
            )}
          </div>
        </ResultCard>
      )}

      {result && (
        <>
          {result.question && (
            <div className="anim-fade-up" style={{ animationDelay: "0s" }}>
              <ResultCard title="所求之事">
                <p className="text-sm leading-relaxed">{result.question}</p>
              </ResultCard>
            </div>
          )}

          <div className="anim-fade-up" style={{ animationDelay: "0.12s" }}>
            <ResultCard title="签文">
              <div className="flex items-start gap-4">
                <span
                  className="anim-pop font-serif text-2xl font-medium leading-none"
                  style={{ color: "var(--accent)" }}
                >
                  第 {result.stick.number} 签
                </span>
                <div className="flex flex-col items-start gap-2">
                  <h3 className="anim-pop font-serif text-xl leading-none">{result.stick.name}</h3>
                  <div className="anim-pop" style={{ animationDelay: "0.1s" }}>
                    <LevelBadge level={result.stick.level} />
                  </div>
                </div>
              </div>
              <p
                className="anim-pop mt-4 whitespace-pre-line text-sm leading-loose"
                style={{ animationDelay: "0.2s" }}
              >
                {result.stick.poem}
              </p>
            </ResultCard>
          </div>

          <div className="anim-fade-up" style={{ animationDelay: "0.24s" }}>
            <ResultCard title="解曰">
              <p className="text-sm leading-relaxed">{result.stick.explain}</p>
            </ResultCard>
          </div>

          <div className="anim-fade-up" style={{ animationDelay: "0.36s" }}>
            <ResultCard title="行事指引">
              <p className="text-sm leading-relaxed">{result.stick.advice}</p>
            </ResultCard>
          </div>

          <div
            className="anim-fade-up flex items-center justify-between gap-3"
            style={{ animationDelay: "0.48s" }}
          >
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>
              抽签时间：{formatTime(result.drawnAt)}
            </span>
            <Button variant="ghost" onClick={handleReset}>
              再抽一签
            </Button>
          </div>
        </>
      )}
    </PageShell>
  );
}
