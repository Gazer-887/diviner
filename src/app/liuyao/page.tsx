"use client";

import { useState } from "react";
import { castLiuyao } from "@/lib/engines/liuyao";
import type { LiuyaoResult, LiuyaoLine } from "@/lib/engines/types";
import { PageShell } from "@/components/ui/PageShell";
import { ResultCard } from "@/components/ui/ResultCard";
import { Field, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ShareCard } from "@/components/ui/ShareCard";

const SHAKE_MS = 900;

// ---------- 私有小组件：三枚铜钱（摇卦仪式动效） ----------
function Coins({ shaking }: { shaking: boolean }) {
  return (
    <div className="flex justify-center py-4">
      <div className="flex items-center gap-4" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`flex h-14 w-14 items-center justify-center rounded-full border text-xl ${shaking ? "anim-coin" : ""}`}
            style={{
              background:
                "linear-gradient(145deg, var(--accent), color-mix(in srgb, var(--accent) 45%, var(--surface)))",
              borderColor: "color-mix(in srgb, var(--accent) 60%, var(--bg))",
              color: "var(--bg)",
              animationDelay: `${i * 0.08}s`,
            }}
          >
            卦
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- 私有小组件：单个爻（阳/阴 + 动爻标记） ----------
function YaoLine({ line }: { line: LiuyaoLine }) {
  const isYang = line.yinYang === "yang";
  const label = line.value === 9 ? "老阳" : line.value === 7 ? "少阳" : line.value === 6 ? "老阴" : "少阴";
  return (
    <div className="flex items-center gap-3">
      {isYang ? (
        <div className="flex flex-col gap-1.5">
          <span className="block h-1.5 w-14 rounded-full" style={{ background: "var(--accent)" }} />
          <span className="block h-1.5 w-14 rounded-full" style={{ background: "var(--accent)" }} />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <span className="block h-1.5 w-14 rounded-full" style={{ background: "var(--accent)" }} />
          <span className="block h-1.5 w-14 rounded-full bg-transparent" style={{ border: "1.5px solid var(--accent)" }} />
        </div>
      )}
      <span className="text-xs" style={{ color: line.moving ? "var(--accent)" : "var(--text-faint)" }}>
        {label}
        {line.moving ? " · 动" : ""}
      </span>
    </div>
  );
}

// ---------- 私有小组件：吉凶徽章 ----------
function LevelBadge({ level }: { level: LiuyaoResult["benGua"]["level"] }) {
  let style: React.CSSProperties;
  if (level === "大吉" || level === "吉") {
    style = { background: "var(--accent)", color: "var(--bg)" };
  } else if (level === "中平") {
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

function formatTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ---------- 要诀点拨文案（按吉凶与动爻数推导） ----------
type Level = LiuyaoResult["benGua"]["level"];
const KEY_TIPS: Record<Level, string> = {
  大吉: "大势所趋，大胆推进即可。关键在于「顺势而不自满」，把这份好运用在长期积累上，而非一时挥霍。",
  吉: "整体向好的格局，宜主动把握眼前机会。顺势而为、稳扎稳打，好局面会持续放大。",
  中平: "吉凶各半、进退有度。这里讲究「不妄动、不空等」，看清方向后再出手，稳中求进最合时宜。",
  小凶: "气场偏弱，宜收敛锋芒、以守为攻。此刻多一分谨慎，就少一分损耗；把重心放在止损与蓄力上。",
  凶: "当下环境不利硬闯，宜静不宜动。守住底线、保存实力，待阻力消退后再图发展方为上策。",
};
const AVOID_TIPS: Record<Level, string> = {
  大吉: "勿因势顺而轻敌，也莫把全部筹码压在顺境上。留三分余地，方能守住这份吉运。",
  吉: "忌得意忘形、操之过急；也莫因顺利而忽略细节，稳中有进的节奏最可贵。",
  中平: "忌摇摆不定、脚踏两条船；也忌逆势强求。专注一件事、把选择做扎实，比什么都重要。",
  小凶: "忌冲动决策、意气用事；忌轻信他人承诺。当下最怕「越急越错」，慢下来反而是最好的保护。",
  凶: "忌心存侥幸、冒险加码；忌讳疾忌医、讳败忌言。直面问题、及时止损，才能把损失降到最低。",
};
function keyTip(level: Level, moving: number): string {
  return `${KEY_TIPS[level]}${moving === 0 ? "本次六爻安定、无动爻，意为事态平稳，按当前轨迹推进即可。" : moving >= 3 ? `加上 ${moving} 个动爻，变数颇多，随机应变、灵活调整格外重要。` : `本卦带 ${moving} 个动爻，事有转机，留意细微变化，机会往往藏在转折处。`}`;
}
function avoidTip(level: Level): string {
  return AVOID_TIPS[level];
}

export default function LiuyaoPage() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<LiuyaoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);

  const handleCast = () => {
    if (shaking) return;
    setShaking(true);
    setError(null);
    window.setTimeout(() => {
      const res = castLiuyao(question.trim() || undefined);
      if (res.ok && res.data) {
        setResult(res.data);
      } else {
        setError(res.error ?? "起卦失败，请稍后再试");
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
    <PageShell title="六爻八卦" subtitle="三枚铜钱摇六次，动爻成变卦。一事一问，心诚则灵。">
      {!result && (
        <ResultCard title="起卦">
          <div className="space-y-4">
            <Coins shaking={shaking} />
            <Field label="所问之事" hint="一事一问，默念心中所问，再摇卦。">
              <TextArea
                rows={2}
                maxLength={60}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="可留空，默念于心"
              />
            </Field>
            <Button onClick={handleCast} disabled={shaking} className="w-full">
              {shaking ? "摇卦中…" : "摇卦起爻"}
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
              <ResultCard title="所问之事">
                <p className="text-sm leading-relaxed">{result.question}</p>
              </ResultCard>
            </div>
          )}

          {/* 卦象展示：key 随 castAt 变化，重摇时整卡重挂载以重播仪式动画 */}
          <div
            key={result.castAt}
            className="anim-fade-up"
            style={{ animationDelay: "0.12s" }}
          >
            <ResultCard
              title="卦象"
              tag={`${result.lower.symbol}${result.upper.symbol} · 上${result.upper.name}下${result.lower.name}`}
            >
              {/* 阶段 12 仪式元素：四主题在结果首卡呈现专属装饰（纯展示、aria-hidden） */}
              <div className="wb-ritual" aria-hidden="true" />
              {/* 六爻，初爻在下 */}
              <div className="flex flex-col-reverse items-center gap-2.5">
                {result.lines.map((line, i) => (
                  <YaoLine key={i} line={line} />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-3 text-sm">
                <span style={{ color: "var(--text-sub)" }}>
                  第 {result.benGua.order} 卦 · {result.benGua.name}
                </span>
                <LevelBadge level={result.benGua.level} />
              </div>
              {result.bianGua && (
                <p className="mt-2 text-center text-xs" style={{ color: "var(--text-faint)" }}>
                  动爻 {result.movingPositions.join("·")} 位 → 变卦「{result.bianGua.name}」
                </p>
              )}
            </ResultCard>
          </div>

          {/* 本卦卦辞 */}
          <div className="anim-fade-up" style={{ animationDelay: "0.24s" }}>
            <ResultCard title="卦辞">
              <p className="whitespace-pre-line text-sm leading-loose">{result.benGua.guaci}</p>
            </ResultCard>
          </div>

          {/* 四维断语 */}
          <div className="anim-fade-up" style={{ animationDelay: "0.36s" }}>
            <ResultCard title="四维断语">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { title: "事业", text: result.benGua.career },
                  { title: "感情", text: result.benGua.love },
                  { title: "财运", text: result.benGua.wealth },
                  { title: "健康", text: result.benGua.health },
                ].map((sec) => (
                  <div key={sec.title}>
                    <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                      {sec.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                      {sec.text}
                    </p>
                  </div>
                ))}
              </div>
            </ResultCard>
          </div>

          {/* 综合解读 */}
          <div className="anim-fade-up" style={{ animationDelay: "0.48s" }}>
            <ResultCard title="综合解读">
              <p className="text-sm leading-relaxed">{result.summary}</p>
            </ResultCard>
          </div>

          {/* 关键提示 / 避坑建议 / 心态指引（按吉凶与动爻推导） */}
          <div className="anim-fade-up" style={{ animationDelay: "0.54s" }}>
            <ResultCard title="要诀点拨">
              <div className="space-y-3">
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    关键提示
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {keyTip(result.benGua.level, result.movingPositions.length)}
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    避坑建议
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {avoidTip(result.benGua.level)}
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    心态指引
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    卦象示现的是当下气场与趋势，并非不可改变的定数。心正则事顺，尽人事而后听天命，才是占卜之本意。无论吉凶，都把它当作一面镜子，照见自己该调整的方向即可。
                  </p>
                </div>
              </div>
            </ResultCard>
          </div>

          <div
            className="anim-fade-up flex flex-wrap items-center justify-between gap-3"
            style={{ animationDelay: "0.6s" }}
          >
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>
              起卦时间：{formatTime(result.castAt)}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={handleReset}>
                重新起卦
              </Button>
            </div>
          </div>

          <div className="anim-fade-up" style={{ animationDelay: "0.72s" }}>
            <ShareCard
              theme="六爻八卦"
              title={`${result.benGua.name} · ${result.benGua.level}`}
              icon="爻"
              lines={[
                { label: "卦序", value: `第 ${result.benGua.order} 卦 · ${result.benGua.name}（${result.benGua.level}）` },
                {
                  label: "卦辞",
                  value: `卦意：${result.benGua.guaci}`,
                },
                {
                  label: "变卦",
                  value: result.bianGua
                    ? `${result.movingPositions.join("·")} 位动 → 变卦「${result.bianGua.name}」（${result.bianGua.level}）`
                    : "六爻安定、无动爻，事态平稳，按当前轨迹推进即可",
                },
                { label: "事业", value: `事业：${result.benGua.career}` },
                { label: "感情", value: `感情：${result.benGua.love}` },
                { label: "财运", value: `财运：${result.benGua.wealth}` },
                { label: "健康", value: `健康：${result.benGua.health}` },
                { label: "综合解读", value: `整体来看，${result.summary}` },
              ]}
            />
          </div>
        </>
      )}
    </PageShell>
  );
}
