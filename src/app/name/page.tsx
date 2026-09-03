"use client";

import { useState } from "react";
import { computeName } from "@/lib/engines/name";
import type { NameResult } from "@/lib/engines/types";
import { PageShell } from "@/components/ui/PageShell";
import { Field, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { ResultCard } from "@/components/ui/ResultCard";
import { ShareCard } from "@/components/ui/ShareCard";

const WUGE_ITEMS: { key: keyof NameResult["wuge"]; label: string }[] = [
  { key: "tian", label: "天格" },
  { key: "ren", label: "人格" },
  { key: "di", label: "地格" },
  { key: "wai", label: "外格" },
  { key: "zong", label: "总格" },
];

// ---------- 要诀点拨文案（按吉凶等级与三才五行推导） ----------
type NameElement = "木" | "火" | "土" | "金" | "水";
type NameLevel = NameResult["fortune"];
const NAME_SHENG: Record<NameElement, NameElement> = {
  木: "火", 火: "土", 土: "金", 金: "水", 水: "木",
};
const NAME_KE: Record<NameElement, NameElement> = {
  木: "土", 土: "水", 水: "火", 火: "金", 金: "木",
};

const NAME_KEY: Record<NameLevel, string> = {
  大吉: "姓名数理气势大旺，命中带贵格，受天时眷顾，诸事顺遂之象。运势如顺水行舟，宜大胆把握眼前机会，把这份好底子用在长期耕耘上，成就可期。",
  吉: "整体数理格局良好，运势稳中有升、贵人渐显。宜主动进取、稳扎稳打，在关键节点果断出手，好运气自会持续累积，往往从小事见真章。",
  中吉: "数理吉凶参半，属中平之运。宜守正待时、步步为营，不求一步登天，把眼前每件事做扎实，运势自然缓缓走高，细水长流方能致远。",
  小凶: "数理格局略弱，运势起伏偏多。此刻宜低调蓄力、以静制动，别急着硬闯，先稳住基本盘，待时机成熟再图突破，平稳即是上策。",
  凶: "数理偏弱，运势多阻碍。当下切忌强求冒进，宜收敛锋芒、守住底线，把重心放在止损与自我提升上，转机往往先看心态的变化。",
};
const NAME_AVOID: Record<NameLevel, string> = {
  大吉: "虽吉运当头，最忌得意忘形、操之过急。别把顺境当理所当然，留三分余地、逢人三分话，方能守住财帛，让好运长久延续下去。",
  吉: "运势向好，忌贪多求快、四面出击。精力放在一处才能成事，也忌轻视细节与流程，往往最不经意的疏忽处，最容易凭空生波折。",
  中吉: "中平之运，最忌摇摆不定、脚踏两船。也忌逆势强求，勉强之事难长久；认准一条路稳稳走，比频繁更换赛道更为明智。",
  小凶: "运势偏弱，忌冲动决策、意气用事，更忌听风就是雨、轻信他人。当下最怕越急越乱，慢下来、多求证，方能把损失降到最小。",
  凶: "运势受阻，忌心存侥幸、冒险加码。也忌讳疾忌医，问题越是回避越棘手；直面短板、及时取舍，才能换出重新上路的余地。",
};
const NAME_MIND: Record<NameLevel, string> = {
  大吉: "名字有吉，更要有一颗惜福之心。把好运当作起点而非终点，保持谦和与感恩，你的人脉与格局会随这份定力越走越开阔。",
  吉: "运有增益，贵在保持平常心。顺时不骄、逆时不馁，把每一个小成当作垫脚石，稳稳走下去，自有一条属于你的坦途。",
  中吉: "中平之命，最讲心态平稳。不因一时顺境自满，也不因短暂低谷气馁，以平常心看待得失，细水长流处自有长久的福缘。",
  小凶: "姓名运势偏弱，更要靠心态托底。信命而不认命，把眼前的波动当作逆风的磨砺，调整方向再出发，往往正是新的出口。",
  凶: "运势虽低，莫要丧志。名字只是起点，路终究是人走出来的。少些抱怨、多些沉淀，沉得住气的人，终究能等来转机。",
};

/** 依三才五行生克关系给出提示 */
function nameSanCaiTip(sanCai: string): string {
  const chars = [...sanCai];
  if (chars.length < 3) return "";
  const [a, b, c] = chars as [NameElement, NameElement, NameElement];
  const up = NAME_SHENG[a] === b ? "生" : NAME_KE[a] === b ? "克" : "比和";
  const down = NAME_SHENG[b] === c ? "生" : NAME_KE[b] === c ? "克" : "比和";
  if (up === "生" && down === "生") return `三才${sanCai}流通相生，根基顺遂，名利易得，宜顺势而为。`;
  if (up === "克" && down === "克") return `三才${sanCai}相战，遇事宜以稳为先，切忌激进求成。`;
  if (up === "生" || down === "生") return `三才${sanCai}生克相济，运势有起有伏，宜扬长避短、放大优势。`;
  if (up === "克" || down === "克") return `三才${sanCai}含相克，注意调和五行，遇事多留余地、少起争执。`;
  return `三才${sanCai}比和，个性稳重，贵人缘渐浓，宜以和为贵。`;
}

function makeNameTips(result: NameResult): { key: string; avoid: string; mindset: string } {
  const level = result.fortune;
  const scoreTip =
    result.score >= 80
      ? `此名得 ${result.score} 分，属上乘之选，宜把握时机、顺势精进。`
      : result.score <= 50
        ? `此名得 ${result.score} 分，尚有余地，宜低调蓄力，以时日换运程。`
        : `此名得 ${result.score} 分，中规中矩，宜稳中求进、切勿贪功。`;
  return {
    key: `${nameSanCaiTip(result.sanCai)}${NAME_KEY[level]}`,
    avoid: NAME_AVOID[level],
    mindset: `${NAME_MIND[level]}${scoreTip}`,
  };
}

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

          <div className="anim-fade-up" style={{ animationDelay: "0.42s" }}>
            <ResultCard title="要诀点拨">
              {(() => {
                const tips = makeNameTips(result);
                return (
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                        关键提示
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                        {tips.key}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                        避坑建议
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                        {tips.avoid}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-medium" style={{ color: "var(--accent)" }}>
                        心态指引
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text)" }}>
                        {tips.mindset}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </ResultCard>
          </div>

          <div className="anim-fade-up flex flex-wrap items-center justify-center gap-3 pt-1" style={{ animationDelay: "0.45s" }}>
            <Button variant="ghost" onClick={handleReset}>
              重新测算
            </Button>
          </div>

          <div className="anim-fade-up" style={{ animationDelay: "0.52s" }}>
            <ShareCard
              theme="姓名测试"
              title={`${result.name} · ${result.score}分（${result.fortune}）`}
              icon="名"
              lines={[
                { label: "总评", value: `${result.score}分（${result.fortune}）` },
                { label: "五格", value: `天${result.wuge.tian} 人${result.wuge.ren} 地${result.wuge.di} 外${result.wuge.wai} 总${result.wuge.zong}` },
                { label: "三才", value: `${result.sanCai} · ${result.sanCaiComment}` },
                { label: "事业", value: result.career },
                { label: "感情", value: result.love },
                { label: "健康", value: result.health },
              ]}
            />
          </div>
        </>
      )}
    </PageShell>
  );
}
