// ============================================================
// 塔罗占卜引擎：洗牌、抽牌、正逆位判定与综合解读
// 纯函数实现，随机源可注入（测试用固定 rng 断言确定性）
// ============================================================
import type {
  EngineResult,
  Rng,
  TarotCard,
  TarotDraw,
  TarotQuestionType,
  TarotResult,
  TarotSpread,
} from "./types";
import { TAROT_CARDS } from "../data/tarot";

const QUESTION_TYPES: readonly TarotQuestionType[] = ["career", "love", "study", "general"];
const SPREADS: readonly TarotSpread[] = ["one", "three"];
const POSITIONS: readonly string[] = ["过去", "现在", "未来"];

/** 各问题类型的主题词库，用于生成综合解读 */
const THEMES: Record<
  TarotQuestionType,
  { subject: string; focus: readonly string[]; tips: readonly string[] }
> = {
  career: {
    subject: "事业",
    focus: ["职场动向", "合作机会", "发展空间", "行动节奏"],
    tips: ["多做观察，少急于求成", "主动沟通，比埋头苦干更见效", "审慎评估，再决定下一步"],
  },
  love: {
    subject: "感情",
    focus: ["相处模式", "情感温度", "沟通方式", "关系走向"],
    tips: ["给彼此留些空间", "坦诚表达，胜过暗自猜测", "放慢脚步，让心意沉淀"],
  },
  study: {
    subject: "学业",
    focus: ["学习状态", "方法效率", "复习节奏", "心态调整"],
    tips: ["稳扎稳打，重视基础", "劳逸结合，保持专注", "查漏补缺，及时复盘"],
  },
  general: {
    subject: "近期运势",
    focus: ["整体状态", "心态起伏", "关键节点", "生活节奏"],
    tips: ["顺其自然，不必强求", "留意细节，会有惊喜", "保持平常心，静观其变"],
  },
};

/** Fisher-Yates 洗牌；随机源缺省为 Math.random */
function shuffle(cards: readonly TarotCard[], rng?: Rng): TarotCard[] {
  const r = rng ?? Math.random;
  const arr = [...cards];
  for (let i = arr.length - 1; i > 0; i--) {
    // clamp 防止注入 rng 返回 1 时 j 越界
    const j = Math.min(Math.floor(r() * (i + 1)), i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 取一张牌的正/逆位关键词 */
function keywordsOf(draw: TarotDraw): string[] {
  return draw.reversed ? draw.card.reversed : draw.card.upright;
}

/** 结合问题类型与所抽牌生成 3-4 句综合解读 */
function buildSummary(questionType: TarotQuestionType, draws: TarotDraw[]): string {
  const t = THEMES[questionType];
  const sentences: string[] = [];

  if (draws.length === 1) {
    const d = draws[0];
    const kws = keywordsOf(d);
    const ori = d.reversed ? "逆位" : "正位";
    sentences.push(`以${t.subject}为着眼点，你抽到「${d.card.name}」（${ori}），核心能量围绕「${kws[0]}」。`);
    sentences.push(
      `${d.reversed ? "逆位的提醒是" : "正位带来的提示是"}：${kws.slice(1).join("、")}等状态可能浮现，${t.focus[0]}值得多留意。`
    );
    sentences.push(`${t.tips[d.card.number % t.tips.length]}。`);
    sentences.push("以上解读仅供娱乐参考，最终仍取决于你的选择与行动。");
    return sentences.join("");
  }

  const kws = draws.map((d) => keywordsOf(d));
  const ori = draws.map((d) => (d.reversed ? "逆位" : "正位"));
  sentences.push(`以${t.subject}为题的三张牌阵已经展开：「${draws[0].card.name}」「${draws[1].card.name}」「${draws[2].card.name}」。`);
  sentences.push(`过去的情形偏向「${kws[0][0]}」${ori[0]}，${t.focus[0]}在你身上留下了印记。`);
  sentences.push(`当下的关键是「${kws[1][0]}」${ori[1]}，${t.focus[1]}是需要面对的核心。`);
  sentences.push(`未来的走向围绕「${kws[2][0]}」${ori[2]}，${t.tips[draws[2].card.number % t.tips.length]}；以上解读仅供娱乐参考，请以自己的判断为准。`);
  return sentences.join("");
}

/**
 * 塔罗抽牌
 * @param questionType 问题类型 career/love/study/general
 * @param spread 牌阵 one（1 张）/ three（过去·现在·未来各 1 张）
 * @param rng 可注入随机源，缺省 Math.random
 */
export function drawTarot(
  questionType: TarotQuestionType,
  spread: TarotSpread,
  rng?: Rng
): EngineResult<TarotResult> {
  if (!QUESTION_TYPES.includes(questionType)) {
    return { ok: false, error: "不支持的塔罗问题类型，可选值：career/love/study/general" };
  }
  if (!SPREADS.includes(spread)) {
    return { ok: false, error: "不支持的牌阵类型，可选值：one/three" };
  }

  const r = rng ?? Math.random;
  const deck = shuffle(TAROT_CARDS, r);
  const count = spread === "one" ? 1 : 3;

  const draws: TarotDraw[] = [];
  for (let i = 0; i < count; i++) {
    draws.push({
      card: deck[i],
      // rng() < 0.5 判定为逆位
      reversed: r() < 0.5,
      position: spread === "three" ? POSITIONS[i] : undefined,
    });
  }

  return {
    ok: true,
    data: {
      questionType,
      spread,
      draws,
      summary: buildSummary(questionType, draws),
    },
  };
}
