// ============================================================
// 姓名测试（五格剖象）引擎测试
// ============================================================

import { describe, it, expect } from "vitest";
import { computeName } from "../src/lib/engines/name";
import { STROKES } from "../src/lib/data/strokes";

const FORTUNES = ["大吉", "吉", "中吉", "小凶", "凶"] as const;

describe("computeName 输入校验", () => {
  it("空串返回 ok:false", () => {
    expect(computeName("").ok).toBe(false);
    expect(computeName("   ").ok).toBe(false);
  });

  it("非中文返回 ok:false", () => {
    expect(computeName("Zhang").ok).toBe(false);
    expect(computeName("张a").ok).toBe(false);
    expect(computeName("张 三").ok).toBe(false);
  });

  it("长度超出 2-3 返回 ok:false", () => {
    expect(computeName("李小明刚").ok).toBe(false);
    expect(computeName("张").ok).toBe(false);
  });

  it("校验失败时返回中文错误信息", () => {
    const res = computeName("123");
    expect(res.ok).toBe(false);
    expect(typeof res.error).toBe("string");
    expect(res.error!.length).toBeGreaterThan(0);
  });
});

describe("computeName 五格计算", () => {
  it("张三：五格数值正确（张7 + 三3）", () => {
    const res = computeName("张三");
    expect(res.ok).toBe(true);
    if (!res.ok || !res.data) return;

    expect(res.data.strokes).toEqual([7, 3]);
    expect(res.data.wuge.tian).toBe(8); // 7 + 1
    expect(res.data.wuge.ren).toBe(10); // 7 + 3
    expect(res.data.wuge.di).toBe(4); // 单名：3 + 1
    expect(res.data.wuge.wai).toBe(2); // 单姓单名惯例
    expect(res.data.wuge.zong).toBe(10); // 7 + 3
  });

  it("三字名：地格为名两字笔画和，外格为总格-人格+1", () => {
    // 王(4) 小(3) 明(8) → 总格 15，人格 7，地格 11，外格 = 15-7+1 = 9
    const res = computeName("王小明");
    expect(res.ok).toBe(true);
    if (!res.ok || !res.data) return;

    expect(res.data.strokes).toEqual([4, 3, 8]);
    expect(res.data.wuge.di).toBe(11);
    expect(res.data.wuge.wai).toBe(9);
    expect(res.data.wuge.zong).toBe(15);
  });

  it("未知字兜底为 15 画且正常参与计算", () => {
    // 张(7) + 未知字(15) → 天格 8、人格 22、地格 16、外格 2、总格 22
    const res = computeName("张龘");
    expect(res.ok).toBe(true);
    if (!res.ok || !res.data) return;

    expect(res.data.strokes).toEqual([7, 15]);
    expect(res.data.wuge.ren).toBe(22);
    expect(res.data.wuge.zong).toBe(22);
  });
});

describe("computeName 吉凶与三才", () => {
  it("fortune 属于合法枚举，score 在 0-100 范围", () => {
    const names = ["张三", "王小明", "李华", "赵一鸣", "陈梦洁", "刘子涵"];
    for (const n of names) {
      const res = computeName(n);
      expect(res.ok).toBe(true);
      if (!res.ok || !res.data) continue;

      expect(FORTUNES).toContain(res.data.fortune);
      expect(res.data.score).toBeGreaterThanOrEqual(0);
      expect(res.data.score).toBeLessThanOrEqual(100);
    }
  });

  it("三才为天/人/地五行组合，格式为三字", () => {
    const res = computeName("李华");
    expect(res.ok).toBe(true);
    if (!res.ok || !res.data) return;

    expect(res.data.sanCai).toHaveLength(3);
    expect(res.data.sanCaiComment.length).toBeGreaterThan(0);
  });

  it("文案字段非空且含中文", () => {
    const res = computeName("刘子涵");
    expect(res.ok).toBe(true);
    if (!res.ok || !res.data) return;

    for (const field of ["career", "love", "health"] as const) {
      expect(res.data[field].length).toBeGreaterThan(0);
      expect(res.data[field]).toMatch(/[\u4e00-\u9fff]/);
    }
  });
});

describe("computeName 确定性", () => {
  it("同一名字两次计算结果完全一致", () => {
    const a = computeName("陈梦洁");
    const b = computeName("陈梦洁");
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe("STROKES 数据", () => {
  it("收录 300+ 常用汉字", () => {
    expect(Object.keys(STROKES).length).toBeGreaterThanOrEqual(300);
  });

  it("关键测试字笔画正确", () => {
    expect(STROKES["张"]).toBe(7);
    expect(STROKES["三"]).toBe(3);
    expect(STROKES["王"]).toBe(4);
    expect(STROKES["小"]).toBe(3);
    expect(STROKES["明"]).toBe(8);
  });
});
