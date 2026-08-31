import { describe, it, expect } from "vitest";
import { drawLottery } from "../src/lib/engines/lottery";
import { LOTTERY_STICKS } from "../src/lib/data/lottery";
import type { LotteryStick } from "../src/lib/engines/types";

const VALID_LEVELS = new Set(["上上", "上吉", "中吉", "中平", "下吉", "下下"]);

/** 固定随机源：恒返回 0.5 → 恒取第 20 支签（0.5 * 40 = 20） */
const fixedRng = () => 0.5;

describe("抽签内容库", () => {
  it("共 40 支签，number 1-40 连续唯一", () => {
    expect(LOTTERY_STICKS).toHaveLength(40);
    const numbers = LOTTERY_STICKS.map((s) => s.number);
    expect(new Set(numbers).size).toBe(40);
    for (let i = 1; i <= 40; i++) expect(numbers).toContain(i);
  });

  it("每支签 level 合法且签诗为七言四句", () => {
    LOTTERY_STICKS.forEach((s: LotteryStick) => {
      expect(VALID_LEVELS.has(s.level)).toBe(true);
      const lines = s.poem.split("\n").filter(Boolean);
      expect(lines).toHaveLength(4);
      // 七言：每行恰 7 字
      lines.forEach((line) => {
        expect(line.length).toBe(7);
      });
    });
  });

  it("六档吉凶分布合理且覆盖全部档位", () => {
    const levels = LOTTERY_STICKS.map((s) => s.level);
    VALID_LEVELS.forEach((lv) => expect(levels).toContain(lv));
  });
});

describe("抽签引擎 drawLottery", () => {
  it("固定 rng 两次抽取的签一致（确定性）", () => {
    const a = drawLottery("我近期财运如何", fixedRng);
    const b = drawLottery("我近期财运如何", fixedRng);
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(a.data!.stick.number).toBe(b.data!.stick.number);
    expect(a.data!.stick).toEqual(b.data!.stick);
  });

  it("返回的签来自内容库", () => {
    const res = drawLottery(undefined, fixedRng);
    expect(res.ok).toBe(true);
    expect(LOTTERY_STICKS).toContain(res.data!.stick);
    // 固定 rng 下应取到 LOTTERY_STICKS[20]（第 21 签）
    expect(res.data!.stick).toBe(LOTTERY_STICKS[20]);
  });

  it("question 原样回显", () => {
    const q = "我何时能遇到良人";
    const res = drawLottery(q, fixedRng);
    expect(res.ok).toBe(true);
    expect(res.data!.question).toBe(q);
  });

  it("question 超过 50 字截断为 50 字", () => {
    const long = "甲".repeat(60);
    const res = drawLottery(long, fixedRng);
    expect(res.ok).toBe(true);
    expect(res.data!.question).toBe("甲".repeat(50));
  });

  it("未传 question 时 question 字段为 undefined", () => {
    const res = drawLottery(undefined, fixedRng);
    expect(res.ok).toBe(true);
    expect(res.data!.question).toBeUndefined();
  });

  it("drawnAt 为 ISO 格式时间", () => {
    const res = drawLottery("测", fixedRng);
    expect(res.ok).toBe(true);
    expect(typeof res.data!.drawnAt).toBe("string");
    expect(new Date(res.data!.drawnAt).toISOString()).toBe(res.data!.drawnAt);
  });
});
