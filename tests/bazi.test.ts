// ============================================================
// 生辰八字引擎测试
// 覆盖：正常返回与四柱格式、五行计数、非法输入、输出确定性
// ============================================================
import { describe, it, expect } from "vitest";
import { computeBazi } from "../src/lib/engines/bazi";

/** 构造合法输入的便捷方法 */
function makeInput(overrides: Partial<Parameters<typeof computeBazi>[0]> = {}) {
  return {
    year: 1990,
    month: 5,
    day: 15,
    hour: 10,
    gender: "male" as const,
    ...overrides,
  };
}

describe("computeBazi", () => {
  it("已知日期正常返回，且四柱干支格式为单个汉字", () => {
    const result = computeBazi(makeInput());
    expect(result.ok).toBe(true);
    if (!result.ok || !result.data) return;

    const { pillars } = result.data;
    const stems = ["year", "month", "day", "hour"] as const;
    for (const key of stems) {
      expect(pillars[key].stem).toMatch(/^[甲乙丙丁戊己庚辛壬癸]$/);
      expect(pillars[key].branch).toMatch(/^[子丑寅卯辰巳午未申酉戌亥]$/);
      expect(pillars[key].full).toBe(pillars[key].stem + pillars[key].branch);
    }
    // 1990-05-15 10 时：年柱为庚午（与库已知输出一致）
    expect(pillars.year.full).toBe("庚午");
    expect(result.data.dayMaster).toMatch(/^[甲乙丙丁戊己庚辛壬癸]$/);
    expect(result.data.zodiac).toBe("马");
  });

  it("五行计数总和为 8，且缺失五行与计数为 0 一致", () => {
    const result = computeBazi(makeInput());
    expect(result.ok).toBe(true);
    if (!result.ok || !result.data) return;

    const { fiveElements, missing } = result.data;
    const total =
      fiveElements.wood +
      fiveElements.fire +
      fiveElements.earth +
      fiveElements.metal +
      fiveElements.water;
    expect(total).toBe(8);

    const labelToKey: Record<string, keyof typeof fiveElements> = {
      木: "wood",
      火: "fire",
      土: "earth",
      金: "metal",
      水: "water",
    };
    for (const name of missing) {
      expect(fiveElements[labelToKey[name]]).toBe(0);
    }
  });

  it("非法输入返回 ok:false 且带中文错误信息", () => {
    const cases: Array<Partial<Parameters<typeof computeBazi>[0]>> = [
      { year: 1899 },
      { year: 2101 },
      { month: 0 },
      { month: 13 },
      { day: 0 },
      { day: 32 },
      { hour: -1 },
      { hour: 24 },
      { gender: "other" as never },
      // 真实日期不存在的边界情况
      { year: 2021, month: 2, day: 30 },
      { year: 2023, month: 4, day: 31 },
    ];
    for (const overrides of cases) {
      const result = computeBazi(makeInput(overrides));
      expect(result.ok).toBe(false);
      expect(typeof result.error).toBe("string");
      expect(result.error!.length).toBeGreaterThan(0);
      expect(result.data).toBeUndefined();
    }
  });

  it("边界合法输入仍能正常计算（不抛异常）", () => {
    const validCases: Array<Partial<Parameters<typeof computeBazi>[0]>> = [
      { year: 1900, month: 1, day: 1, hour: 0 },
      { year: 2100, month: 12, day: 31, hour: 23 },
      { year: 2024, month: 2, day: 29, hour: 12 }, // 闰日
      { year: 2020, month: 4, day: 30, hour: 5 },
    ];
    for (const overrides of validCases) {
      const result = computeBazi(makeInput(overrides));
      expect(result.ok).toBe(true);
    }
  });

  it("同一输入两次调用结果完全一致（文案不含随机）", () => {
    const input = makeInput({ year: 2000, month: 1, day: 1, hour: 13, gender: "female" });
    const first = computeBazi(input);
    const second = computeBazi(input);
    expect(first).toEqual(second);
    // 文案均非空
    if (first.ok && first.data) {
      expect(first.data.personality.length).toBeGreaterThan(10);
      expect(first.data.careerHint.length).toBeGreaterThan(10);
      expect(first.data.loveHint.length).toBeGreaterThan(10);
      expect(first.data.yearHint.length).toBeGreaterThan(10);
    }
  });
});
