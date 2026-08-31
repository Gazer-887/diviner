"use client";

import { useState } from "react";
import { computeName } from "@/lib/engines/name";
import type { NameResult } from "@/lib/engines/types";
import { PageShell } from "@/components/ui/PageShell";
import { Field, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ResultCard } from "@/components/ui/ResultCard";

const WUGE_ITEMS: { key: keyof NameResult["wuge"]; label: string }[] = [
  { key: "tian", label: "天格" },
  { key: "ren", label: "人格" },
  { key: "di", label: "地格" },
  { key: "wai", label: "外格" },
  { key: "zong", label: "总格" },
];

export default function NamePage() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [result, setResult] = useState<NameResult | null>(null);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError("姓名不能为空");
      return;
    }
    const res = computeName(trimmed);
    if (res.ok && res.data) {
      setResult(res.data);
      setError(undefined);
    } else {
      setResult(null);
      setError(res.error);
    }
  };

  const handleClear = () => {
    setName("");
    setError(undefined);
  };

  const handleReset = () => {
    setResult(null);
    setError(undefined);
  };

  const isBadFortune = result?.fortune === "小凶" || result?.fortune === "凶";

  const chars = result ? Array.from(result.name) : [];
  const strokeText = result
    ? chars.map((ch, i) => `${ch}(${result.strokes[i]})`).join(" ")
    : "";

  return (
    <PageShell
      title="姓名测试"
      subtitle="五格剖象 · 三才配置，从姓名笔画推演数理吉凶与运势走向。"
    >
      {/* ---------- 表单区 ---------- */}
      <ResultCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="姓名" error={error}>
              <TextInput
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(undefined);
                }}
                placeholder="如 李白"
                maxLength={4}
                autoComplete="off"
              />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit}>测算姓名</Button>
            <Button variant="ghost" onClick={handleClear}>
              清空
            </Button>
          </div>
        </div>
      </ResultCard>

      {/* ---------- 结果区 ---------- */}
      {result && (
        <>
          {/* 总评 */}
          <div className="anim-fade-up" style={{ animationDelay: "0.05s" }}>
            <ResultCard title="总评" tag={result.name}>
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <div
                    className="font-serif text-3xl font-medium leading-none"
                    style={{ color: "var(--accent)" }}
                  >
                    {result.score}
                  </div>
                  <div className="mt-1.5 text-xs" style={{ color: "var(--text-faint)" }}>
                    综合得分
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    isBadFortune ? "border" : ""
                  }`}
                  style={
                    isBadFortune
                      ? { background: "transparent", color: "var(--text-faint)", borderColor: "var(--border)" }
                      : { background: "var(--accent)", color: "var(--bg)" }
                  }
                >
                  {result.fortune}
                </span>
              </div>
            </ResultCard>
          </div>

          {/* 五格数理 */}
          <div className="anim-fade-up" style={{ animationDelay: "0.15s" }}>
            <ResultCard title="五格数理">
              <div className="text-sm">
                <div className="grid grid-cols-3 pb-2 text-xs" style={{ color: "var(--text-faint)" }}>
                  <span>格名</span>
                  <span>数理</span>
                  <span>吉凶</span>
                </div>
                {WUGE_ITEMS.map((item, idx) => (
                  <div
                    key={item.key}
                    className="grid grid-cols-3 py-2 text-sm"
                    style={{
                      borderTop: "1px solid var(--border)",
                      background: idx % 2 === 1 ? "var(--surface)" : "transparent",
                    }}
                  >
                    <span style={{ color: "var(--text-sub)" }}>{item.label}</span>
                    <span className="font-serif" style={{ color: "var(--accent)" }}>
                      {result.wuge[item.key]}
                    </span>
                    <span
                      className="font-serif"
                      style={{
                        color: result.wugeGood[item.key] ? "var(--accent)" : "var(--text-faint)",
                      }}
                    >
                      {result.wugeGood[item.key] ? "吉" : "凶"}
                    </span>
                  </div>
                ))}
              </div>
              {strokeText && (
                <p
                  className="mt-4 border-t pt-3 text-xs"
                  style={{ borderColor: "var(--border)", color: "var(--text-faint)" }}
                >
                  各字笔画：{strokeText}
                </p>
              )}
            </ResultCard>
          </div>

          {/* 三才配置 */}
          <div className="anim-fade-up" style={{ animationDelay: "0.25s" }}>
            <ResultCard title="三才配置">
              <div className="font-serif text-2xl font-medium" style={{ color: "var(--accent)" }}>
                {result.sanCai}
              </div>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "var(--text-sub)" }}
              >
                {result.sanCaiComment}
              </p>
            </ResultCard>
          </div>

          {/* 姓名点评 */}
          <div className="anim-fade-up" style={{ animationDelay: "0.35s" }}>
            <ResultCard title="姓名点评">
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    事业
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed">{result.career}</p>
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    感情
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed">{result.love}</p>
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    健康
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed">{result.health}</p>
                </div>
              </div>
            </ResultCard>
          </div>

          <div className="anim-fade-up flex justify-center pt-1" style={{ animationDelay: "0.45s" }}>
            <Button variant="ghost" onClick={handleReset}>
              重新测算
            </Button>
          </div>
        </>
      )}
    </PageShell>
  );
}
