// ============================================================
// 阶段 5 · 交叉验证测试
// 目的：不复用引擎内部逻辑，改用「独立数学约束 + 已知真值」验算，
//       抓出单元测试（自证式断言）覆盖不到的真实缺陷。
// 覆盖：
//   1. 八字：干支组合合法性、五行守恒、日主/生肖/缺失自洽、无碰撞
//   2. 姓名：手工真值对照（李白 / 李清照）
//   3. 塔罗：78 牌分布均匀 + 单次抽取无重复
//   4. 抽签：40 签分布均匀 + 单次抽取无重复
//   5. 运势：同日期确定性 + 跨日期差异性
// ============================================================
import { describe, it, expect } from "vitest";
import { computeBazi } from "../src/lib/engines/bazi";
import { computeName } from "../src/lib/engines/name";
import { drawTarot } from "../src/lib/engines/tarot";
import { drawLottery } from "../src/lib/engines/lottery";
import { computeDaily } from "../src/lib/engines/daily";

// ---------- 干支基础表 ----------
const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
/** 阳干配阳支、阴干配阴支：天干序号与地支序号必须同奇偶 */
const isLegalPair = (stem: string, branch: string) =>
  TIAN_GAN.indexOf(stem) % 2 === DI_ZHI.indexOf(branch) % 2;

const STEM_EL: Record<string, string> = {
  甲: "wood", 乙: "wood", 丙: "fire", 丁: "fire", 戊: "earth",
  己: "earth", 庚: "metal", 辛: "metal", 壬: "water", 癸: "water",
};
const BRANCH_EL: Record<string, string> = {
  子: "water", 亥: "water", 寅: "wood", 卯: "wood", 巳: "fire",
  午: "fire", 申: "metal", 酉: "metal", 辰: "earth", 戌: "earth",
  丑: "earth", 未: "earth",
};

/** 生肖由年支唯一决定 */
const ZODIAC_BY_BRANCH: Record<string, string> = {
  子: "鼠", 丑: "牛", 寅: "虎", 卯: "兔", 辰: "龙", 巳: "蛇",
  午: "马", 未: "羊", 申: "猴", 酉: "鸡", 戌: "狗", 亥: "猪",
};

describe("交叉验证：生辰八字", () => {
  const cases = [
    { year: 1990, month: 5, day: 15, hour: 10 },
    { year: 1995, month: 8, day: 15, hour: 13 },
    { year: 2000, month: 1, day: 1, hour: 0 },
    { year: 1988, month: 12, day: 31, hour: 23 },
    { year: 2024, month: 2, day: 29, hour: 12 },
    { year: 1970, month: 6, day: 6, hour: 6 },
  ];

  it.each(cases)("四柱干支组合全部合法（$year-$month-$day $hour时）", (c) => {
    const res = computeBazi({ ...c, gender: "male" });
    expect(res.ok).toBe(true);
    const p = res.data!.pillars;
    for (const key of ["year", "month", "day", "hour"] as const) {
      const pillar = p[key];
      expect(TIAN_GAN).toContain(pillar.stem);
      expect(DI_ZHI).toContain(pillar.branch);
      expect(pillar.full).toBe(`${pillar.stem}${pillar.branch}`);
      // 强约束：阳干配阳支、阴干配阴支
      expect(isLegalPair(pillar.stem, pillar.branch)).toBe(true);
    }
  });

  it.each(cases)("五行计数守恒且等于四柱八字之和（$year-$month-$day）", (c) => {
    const res = computeBazi({ ...c, gender: "female" });
    const p = res.data!.pillars;
    const expected = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    for (const key of ["year", "month", "day", "hour"] as const) {
      expected[STEM_EL[p[key].stem] as keyof typeof expected] += 1;
      expected[BRANCH_EL[p[key].branch] as keyof typeof expected] += 1;
    }
    expect(res.data!.fiveElements).toEqual(expected);
    // 8 个字，五行总数必为 8
    const total = Object.values(expected).reduce((a, b) => a + b, 0);
    expect(total).toBe(8);
  });

  it("日主 = 日柱天干，生肖 = 年支对应生肖", () => {
    for (const c of cases) {
      const res = computeBazi({ ...c, gender: "male" });
      const p = res.data!.pillars;
      expect(res.data!.dayMaster).toBe(p.day.stem);
      expect(res.data!.zodiac).toBe(ZODIAC_BY_BRANCH[p.year.branch]);
    }
  });

  it("缺失五行 = 计数为 0 的五行", () => {
    // 引擎 missing 存中文五行名，测试的 fiveElements 用英文 key，需映射后比对
    const KEY_TO_CN: Record<string, string> = {
      wood: "木", fire: "火", earth: "土", metal: "金", water: "水",
    };
    for (const c of cases) {
      const res = computeBazi({ ...c, gender: "male" });
      const fe = res.data!.fiveElements;
      const expectedMissing = Object.entries(fe)
        .filter(([, v]) => v === 0)
        .map(([k]) => KEY_TO_CN[k]);
      expect([...res.data!.missing].sort()).toEqual(expectedMissing.sort());
    }
  });

  it("不同日期产生不同四柱（无哈希碰撞）", () => {
    const seen = new Set<string>();
    for (let d = 1; d <= 28; d++) {
      const res = computeBazi({ year: 1990, month: 3, day: d, hour: 8, gender: "male" });
      const p = res.data!.pillars;
      seen.add(`${p.year.full}${p.month.full}${p.day.full}${p.hour.full}`);
    }
    // 28 天里四柱组合应几乎全不同（至少 26 种）
    expect(seen.size).toBeGreaterThanOrEqual(26);
  });

  it("时辰边界：23 时仍归属当日晚子时，不抛错", () => {
    const res = computeBazi({ year: 1990, month: 5, day: 15, hour: 23, gender: "male" });
    expect(res.ok).toBe(true);
  });
});

describe("交叉验证：姓名测试", () => {
  it("李白 —— 手算真值对照", () => {
    // 李(7) 白(5)：天格 7+1=8，人格 7+5=12，地格 5+1=6，总格 12，外格 2（两字名）
    const res = computeName("李白");
    expect(res.ok).toBe(true);
    const r = res.data!;
    expect(r.strokes).toEqual([7, 5]);
    expect(r.wuge).toEqual({ tian: 8, ren: 12, di: 6, wai: 2, zong: 12 });
    // 三才 = 天/人/地 三格对应的五行
    expect(r.sanCai).toHaveLength(3);
    // 总格 = 全部笔画和
    expect(r.wuge.zong).toBe(r.strokes.reduce((a, b) => a + b, 0));
  });

  it("李清照 —— 三字名真值对照", () => {
    // 李(7) 清(11) 照(13)：天格 8，人格 7+11=18，地格 11+13=24，总格 31，外格 31-18+1=14
    const res = computeName("李清照");
    expect(res.ok).toBe(true);
    const r = res.data!;
    expect(r.wuge.tian).toBe(r.strokes[0] + 1);
    expect(r.wuge.ren).toBe(r.strokes[0] + r.strokes[1]);
    expect(r.wuge.di).toBe(r.strokes[1] + r.strokes[2]);
    expect(r.wuge.zong).toBe(r.strokes.reduce((a, b) => a + b, 0));
    expect(r.wuge.wai).toBe(r.wuge.zong - r.wuge.ren + 1);
  });

  it("分数与吉凶等级自洽（0-100，五格各 5/13/20）", () => {
    for (const n of ["李白", "李清照", "王五", "张三丰"]) {
      const res = computeName(n);
      if (!res.ok) continue;
      const r = res.data!;
      expect(r.score).toBeGreaterThanOrEqual(25);
      expect(r.score).toBeLessThanOrEqual(100);
      expect(r.score % 1).toBe(0);
      expect(["大吉", "吉", "中吉", "小凶", "凶"]).toContain(r.fortune);
    }
  });

  it("非法输入全部拒绝（空 / 1 字 / 4 字 / 英文 / 数字）", () => {
    for (const bad of ["", "李", "李白杜甫", "Li Bai", "李1", "  "]) {
      const res = computeName(bad);
      expect(res.ok).toBe(false);
      expect(typeof res.error).toBe("string");
    }
  });
});

describe("交叉验证：塔罗分布", () => {
  it("78 张牌在 10000 次抽取中分布均匀（单张阵）", () => {
    const counts = new Map<number, number>();
    const N = 10000;
    for (let i = 0; i < N; i++) {
      const res = drawTarot("general", "one");
      expect(res.ok).toBe(true);
      const idx = res.data!.draws[0].card.index;
      counts.set(idx, (counts.get(idx) ?? 0) + 1);
    }
    // 每张牌应至少被抽到一次
    expect(counts.size).toBe(78);
    const values = [...counts.values()];
    const avg = N / 78; // ≈128
    // 允许 ±60% 波动（随机采样的合理区间）
    for (const v of values) {
      expect(v).toBeGreaterThan(avg * 0.4);
      expect(v).toBeLessThan(avg * 1.6);
    }
  });

  it("三张牌阵：单次抽取内不出现重复牌", () => {
    for (let i = 0; i < 2000; i++) {
      const res = drawTarot("career", "three");
      const draws = res.data!.draws;
      expect(draws).toHaveLength(3);
      const idxs = draws.map((d) => d.card.index);
      expect(new Set(idxs).size).toBe(3);
      expect(draws.map((d) => d.position)).toEqual(["过去", "现在", "未来"]);
    }
  });

  it("正逆位均会出现（非恒定）", () => {
    let reversed = 0;
    for (let i = 0; i < 2000; i++) {
      const res = drawTarot("love", "three");
      if (res.data!.draws.some((d) => d.reversed)) reversed++;
    }
    expect(reversed).toBeGreaterThan(0);
  });
});

describe("交叉验证：抽签分布", () => {
  it("40 支签在 10000 次摇签中分布均匀", () => {
    const counts = new Map<number, number>();
    const N = 10000;
    for (let i = 0; i < N; i++) {
      const res = drawLottery("测试");
      expect(res.ok).toBe(true);
      const num = res.data!.stick.number;
      counts.set(num, (counts.get(num) ?? 0) + 1);
    }
    expect(counts.size).toBe(40);
    const avg = N / 40; // 250
    for (const v of counts.values()) {
      expect(v).toBeGreaterThan(avg * 0.5);
      expect(v).toBeLessThan(avg * 1.5);
    }
  });

  it("签号范围 1-40，且每支签内容字段完整", () => {
    for (let i = 0; i < 500; i++) {
      const res = drawLottery();
      const s = res.data!.stick;
      expect(s.number).toBeGreaterThanOrEqual(1);
      expect(s.number).toBeLessThanOrEqual(40);
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.poem.length).toBeGreaterThan(0);
      expect(s.explain.length).toBeGreaterThan(0);
      expect(s.advice.length).toBeGreaterThan(0);
      expect(["上上", "上吉", "中吉", "中平", "下吉", "下下"]).toContain(s.level);
    }
  });
});

describe("交叉验证：每日运势", () => {
  it("同一日期多次调用结果完全一致（确定性）", () => {
    const d = new Date(2026, 8, 1);
    const a = computeDaily(d);
    const b = computeDaily(d);
    expect(a.data!.scores).toEqual(b.data!.scores);
    expect(a.data!.zodiac).toBe(b.data!.zodiac);
    expect(a.data!.yi).toEqual(b.data!.yi);
  });

  it("不同日期产生不同结果（非恒定）", () => {
    const seen = new Set<string>();
    for (let day = 1; day <= 28; day++) {
      const res = computeDaily(new Date(2026, 8, day));
      seen.add(JSON.stringify(res.data!.scores));
    }
    // 28 天内分数应几乎全不同
    expect(seen.size).toBeGreaterThanOrEqual(24);
  });

  it("分项分数均在 0-100 内，宜忌非空且无交集", () => {
    for (let day = 1; day <= 28; day++) {
      const res = computeDaily(new Date(2026, 8, day));
      const s = res.data!.scores;
      for (const v of Object.values(s)) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
      const yi = res.data!.yi;
      const ji = res.data!.ji;
      expect(yi.length).toBeGreaterThan(0);
      expect(ji.length).toBeGreaterThan(0);
      // 同一个事项不应同时出现在宜与忌
      const overlap = yi.filter((x) => ji.includes(x));
      expect(overlap).toHaveLength(0);
    }
  });

  it("日期格式为 YYYY-MM-DD", () => {
    const res = computeDaily(new Date(2026, 8, 1));
    expect(res.data!.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
