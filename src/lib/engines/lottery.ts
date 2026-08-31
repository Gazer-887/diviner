// ============================================================
// 抽签引擎：从 40 支签中随机抽取一支
// 纯函数实现，随机源可注入（测试用固定 rng 断言确定性）
// ============================================================
import type { EngineResult, LotteryResult, Rng } from "./types";
import { LOTTERY_STICKS } from "../data/lottery";

/** 问题原样回显，超过 50 字截断；null/undefined 均视为未提问 */
function normalizeQuestion(question?: string | null): string | undefined {
  if (question === undefined || question === null) return undefined;
  const s = String(question);
  return s.length > 50 ? s.slice(0, 50) : s;
}

/**
 * 抽签
 * @param question 所问之事（原样回显，超过 50 字截断）
 * @param rng 可注入随机源，缺省 Math.random
 */
export function drawLottery(question?: string, rng?: Rng): EngineResult<LotteryResult> {
  const r = rng ?? Math.random;
  // clamp 防止注入 rng 返回 1 时越界
  const idx = Math.min(Math.floor(r() * LOTTERY_STICKS.length), LOTTERY_STICKS.length - 1);
  const stick = LOTTERY_STICKS[idx];

  return {
    ok: true,
    data: {
      stick,
      question: normalizeQuestion(question),
      drawnAt: new Date().toISOString(),
    },
  };
}
