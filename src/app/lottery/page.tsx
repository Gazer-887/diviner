"use client";

import { useState, type CSSProperties } from "react";
import { drawLottery } from "@/lib/engines/lottery";
import type { LotteryResult, LotteryStick } from "@/lib/engines/types";
import { PageShell } from "@/components/ui/PageShell";
import { Field, TextArea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ResultCard } from "@/components/ui/ResultCard";
import { ShareCard } from "@/components/ui/ShareCard";

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

// ---------- 要诀点拨文案（按签之吉凶六档 + 签诗意象推导） ----------
type Level = LotteryStick["level"];

const KEY_TIPS: Record<Level, string> = {
  上上: "此乃大吉之签，气场顺遂、时机正合，所求之事宜大胆推进。签中已有明确示现，把握眼前这股东风，把好运用在长期积累上，而非一时挥霍。顺势而为的同时，更要记得把根基打牢。",
  上吉: "这签整体向上，正是主动出击的好时候。天时、地利、人和渐齐，抓住机会、稳扎稳打，好局面会持续放大。签意指向一个「进」字——宜主动进取，而非原地停滞。",
  中吉: "此签吉凶参半、进退皆有章法。签意提醒你「行稳致远」，看清方向再出手，稳中求进最合时宜。眼前虽有可为之事，也莫贪快求进，把每一步踩实，好运才接得住。",
  中平: "签属中平，图的是一个「稳」字。此签之意在「不妄动、不空等」：方向未明时就多观察、少下注；该努力时则尽全力。平稳不是平庸，而是在乱局中守住自己的节奏。",
  下吉: "签势转弱，宜收敛锋芒、以守为攻。签意透着几分「戒备」，提醒你此刻多一分谨慎，就少一分损耗。把重心放到止损与蓄力上，待气运回转，再图进取不迟。",
  下下: "此为下下之签，气场偏逆，硬闯无益。签文之意在「宜静不宜动」，守住底线、保存实力，莫在逆风中逞强。把当下当作一次修整，待阻力消退、心境清明，方有转机。",
};

const AVOID_TIPS: Record<Level, string> = {
  上上: "惜乎盛极易衰。逢大吉之时，最忌轻敌与挥霍，莫把全部筹码都压在顺境之上。留三分余地、存一分清醒，吉运方能长久；也别因势顺而忽略细节，阴沟里翻船最是可惜。",
  上吉: "忌得意忘形、操之过急。势头虽好，也得一步一个脚印；莫因顺遂就打乱自己的节奏。更要紧的是别轻信「十拿九稳」，凡事多留一手，稳中有进才是最值钱的东西。",
  中吉: "忌摇摆不定、脚踏两船，也忌逆势强求。此签之象本为「中道」，最怕两边都想要、两边都落空。专注一件事、把选择做扎实，比什么都重要。",
  中平: "忌冲动决策、意气用事，也忌轻信他人空口的承诺。当前最怕「越急越错」——犹豫不决或急于求成，都容易把一池好水搅浑。慢下来，反而成了此刻最好的保护。",
  下吉: "忌心存侥幸、冒险加码，忌病急乱投医。气运偏弱时，最忌讳与人赌气、凭一时意气做决定。及时止损、收缩战线，才能把损失压到最低，别让一次失误拖垮全局。",
  下下: "忌逆势硬闯、孤注一掷，更忌讳疾忌医、讳败忌言。运气落到底时，最怕的不是坏事本身，而是不敢面对后果、接着错下去。直面问题、手起刀落，才能守住本钱、迎来转机。",
};

const MIND_TIPS: Record<Level, string> = {
  上上: "幸运是老天给的，能不能接住却是自己的本事。越顺，越要沉住气，把这份好运用来成全长期的自己。占卜所示只是当下的气场，提醒你别辜负这段难得的顺风。",
  上吉: "势头向好时，人最容易飘。请记住：签好不等于万事大吉，尽了本分才是真的接住了这份运势。把这股冲劲留给做事本身，而不是留给得意忘形。",
  中吉: "吉凶相间，最考验的是心态的定力。不因一时顺利而得意，也不因一点波折而慌张。把心放平，跟着节奏走，该你的一样都不会少。",
  中平: "平签最考验耐心。别因为没有大起大落就心焦，也别因为一时平淡而松懈。守恒是一种智慧，守住平淡，往往就守住了往后细水长流的好运。",
  下吉: "运势偏弱，正是磨心性的好时机。别急着问「为什么是我」，先问「我能做什么」。把情绪收一收，把力气用在调整上，低谷里也能攒出反弹的力道。",
  下下: "运到最低处，便是向上的开端。签文示警，只是提醒你别在低谷里自我消耗。允许自己停下来喘口气，把这段跌宕当成必经的功课，终会熬过阴霾、见那天光。",
};

/** 取签诗第一行，用作意象引子 */
function poemImage(poem: string): string {
  return poem.split("\n")[0]?.trim() ?? "";
}

/** 按签之吉凶六档 + 签诗意象推导「要诀点拨」三区文案 */
function makeLotteryTips(result: LotteryResult): { key: string; avoid: string; mind: string } {
  const { level, poem } = result.stick;
  const image = poemImage(poem);
  const key = image
    ? `${KEY_TIPS[level]}此签诗云「${image}」，行事宜顺象而行，莫逆其意。`
    : KEY_TIPS[level];
  return {
    key,
    avoid: AVOID_TIPS[level],
    mind: MIND_TIPS[level],
  };
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

  const tips = result ? makeLotteryTips(result) : null;

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
              {/* 阶段 12 仪式元素：四主题在结果首卡呈现专属装饰（纯展示、aria-hidden） */}
              <div className="wb-ritual" aria-hidden="true" />
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

          {/* 要诀点拨：关键提示 / 避坑建议 / 心态指引（按签之吉凶与签诗意象推导） */}
          <div className="anim-fade-up" style={{ animationDelay: "0.42s" }}>
            <ResultCard title="要诀点拨">
              <div className="space-y-3">
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    关键提示
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {tips!.key}
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    避坑建议
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {tips!.avoid}
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                    心态指引
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                    {tips!.mind}
                  </p>
                </div>
              </div>
            </ResultCard>
          </div>

          <div
            className="anim-fade-up flex flex-wrap items-center justify-between gap-3"
            style={{ animationDelay: "0.48s" }}
          >
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>
              抽签时间：{formatTime(result.drawnAt)}
            </span>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={handleReset}>
                再抽一签
              </Button>
            </div>
          </div>

          <div className="anim-fade-up" style={{ animationDelay: "0.56s" }}>
            <ShareCard
              theme="抽签解签"
              title={`第 ${result.stick.number} 签 · ${result.stick.name}（${result.stick.level}）`}
              icon="签"
              lines={[
                { label: "签序", value: `第 ${result.stick.number} 签 · ${result.stick.name}` },
                { label: "吉凶", value: result.stick.level },
                { label: "签诗", value: result.stick.poem.replace(/\n/g, " ") },
                { label: "解曰", value: result.stick.explain },
                { label: "指引", value: result.stick.advice },
                { label: "所问", value: result.question ?? "未填写" },
              ]}
            />
          </div>
        </>
      )}
    </PageShell>
  );
}
