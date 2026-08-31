// ============================================================
// 姓名测试（五格剖象）引擎
// 纯函数实现，无副作用；输入 2-3 个汉字，输出五格数理与吉凶分析。
// ============================================================

import type { EngineResult, NameResult } from "./types";
import { STROKES } from "../data/strokes";

// 未收录字的兜底笔画数
const UNKNOWN_STROKE = 15;
const MIN_NAME_LEN = 2;
const MAX_NAME_LEN = 3;

// ---------- 数理吉凶判定（1-81，81 以上减 80 循环） ----------
const GREAT_LUCKY = new Set([
  1, 3, 5, 6, 8, 11, 13, 15, 16, 18, 21, 23, 24, 25, 29, 31, 32, 33,
  35, 37, 39, 41, 45, 47, 48, 52, 57, 61, 63, 65, 67, 68, 81,
]);
const BAD_LUCKY = new Set([
  2, 4, 9, 10, 12, 14, 19, 20, 22, 26, 27, 28, 30, 34, 36, 38, 40,
  42, 43, 44, 46, 49, 50, 51, 53, 54, 56, 58, 59, 60, 62, 64, 66,
  69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
]);

type LuckyLevel = "great" | "mid" | "bad";
type Element = "木" | "火" | "土" | "金" | "水";

/** 81 以上减 80 循环归位到 1-81 */
function normNumber(n: number): number {
  return n > 81 ? ((n - 1) % 80) + 1 : n;
}

function luckyLevel(n: number): LuckyLevel {
  const m = normNumber(n);
  if (GREAT_LUCKY.has(m)) return "great";
  if (BAD_LUCKY.has(m)) return "bad";
  return "mid";
}

/** 数理尾数 → 五行：1,2 木 / 3,4 火 / 5,6 土 / 7,8 金 / 9,0 水 */
function toElement(n: number): Element {
  switch (n % 10) {
    case 1:
    case 2:
      return "木";
    case 3:
    case 4:
      return "火";
    case 5:
    case 6:
      return "土";
    case 7:
    case 8:
      return "金";
    default:
      return "水";
  }
}

/** 是否为汉字（含扩展 A 区，兼容生僻字） */
function isCJK(ch: string): boolean {
  const code = ch.codePointAt(0)!;
  return (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf);
}

// ---------- 三才五行关系 ----------
const SHENG: Record<Element, Element> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const KE: Record<Element, Element> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

type Relation = "生" | "克" | "比和";

/** a 对 b 的五行关系（a 生 b / a 克 b / 比和） */
function relation(a: Element, b: Element): Relation {
  if (a === b) return "比和";
  if (SHENG[a] === b) return "生";
  if (KE[a] === b) return "克";
  return "比和";
}

/** 依据天/人/地三才五行写 1-2 句简评 */
function sanCaiComment(t: Element, r: Element, d: Element): string {
  const up = relation(t, r); // 天 → 人
  const down = relation(r, d); // 人 → 地
  if (up === "生" && down === "生") {
    return `天格${t}生人格${r}，人格${r}生地格${d}，三才流通相生，根基顺遂。`;
  }
  if (up === "克" && down === "克") {
    return `天格${t}克人格${r}，人格${r}克地格${d}，三才相战，遇事宜以稳健为先。`;
  }
  if (up === "比和" && down === "比和") {
    return "三才五行比和，个性稳重，处事踏实有恒。";
  }
  if (up !== down) {
    return `三才${t}${r}${d}，生克相间，运势有起有伏，宜扬长避短、把握分寸。`;
  }
  return `三才${t}${r}${d}，整体配置平和，按部就班努力可成。`;
}

// ---------- 文案模板 ----------
type FortuneLevel = NameResult["fortune"];

function fortuneFromGoodCount(goodCount: number): FortuneLevel {
  if (goodCount >= 4) return "大吉";
  if (goodCount === 3) return "吉";
  if (goodCount === 2) return "中吉";
  if (goodCount === 1) return "小凶";
  return "凶";
}

const CAREER_BASE: Record<FortuneLevel, string[]> = {
  大吉: ["事业运势畅旺，贵人助力明显，宜把握良机。", "人缘与格局俱佳，适合承担更大的责任。"],
  吉: ["事业稳中有升，付出可获相应回报。", "合作关系融洽，利于长远布局与积累。"],
  中吉: ["事业平稳向前，宜脚踏实地用心积累。", "机会需要主动争取，稳步推进为宜。"],
  小凶: ["事业上略有波折，宜稳中求进。", "注意与同事的沟通，避免无谓消耗。"],
  凶: ["事业上阻力较多，宜收敛锋芒、以稳为主。", "多听取他人意见，谨慎决策为佳。"],
};

const LOVE_BASE: Record<FortuneLevel, string[]> = {
  大吉: ["感情运势较佳，真诚相待可让关系更进一步。", "缘分较为顺畅，把握当下的相处时光。"],
  吉: ["感情平稳升温，多些陪伴与倾听更显珍贵。", "真诚的表达会让彼此更加信任。"],
  中吉: ["感情上宜多些耐心，细水长流更能见真情。", "适度主动，避免因沉默产生误会。"],
  小凶: ["感情上易有摩擦，沟通时少些情绪多些体谅。", "给对方留出空间，反而更能增进了解。"],
  凶: ["感情方面需谨慎经营，避免因小事争执伤和气。", "放平心态，顺其自然更为妥当。"],
};

const HEALTH_BASE: Record<FortuneLevel, string[]> = {
  大吉: ["整体健康状况良好，保持规律作息即可。", "精力充沛，适合适度锻炼增强体质。"],
  吉: ["健康状态平稳，注意劳逸结合。", "规律饮食与睡眠能让你保持好状态。"],
  中吉: ["健康大体无碍，留意换季时节的调养。", "避免熬夜与久坐，多活动筋骨。"],
  小凶: ["健康方面需多加留意，切忌过度劳累。", "及时休息、定期体检，防患于未然。"],
  凶: ["健康运偏弱，需重视作息与饮食的调节。", "如有不适及时就医，勿要硬撑。"],
};

const CAREER_ELEMENT: Record<Element, string> = {
  木: "五行属木，利于教育、文化、创意类方向发展。",
  火: "五行属火，适合传媒、科技、能源等热情行业。",
  土: "五行属土，适合地产、管理、服务等稳健行业。",
  金: "五行属金，适合金融、法律、机械等严谨领域。",
  水: "五行属水，适合贸易、物流、旅游等流动行业。",
};

const LOVE_ELEMENT: Record<Element, string> = {
  木: "木性柔和，以温和体贴的方式表达心意更能打动对方。",
  火: "火性热情，主动大方之余也需给彼此留出空间。",
  土: "土性敦厚，稳定可靠的付出最令人安心。",
  金: "金性果决，直率表达之余也要顾及对方感受。",
  水: "水性灵动，浪漫细腻的心思能增添感情趣味。",
};

const HEALTH_ELEMENT: Record<Element, string> = {
  木: "五行属木，留意肝胆疏泄与情绪调节。",
  火: "五行属火，注意心脑血管与睡眠质量。",
  土: "五行属土，关注脾胃功能与饮食规律。",
  金: "五行属金，注意呼吸系统与皮肤保养。",
  水: "五行属水，关注肾脏与泌尿系统的健康。",
};

// ---------- 主函数 ----------
/**
 * 姓名测试（五格剖象）
 * 姓为第 1 字，名为第 2-3 字；仅支持 2-3 个汉字。
 */
export function computeName(name: string): EngineResult<NameResult> {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "姓名不能为空" };
  }
  if (trimmed.length < MIN_NAME_LEN || trimmed.length > MAX_NAME_LEN) {
    return { ok: false, error: "姓名长度需为 2-3 个汉字" };
  }
  if (![...trimmed].every(isCJK)) {
    return { ok: false, error: "姓名只能包含汉字" };
  }

  const chars = [...trimmed];
  const strokes = chars.map((ch) => STROKES[ch] ?? UNKNOWN_STROKE);

  const surname = strokes[0];
  const given = strokes.slice(1);

  // 五格数理
  const tian = surname + 1; // 单姓：姓笔画 + 1
  const ren = surname + given[0]; // 人格：姓末字 + 名首字
  const di = given.length === 2 ? given[0] + given[1] : given[0] + 1; // 地格
  const zong = strokes.reduce((a, b) => a + b, 0); // 总格
  // 外格：总格 - 人格 + 1；单姓单名按惯例取 2
  const wai = chars.length === 2 ? 2 : zong - ren + 1;

  // 数理吉凶综合
  const levels: LuckyLevel[] = [tian, ren, di, wai, zong].map(luckyLevel);
  const goodCount = levels.filter((lv) => lv !== "bad").length;
  const fortune = fortuneFromGoodCount(goodCount);
  // 分数映射：大吉 20 / 中吉 13 / 凶 5，五格合计 0-100
  const score = levels.reduce(
    (s, lv) => s + (lv === "great" ? 20 : lv === "mid" ? 13 : 5),
    0,
  );

  // 三才（天 / 人 / 地）
  const tEl = toElement(tian);
  const rEl = toElement(ren);
  const dEl = toElement(di);

  const result: NameResult = {
    name: trimmed,
    strokes,
    wuge: { tian, ren, di, wai, zong },
    wugeGood: {
      tian: levels[0] !== "bad",
      ren: levels[1] !== "bad",
      di: levels[2] !== "bad",
      wai: levels[3] !== "bad",
      zong: levels[4] !== "bad",
    },
    sanCai: `${tEl}${rEl}${dEl}`,
    sanCaiComment: sanCaiComment(tEl, rEl, dEl),
    fortune,
    score,
    career: `${CAREER_BASE[fortune].join("")}${CAREER_ELEMENT[rEl]}`,
    love: `${LOVE_BASE[fortune].join("")}${LOVE_ELEMENT[rEl]}`,
    health: `${HEALTH_BASE[fortune].join("")}${HEALTH_ELEMENT[rEl]}`,
  };

  return { ok: true, data: result };
}
