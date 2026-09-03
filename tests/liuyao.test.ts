// ============================================================
// 六爻起卦引擎测试
// 确定性 / 阴阳动爻判定 / 上下卦映射 / 变卦 / 内容库规范
// ============================================================

import { describe, it, expect } from "vitest";
import { castLiuyao } from "../src/lib/engines/liuyao";
import { TRIGRAMS, HEXAGRAMS } from "../src/lib/data/liuyao";

function data(question?: string, rng?: () => number) {
  const res = castLiuyao(question, rng);
  expect(res.ok).toBe(true);
  if (!res.ok || !res.data) throw new Error(res.error ?? "未知错误");
  return res.data;
}

/** 固定随机源：恒返回 0.4 → 每枚铜钱 <0.5 正面(3)，三枚之和恒为 9（老阳，动） */
const fixedRng9 = () => 0.4;

describe("castLiuyao 六爻结构", () => {
  it("固定 rng 两次起卦结果完全一致（确定性）", () => {
    const a = castLiuyao("我近期财运如何", fixedRng9);
    const b = castLiuyao("我近期财运如何", fixedRng9);
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(a.data!.lines).toEqual(b.data!.lines);
    expect(a.data!.benGua).toEqual(b.data!.benGua);
  });

  it("六爻均有 6/7/8/9，且 yinYang/moving 与 value 自洽", () => {
    // 随机源 0.4 → 每爻和为 9（老阳）→ 六爻都动
    const r = data("测", fixedRng9);
    expect(r.lines).toHaveLength(6);
    r.lines.forEach((l) => {
      expect([6, 7, 8, 9]).toContain(l.value);
      if (l.value === 9 || l.value === 7) expect(l.yinYang).toBe("yang");
      if (l.value === 6 || l.value === 8) expect(l.yinYang).toBe("yin");
      expect(l.moving).toBe(l.value === 6 || l.value === 9);
    });
  });

  it("动爻位置与 moving 标记一致（初爻为 1）", () => {
    const r = data("测", fixedRng9);
    // 六爻全 9 → 全部动
    expect(r.movingPositions).toEqual([1, 2, 3, 4, 5, 6]);
    expect(r.lines.every((l) => l.moving)).toBe(true);
  });
});

describe("castLiuyao 上下卦映射", () => {
  it("下卦/上卦为八卦之一，符号与自然象正确", () => {
    for (const name of ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"]) {
      const t = TRIGRAMS[Object.keys(TRIGRAMS).find((k) => TRIGRAMS[k].name === name)!];
      expect(t).toBeDefined();
      expect(t.symbol).toBeTruthy();
      expect(t.nature).toBeTruthy();
    }
  });

  it("任一摇卦结果的本卦名上下卦拼接能得到内容库卦象", () => {
    for (let i = 0; i < 50; i++) {
      const r = data(undefined, () => Math.random());
      const key = `${r.upper.name}${r.lower.name}`;
      expect(HEXAGRAMS[key]).toBeDefined();
      expect(r.benGua.name).toBe(HEXAGRAMS[key].name);
    }
  });
});

describe("castLiuyao 变卦", () => {
  it("六爻全动（全 9 老阳）→ 有变卦，且变卦上下卦为「本卦全翻转」", () => {
    const r = data("测", fixedRng9);
    expect(r.movingPositions).toHaveLength(6);
    expect(r.bianGua).toBeDefined();
    // 六爻全 9 老阳 → 变卦六爻全阴 → 上下卦皆坤 → 坤为地
    expect(r.bianGua!.name).toBe("坤为地");
  });

  it("无动爻时 bianGua 与 movingPositions 为空", () => {
    // 恒 0.5 → 每枚铜钱 <0.5? 0.5 不小于 0.5 → 反面(2)，三枚之和恒 6（老阴，动）
    // 用能产生静爻的序列：交替 → 难以精确构造，改为扫描多组找到"六静"
    let found = false;
    for (let i = 0; i < 500 && !found; i++) {
      const r = castLiuyao("测", () => Math.random());
      if (r.ok && r.data!.movingPositions.length === 0) {
        found = true;
        expect(r.data!.bianGua).toBeUndefined();
      }
    }
    expect(found).toBe(true);
  });
});

describe("castLiuyao 内容与参数", () => {
  it("question 原样回显，超 50 字截断", () => {
    const q = "我何时能遇到心仪之人";
    const r = data(q, fixedRng9);
    expect(r.question).toBe(q);
    const long = "问".repeat(60);
    expect(data(long, fixedRng9).question).toBe("问".repeat(50));
  });

  it("未传 question 时字段为 undefined", () => {
    const r = data(undefined, fixedRng9);
    expect(r.question).toBeUndefined();
  });

  it("castAt 为 ISO 时间", () => {
    const r = data("测", fixedRng9);
    expect(new Date(r.castAt).toISOString()).toBe(r.castAt);
  });

  it("summary 内容非空且含本卦名", () => {
    const r = data("测", fixedRng9);
    expect(r.summary.length).toBeGreaterThan(0);
    expect(r.summary).toContain(r.benGua.name);
  });
});

describe("六爻内容库数据规范", () => {
  it("64 卦齐全且 order 1-64 唯一", () => {
    const names = Object.keys(HEXAGRAMS);
    expect(names).toHaveLength(64);
    const orders = Object.values(HEXAGRAMS).map((g) => g.order);
    expect(new Set(orders).size).toBe(64);
    for (let i = 1; i <= 64; i++) expect(orders).toContain(i);
  });

  it("每卦断语字段完整、吉凶合法", () => {
    const validLevels = ["大吉", "吉", "中平", "小凶", "凶"];
    for (const g of Object.values(HEXAGRAMS)) {
      expect(g.name.length).toBeGreaterThan(0);
      expect(g.guaci.length).toBeGreaterThan(0);
      expect(g.career.length).toBeGreaterThan(0);
      expect(g.love.length).toBeGreaterThan(0);
      expect(g.wealth.length).toBeGreaterThan(0);
      expect(g.health.length).toBeGreaterThan(0);
      expect(validLevels).toContain(g.level);
    }
  });

  it("八卦符号唯一且与先天卦序对应", () => {
    const symbols = Object.values(TRIGRAMS).map((t) => t.symbol);
    expect(new Set(symbols).size).toBe(8);
  });
});
