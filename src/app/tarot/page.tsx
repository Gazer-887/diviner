"use client";

import { useState } from "react";
import { drawTarot } from "@/lib/engines/tarot";
import type { TarotQuestionType, TarotSpread, TarotResult } from "@/lib/engines/types";
import { PageShell } from "@/components/ui/PageShell";
import { ResultCard } from "@/components/ui/ResultCard";
import { Field, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ShareCard } from "@/components/ui/ShareCard";
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

// ---------- 要诀点拨文案（按问题类型 / 牌面正逆位推导） ----------
const QTYPE_LABEL: Record<TarotQuestionType, string> = {
  career: "事业",
  love: "感情",
  study: "学业",
  general: "综合",
};

// 各问题类型的避坑建议
const AVOID_TIPS: Record<TarotQuestionType, string> = {
  career: "忌盲目跳槽或贸然跟风，也忌在竞争中失了分寸；把判断建立在事实之上，而非一时情绪。",
  love: "忌猜疑试探、翻旧账，也忌把对方当成筹码；坦诚相待与保持边界感，胜过刻意试探。",
  study: "忌浮躁贪多、临时抱佛脚，也忌钻牛角尖；稳住节奏、查漏补缺才是不走弯路的捷径。",
  general: "忌心浮气躁、随波逐流，也忌一时意气用事；凡事多想一步，往往就能少走许多弯路。",
};

// 各问题类型的心态指引
const MINDSET_TIPS: Record<TarotQuestionType, string> = {
  career: "牌面照见的是当下气场，并非注定结局。把它当作提醒，专注掌控过程，结果自会水到渠成。",
  love: "感情是双向的功课，牌面只提供一种视角。用心经营，也别忘了善待自己，爱与被爱都在平衡中发生。",
  study: "学问讲求积累与心态。别被一时的起伏牵动，保持节奏、持续用力，时间终会给出一份答复。",
  general: "无论牌面吉凶，都把它当成一面镜子，照见该调整的方向。尽人事、听天命，心安即是归处。",
};

function makeTarotTips(result: TarotResult): { key: string; avoid: string; mindset: string } {
  const { summary, draws, questionType } = result;
  const upright = draws.filter((d) => !d.reversed).length;
  const reversed = draws.length - upright;
  const label = QTYPE_LABEL[questionType];
  const brief = summary.replace(/\s+/g, "").split(/[。！？]/)[0];

  let key: string;
  if (upright > reversed) {
    key =
      `牌面大意：${brief}。正位为主（${upright} 正 ${reversed} 逆），气场通透，宜顺势而为。` +
      `在${label}上，把握眼前的机会主动争取，多数能得到正向的回馈与支持。`;
  } else if (reversed > upright) {
    key =
      `牌面大意：${brief}。逆位为主（${upright} 正 ${reversed} 逆），能量受阻，宜谨慎自省。` +
      `在${label}上，先缓一缓、看清内在的阻碍与情绪，勿操之过急。`;
  } else {
    key =
      `牌面大意：${brief}。正逆两立（${upright} 正 ${reversed} 逆），吉凶参半、进退有据。` +
      `在${label}上，既是机会也是考验，把握分寸、不偏不倚，反而容易破局。`;
  }

  const avoid =
    `${AVOID_TIPS[questionType]} ` +
    (reversed > upright
      ? `且牌面逆位偏多，警惕在${label}上因情绪或惯性，做出偏离本心的决定。`
      : `顺势也别得意忘形，预留退路、不把路走绝，才是长久之道。`);

  const mindset = `${MINDSET_TIPS[questionType]}`;

  return { key, avoid, mindset };
}

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

          {/* 关键提示 / 避坑建议 / 心态指引（按问题类型与牌面正逆位推导） */}
          <div className="anim-fade-up" style={{ animationDelay: "0.3s" }}>
            <ResultCard title="要诀点拨">
              <div className="space-y-3">
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    关键提示
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {makeTarotTips(result).key}
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    避坑建议
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {makeTarotTips(result).avoid}
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    心态指引
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {makeTarotTips(result).mindset}
                  </p>
                </div>
              </div>
            </ResultCard>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button variant="ghost" onClick={handleReset}>
              重新洗牌
            </Button>
          </div>

          <div className="anim-fade-up" style={{ animationDelay: "0.5s" }}>
            <ShareCard
              theme="塔罗占卜"
              title={result.draws.map((d) => d.card.name).join(" · ")}
              icon="塔"
              lines={[
                { label: "牌阵", value: result.spread === "three" ? "过去·现在·未来" : "现时指引" },
                {
                  label: "牌面",
                  value: result.draws
                    .map((d, i) => (result.spread === "three" ? `${["过去", "现在", "未来"][i]}：` : "") + `${d.card.name}（${d.reversed ? "逆" : "正"}）`)
                    .join(" / "),
                },
                { label: "解读", value: result.summary.slice(0, 60) },
              ]}
            />
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
