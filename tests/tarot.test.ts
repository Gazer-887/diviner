import { describe, it, expect } from "vitest";
import { drawTarot } from "../src/lib/engines/tarot";
import { TAROT_CARDS } from "../src/lib/data/tarot";
import type { TarotCard, TarotQuestionType, TarotSpread } from "../src/lib/engines/types";

/** 固定随机源：恒返回 0.5，保证结果完全确定 */
const fixedRng = () => 0.5;

describe("塔罗内容库", () => {
  it("共 78 张牌，index 0-77 连续唯一", () => {
    expect(TAROT_CARDS).toHaveLength(78);
    const indexes = TAROT_CARDS.map((c) => c.index);
    expect(new Set(indexes).size).toBe(78);
    for (let i = 0; i < 78; i++) expect(indexes).toContain(i);
  });

  it("大阿卡纳 22 张（number 0-21）、小阿卡纳 56 张", () => {
    const majors = TAROT_CARDS.filter((c) => c.arcana === "major");
    const minors = TAROT_CARDS.filter((c) => c.arcana === "minor");
    expect(majors).toHaveLength(22);
    expect(minors).toHaveLength(56);
    majors.forEach((c, i) => expect(c.number).toBe(i));
    minors.forEach((c) => {
      expect(c.number).toBeGreaterThanOrEqual(1);
      expect(c.number).toBeLessThanOrEqual(14);
    });
  });

  it("每张牌正位/逆位关键词各 3-5 个", () => {
    TAROT_CARDS.forEach((c: TarotCard) => {
      expect(c.upright.length).toBeGreaterThanOrEqual(3);
      expect(c.upright.length).toBeLessThanOrEqual(5);
      expect(c.reversed.length).toBeGreaterThanOrEqual(3);
      expect(c.reversed.length).toBeLessThanOrEqual(5);
    });
  });

  it("小阿卡纳包含四种花色与宫廷牌", () => {
    const names = TAROT_CARDS.map((c) => c.name);
    expect(names).toContain("权杖一");
    expect(names).toContain("圣杯十");
    expect(names).toContain("宝剑国王");
    expect(names).toContain("星币王后");
    const suits = new Set(TAROT_CARDS.filter((c) => c.arcana === "minor").map((c) => c.suit));
    expect(suits).toEqual(new Set(["wands", "cups", "swords", "pentacles"]));
  });
});

describe("塔罗引擎 drawTarot", () => {
  const types: TarotQuestionType[] = ["career", "love", "study", "general"];
  const spreads: TarotSpread[] = ["one", "three"];

  it("固定 rng 两次抽牌结果一致（确定性）", () => {
    for (const q of types) {
      for (const s of spreads) {
        const a = drawTarot(q, s, fixedRng);
        const b = drawTarot(q, s, fixedRng);
        expect(a).toEqual(b);
        expect(a.ok).toBe(true);
      }
    }
  });

  it("three 牌阵抽 3 张，position 依次为过去/现在/未来", () => {
    const res = drawTarot("love", "three", fixedRng);
    expect(res.ok).toBe(true);
    expect(res.data).toBeDefined();
    const draws = res.data!.draws;
    expect(draws).toHaveLength(3);
    expect(draws[0].position).toBe("过去");
    expect(draws[1].position).toBe("现在");
    expect(draws[2].position).toBe("未来");
    // 三张牌不重复
    const ids = draws.map((d) => d.card.index);
    expect(new Set(ids).size).toBe(3);
  });

  it("one 牌阵抽 1 张且不设 position", () => {
    const res = drawTarot("career", "one", fixedRng);
    expect(res.ok).toBe(true);
    const draws = res.data!.draws;
    expect(draws).toHaveLength(1);
    expect(draws[0].position).toBeUndefined();
  });

  it("正逆位判定由 rng 决定：rng() < 0.5 为逆位", () => {
    // 恒返回 0.49 → 每张都判定为逆位
    const revRes = drawTarot("general", "one", () => 0.49);
    expect(revRes.ok).toBe(true);
    expect(revRes.data!.draws[0].reversed).toBe(true);
    // 恒返回 0.5 → 非逆位（正位）
    const upRes = drawTarot("general", "one", () => 0.5);
    expect(upRes.ok).toBe(true);
    expect(upRes.data!.draws[0].reversed).toBe(false);
  });

  it("非法 questionType / spread 返回 ok:false", () => {
    expect(drawTarot("unknown" as TarotQuestionType, "one").ok).toBe(false);
    expect(drawTarot("career", "five" as TarotSpread).ok).toBe(false);
    const res = drawTarot("bad" as TarotQuestionType, "bad" as TarotSpread);
    expect(res.ok).toBe(false);
    expect(res.error).toBeTruthy();
    expect(res.data).toBeUndefined();
  });

  it("summary 为 3-4 句中文解读，不含夸大措辞", () => {
    const res = drawTarot("study", "three", fixedRng);
    const summary = res.data!.summary;
    const sentences = summary.split(/[。！？]/).filter(Boolean);
    expect(sentences.length).toBeGreaterThanOrEqual(3);
    expect(sentences.length).toBeLessThanOrEqual(4);
    expect(summary).toContain("仅供娱乐参考");
    expect(summary).not.toContain("必定");
    expect(res.data!.questionType).toBe("study");
    expect(res.data!.spread).toBe("three");
  });
});
