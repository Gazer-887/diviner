// ============================================================
// 五套占卜引擎的统一类型与接口约定（子代理实现契约）
// 引擎实现文件：src/lib/engines/{bazi,name,daily,tarot,lottery}.ts
// 内容库文件：src/lib/data/{tarot,lottery,daily}.ts
// 测试文件：tests/{bazi,name,daily,tarot,lottery}.test.ts（相对路径 import）
// ============================================================

// 可注入随机源：测试传固定值断言确定性；生产默认 Math.random
export type Rng = () => number;

// ---------- 生辰八字 ----------
export interface BirthInput {
  /** 公历年 */
  year: number;
  /** 公历月 1-12 */
  month: number;
  /** 公历日 1-31 */
  day: number;
  /** 小时 0-23 */
  hour: number;
  gender: "male" | "female";
}

export interface Pillar {
  /** 天干 */
  stem: string;
  /** 地支 */
  branch: string;
  /** 干支全称，如 甲子 */
  full: string;
}

export interface FiveElementCount {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface BaziResult {
  birth: BirthInput;
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar };
  /** 日主天干 */
  dayMaster: string;
  fiveElements: FiveElementCount;
  /** 缺失五行（数组可为空） */
  missing: string[];
  /** 性格简析 */
  personality: string;
  careerHint: string;
  loveHint: string;
  /** 流年提示（以当前年份为基准） */
  yearHint: string;
  /** 生肖 */
  zodiac: string;
}

// ---------- 姓名测试 ----------
export interface NameResult {
  name: string;
  /** 各字笔画（不含姓的分割信息由实现内部处理） */
  strokes: number[];
  wuge: { tian: number; ren: number; di: number; wai: number; zong: number };
  wugeGood: { tian: boolean; ren: boolean; di: boolean; wai: boolean; zong: boolean };
  /** 三才配置，如 木火土 */
  sanCai: string;
  sanCaiComment: string;
  fortune: "大吉" | "吉" | "中吉" | "小凶" | "凶";
  /** 0-100 */
  score: number;
  career: string;
  love: string;
  health: string;
}

// ---------- 每日运势 ----------
export interface DailyScore {
  overall: number;
  career: number;
  wealth: number;
  love: number;
  health: number;
}

export interface DailyResult {
  /** YYYY-MM-DD */
  date: string;
  /** 生肖 */
  zodiac: string;
  scores: DailyScore;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  /** 宜 */
  yi: string[];
  /** 忌 */
  ji: string[];
  advice: string;
}

// ---------- 塔罗 ----------
export type TarotQuestionType = "career" | "love" | "study" | "general";
export type TarotSpread = "one" | "three";

export interface TarotCard {
  /** 0-77 全局序号 */
  index: number;
  name: string;
  arcana: "major" | "minor";
  /** 小阿卡纳花色；大阿卡纳为 undefined */
  suit?: "wands" | "cups" | "swords" | "pentacles";
  /** 大阿卡纳 0-21；小阿卡纳 1-14 */
  number: number;
  /** 正位关键词（3-5 个） */
  upright: string[];
  /** 逆位关键词（3-5 个） */
  reversed: string[];
}

export interface TarotDraw {
  card: TarotCard;
  reversed: boolean;
  /** three 牌阵的位名：过去/现在/未来 */
  position?: string;
}

export interface TarotResult {
  questionType: TarotQuestionType;
  spread: TarotSpread;
  draws: TarotDraw[];
  /** 结合问题类型的综合解读 */
  summary: string;
}

// ---------- 抽签 ----------
export interface LotteryStick {
  /** 签号 1-40 */
  number: number;
  name: string;
  level: "上上" | "上吉" | "中吉" | "中平" | "下吉" | "下下";
  poem: string;
  explain: string;
  advice: string;
}

export interface LotteryResult {
  stick: LotteryStick;
  question?: string;
  /** ISO 时间 */
  drawnAt: string;
}

// ---------- 六爻八卦 ----------
/** 单爻状态（铜钱摇卦结果，3 枚铜钱之和） */
export type LiuyaoLineValue = 6 | 7 | 8 | 9;
/** 6=老阴(动) 7=少阳(静) 8=少阴(静) 9=老阳(动) */

export interface LiuyaoLine {
  /** 本爻原始值 6/7/8/9 */
  value: LiuyaoLineValue;
  /** 本爻阴阳：7/9 为阳（—），6/8 为阴（--） */
  yinYang: "yang" | "yin";
  /** 是否动爻（老阴 6 / 老阳 9 为动） */
  moving: boolean;
}

/** 单卦（三爻为一下卦/上卦） */
export interface LiuyaoTrigram {
  /** 卦名：乾/兑/离/震/巽/坎/艮/坤 */
  name: string;
  /** 符号：☰☱☲☳☴☵☶☷ */
  symbol: string;
  /** 自然象：天/泽/火/雷/风/水/山/地 */
  nature: string;
}

export interface LiuyaoResult {
  /** 本卦（六爻：初爻→上爻） */
  lines: LiuyaoLine[];
  /** 下卦（内卦）与上卦（外卦） */
  lower: LiuyaoTrigram;
  upper: LiuyaoTrigram;
  /** 本卦信息（卦名/卦辞/吉凶/断语） */
  benGua: LiuyaoGua;
  /** 变卦信息；无动爻时为空 */
  bianGua?: LiuyaoGua;
  /** 动爻所在爻位（1-6，初爻为 1）；无动爻时为空 */
  movingPositions: number[];
  /** 综合解读 */
  summary: string;
  /** 所问之事（原样回显） */
  question?: string;
  /** ISO 时间 */
  castAt: string;
}

export interface LiuyaoGua {
  /** 卦名：如 乾为天 / 火水未济 */
  name: string;
  /** 卦序（1-64，先天卦序） */
  order: number;
  /** 吉凶等级 */
  level: "大吉" | "吉" | "中平" | "小凶" | "凶";
  /** 卦辞（白话，1-2 句） */
  guaci: string;
  /** 断语：事业 */
  career: string;
  /** 断语：感情 */
  love: string;
  /** 断语：财运 */
  wealth: string;
  /** 断语：健康 */
  health: string;
}

// ---------- 通用包装 ----------
export interface EngineResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// 引擎函数签名（实现方必须导出以下函数）
// ============================================================
// bazi.ts    : export function computeBazi(input: BirthInput): EngineResult<BaziResult>
// name.ts    : export function computeName(name: string): EngineResult<NameResult>
// daily.ts   : export function computeDaily(date?: Date, rng?: Rng): EngineResult<DailyResult>
// tarot.ts   : export function drawTarot(
//                questionType: TarotQuestionType,
//                spread: TarotSpread,
//                rng?: Rng
//              ): EngineResult<TarotResult>
// lottery.ts : export function drawLottery(question?: string, rng?: Rng): EngineResult<LotteryResult>
// ============================================================
