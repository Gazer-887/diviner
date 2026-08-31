// ============================================================
// 每日运势引擎：以日期为种子，确定性生成当日生肖运势
// 纯函数实现，同日同生肖结果恒定；rng 仅用于幸运数字随机源注入
// ============================================================

import type { DailyResult, DailyScore, EngineResult, Rng } from "./types";
import { DAILY_POOL, ZODIAC_NAMES } from "../data/daily";

/** FNV-1a 字符串哈希，返回 32 位无符号整数 */
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** 基于种子的确定性伪随机序列（LCG），同一种子产出同一序列 */
function createSequence(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
}

/** 用序列做确定性洗牌，取前 count 项（不修改原数组） */
function pick<T>(items: readonly T[], rand: () => number, count: number): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    // rand 返回 32 位整数，取模保证索引在 0..i 内
    const j = rand() % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr.slice(0, count);
}

/** 本地时区格式化为 YYYY-MM-DD（补零） */
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 限制幸运数字在 1-99 */
function clampLucky(n: number): number {
  return Math.min(99, Math.max(1, Math.floor(n)));
}

/**
 * 生成某日某生肖的每日运势。
 * @param date 日期，缺省为当前日期；非法 Date 返回 ok:false
 * @param rng 可选随机源，注入时仅影响幸运数字，便于测试与生产接入
 */
export function computeDaily(date?: Date, rng?: Rng): EngineResult<DailyResult> {
  const d = date ?? new Date();
  if (Number.isNaN(d.getTime())) {
    return { ok: false, error: "日期无效：请提供合法的 Date 对象" };
  }

  const dateStr = formatDate(d);
  // 年份 % 12 映射生肖：0=猴 … 11=羊（取模后加 12 再取模，兼容边界）
  const zodiacIndex = ((d.getFullYear() % 12) + 12) % 12;
  const zodiac = ZODIAC_NAMES[zodiacIndex];
  const pool = DAILY_POOL[zodiac];

  // 以日期字符串为种子，保证同日同生肖结果恒定
  const seed = fnv1a(`${dateStr}:${zodiac}`);
  const rand = createSequence(seed);

  // 分项分数 0-100，overall 为加权（事业/财富 各 3 成，爱情/健康 各 2 成）
  const career = rand() % 101;
  const wealth = rand() % 101;
  const love = rand() % 101;
  const health = rand() % 101;
  const scores: DailyScore = {
    career,
    wealth,
    love,
    health,
    overall: Math.round(career * 0.3 + wealth * 0.3 + love * 0.2 + health * 0.2),
  };

  // 文案与宜忌均从生肖池中按种子确定选取
  const advice = pool.advice[rand() % pool.advice.length];
  const luckyColor = pool.luckyColors[rand() % pool.luckyColors.length];
  const luckyDirection = pool.luckyDirections[rand() % pool.luckyDirections.length];
  const yi = pick(pool.yi, rand, 3);
  const ji = pick(pool.ji, rand, 3);

  // 幸运数字：注入 rng 时由随机源决定，否则由种子推导；均限制在 1-99
  const luckyNumber = rng ? clampLucky(1 + rng() * 99) : clampLucky((rand() % 99) + 1);

  return {
    ok: true,
    data: {
      date: dateStr,
      zodiac,
      scores,
      luckyColor,
      luckyNumber,
      luckyDirection,
      yi,
      ji,
      advice,
    },
  };
}
