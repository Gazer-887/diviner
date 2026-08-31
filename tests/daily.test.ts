// ============================================================
// 每日运势引擎测试
// ============================================================

import { describe, it, expect } from "vitest";
import { computeDaily } from "../src/lib/engines/daily";
import { DAILY_POOL, ZODIAC_NAMES, type ZodiacName } from "../src/lib/data/daily";

/** 取成功结果，失败则抛错 */
function data(date: Date, rng?: () => number) {
  const res = computeDaily(date, rng);
  expect(res.ok).toBe(true);
  if (!res.ok || !res.data) throw new Error(res.error ?? "未知错误");
  return res.data;
}

describe("computeDaily 确定性", () => {
  it("同日期两次调用结果完全一致", () => {
    const d = new Date(2024, 2, 15);
    expect(computeDaily(d)).toEqual(computeDaily(d));
  });

  it("不同日期结果不同", () => {
    const a = data(new Date(2024, 2, 15));
    const b = data(new Date(2024, 2, 16));
    expect(a).not.toEqual(b);
  });

  it("日期缺省时使用当前日期且结果合法", () => {
    const res = computeDaily();
    expect(res.ok).toBe(true);
    if (!res.ok || !res.data) throw new Error(res.error ?? "未知错误");
    expect(res.data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("computeDaily 分数范围", () => {
  it("各分项与总分均在 0-100", () => {
    for (let m = 0; m < 12; m++) {
      const r = data(new Date(2024, m, 1 + (m % 27)));
      for (const key of ["overall", "career", "wealth", "love", "health"] as const) {
        expect(r.scores[key]).toBeGreaterThanOrEqual(0);
        expect(r.scores[key]).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe("computeDaily 生肖映射", () => {
  it("2024 年为龙", () => {
    expect(data(new Date(2024, 0, 1)).zodiac).toBe("龙");
  });

  it("2024-2035 逐年对应 龙蛇马羊猴鸡狗猪鼠牛虎兔", () => {
    const expected = ["龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪", "鼠", "牛", "虎", "兔"];
    expected.forEach((zodiac, i) => {
      expect(data(new Date(2024 + i, 0, 1)).zodiac).toBe(zodiac);
    });
  });
});

describe("computeDaily 内容完整性", () => {
  it("宜/忌数组非空且取自生肖池", () => {
    for (let i = 0; i < 30; i++) {
      const r = data(new Date(2023 + (i % 12), 0, 1 + i));
      expect(r.yi.length).toBeGreaterThan(0);
      expect(r.ji.length).toBeGreaterThan(0);
      const pool = DAILY_POOL[r.zodiac as ZodiacName];
      for (const item of r.yi) expect(pool.yi).toContain(item);
      for (const item of r.ji) expect(pool.ji).toContain(item);
    }
  });

  it("幸运数字在 1-99", () => {
    for (let i = 0; i < 30; i++) {
      const r = data(new Date(2024, 0, 1 + i));
      expect(r.luckyNumber).toBeGreaterThanOrEqual(1);
      expect(r.luckyNumber).toBeLessThanOrEqual(99);
    }
  });
});

describe("内容库数据规范", () => {
  it("每个生肖 advice≥3、宜/忌各≥5、幸运色 2-3 个、方向 2 个", () => {
    for (const name of ZODIAC_NAMES) {
      const p = DAILY_POOL[name];
      expect(p.advice.length).toBeGreaterThanOrEqual(3);
      expect(p.yi.length).toBeGreaterThanOrEqual(5);
      expect(p.ji.length).toBeGreaterThanOrEqual(5);
      expect(p.luckyColors.length).toBeGreaterThanOrEqual(2);
      expect(p.luckyColors.length).toBeLessThanOrEqual(3);
      expect(p.luckyDirections.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("computeDaily 随机源注入", () => {
  it("传入 rng 与不传均正常返回，不抛错", () => {
    const withRng = computeDaily(new Date(2024, 0, 1), () => 0.5);
    const without = computeDaily(new Date(2024, 0, 1));
    expect(withRng.ok).toBe(true);
    expect(without.ok).toBe(true);
    expect(withRng.data?.luckyNumber).toBeGreaterThanOrEqual(1);
    expect(withRng.data?.luckyNumber).toBeLessThanOrEqual(99);
  });
});

describe("computeDaily 参数校验", () => {
  it("非法日期返回 ok:false 且带中文错误", () => {
    const res = computeDaily(new Date("not-a-date"));
    expect(res.ok).toBe(false);
    expect(res.error).toBeTruthy();
    expect(res.data).toBeUndefined();
  });
});
