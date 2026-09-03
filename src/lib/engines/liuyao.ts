// ============================================================
// 六爻起卦引擎：铜钱摇卦（六爻）+ 动爻变卦 + 综合解读
// 纯函数实现，随机源可注入（测试用固定 rng 断言确定性）
// 传统铜钱：正面(阳)=3，反面(阴)=2；三枚之和 6/7/8/9
//   6=老阴(动,阴) 7=少阳(静,阳) 8=少阴(静,阴) 9=老阳(动,阳)
// ============================================================
import type {
  EngineResult,
  LiuyaoGua,
  LiuyaoLine,
  LiuyaoLineValue,
  LiuyaoResult,
  LiuyaoTrigram,
  Rng,
} from "./types";
import { TRIGRAMS, getHexagram } from "../data/liuyao";

/** 爻位名称（初爻→上爻） */
const POSITION_NAMES = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"] as const;

/** 单爻是否为动（老阴 6 / 老阳 9） */
function isMoving(value: LiuyaoLineValue): boolean {
  return value === 6 || value === 9;
}

/** 单爻阴阳：7/9 为阳，6/8 为阴 */
function yinYangOf(value: LiuyaoLineValue): "yang" | "yin" {
  return value === 7 || value === 9 ? "yang" : "yin";
}

/** 三爻二进制串（初爻→上爻，1=阳 0=阴）→ 单卦 */
function trigramOf(pattern: string): LiuyaoTrigram {
  const t = TRIGRAMS[pattern];
  if (!t) throw new Error(`未知三爻卦：${pattern}`);
  return t;
}

/** 由某区间的爻（1 阳 / 0 阴）构造三爻二进制串 */
function patternFrom(lines: number[]): string {
  return lines.map((v) => (v === 1 ? "1" : "0")).join("");
}

/** 从六爻阴阳取第 i 爻的二进制（初爻=index 0 → 上爻=5） */
function bitOf(lines: LiuyaoLine[], index: number): number {
  return lines[index].yinYang === "yang" ? 1 : 0;
}

/** 铜钱抛三次，返回和值 6/7/8/9 */
function tossLine(r: Rng): LiuyaoLineValue {
  let sum = 0;
  for (let c = 0; c < 3; c++) {
    // 正面=3，反面=2
    sum += r() < 0.5 ? 3 : 2;
  }
  return sum as LiuyaoLineValue;
}

/** 综合解读：结合本卦、动爻、变卦生成 3-4 句 */
function buildSummary(ben: LiuyaoGua, moving: number[], bian?: LiuyaoGua): string {
  const parts: string[] = [];
  parts.push(`本卦得「${ben.name}」，${ben.guaci}`);

  if (moving.length === 0) {
    parts.push("六爻安定，无明显变数，所求之事大体循本卦之势而行。");
    parts.push(`事业上${ben.career}；感情方面，${ben.love}。`);
    parts.push("以上解读仅供娱乐参考，最终仍取决于你的选择与行动。");
    return parts.join("");
  }

  const posText = moving.map((p) => POSITION_NAMES[p - 1]).join("、");
  parts.push(`动爻在${posText}，${moving.length >= 3 ? "变数较多，事态起伏明显" : "事有转机，宜留意变化"}。`);

  if (bian) {
    parts.push(`变化之后得「${bian.name}」，${bian.guaci}`);
    parts.push(`从动爻看：事业上${ben.career}；感情方面，${ben.love}。日后走向可参考变卦之${bian.career}`);
  } else {
    parts.push(`该动爻提示：事业上${ben.career}；感情方面，${ben.love}。`);
  }

  parts.push("以上解读仅供娱乐参考，请以自己的判断为准。");
  return parts.join("");
}

/**
 * 六爻起卦
 * @param question 所问之事（原样回显，超 50 字截断）
 * @param rng 可注入随机源，缺省 Math.random
 */
export function castLiuyao(question?: string, rng?: Rng): EngineResult<LiuyaoResult> {
  const r = rng ?? Math.random;

  // 从下（初爻）到上（上爻）依次摇六爻
  const lines: LiuyaoLine[] = [];
  for (let i = 0; i < 6; i++) {
    const value = tossLine(r);
    lines.push({ value, yinYang: yinYangOf(value), moving: isMoving(value) });
  }

  // 下卦 = 初爻/二爻/三爻（index 0-2），上卦 = 四爻/五爻/上爻（index 3-5）
  const lower = trigramOf(patternFrom([bitOf(lines, 0), bitOf(lines, 1), bitOf(lines, 2)]));
  const upper = trigramOf(patternFrom([bitOf(lines, 3), bitOf(lines, 4), bitOf(lines, 5)]));

  const ben = getHexagram(upper.name, lower.name);

  // 动爻位置（初爻为 1）
  const movingPositions: number[] = [];
  lines.forEach((l, i) => {
    if (l.moving) movingPositions.push(i + 1);
  });

  // 变卦：动爻翻转（6 老阴→阳，9 老阳→阴）
  let bianGua: LiuyaoGua | undefined;
  if (movingPositions.length > 0) {
    const flipped = lines.map((l) => {
      if (!l.moving) return l.yinYang === "yang" ? 1 : 0;
      return l.yinYang === "yang" ? 0 : 1;
    });
    const bLower = trigramOf(patternFrom([flipped[0], flipped[1], flipped[2]]));
    const bUpper = trigramOf(patternFrom([flipped[3], flipped[4], flipped[5]]));
    bianGua = getHexagram(bUpper.name, bLower.name);
  }

  const normalized = question === undefined || question === null
    ? undefined
    : (() => {
        const s = String(question);
        return s.length > 50 ? s.slice(0, 50) : s;
      })();

  return {
    ok: true,
    data: {
      lines,
      lower,
      upper,
      benGua: ben,
      bianGua,
      movingPositions,
      summary: buildSummary(ben, movingPositions, bianGua),
      question: normalized,
      castAt: new Date().toISOString(),
    },
  };
}
