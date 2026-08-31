// ============================================================
// 生辰八字占卜引擎
// 依赖 lunar-javascript（CommonJS，无自带类型声明，经 allowJs 推断使用）
// 纯函数实现：同一输入必然得到完全一致的输出，不含任何随机
// ============================================================
import * as lunar from "lunar-javascript";
import type {
  BirthInput,
  BaziResult,
  EngineResult,
  FiveElementCount,
  Pillar,
} from "./types";

/** 五行名（英文键，保持类型安全） */
type FiveElementName = "wood" | "fire" | "earth" | "metal" | "water";

/** 天干五行：甲乙木、丙丁火、戊己土、庚辛金、壬癸水 */
const STEM_ELEMENTS: Record<string, FiveElementName> = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
};

/** 地支五行：子亥水、寅卯木、巳午火、申酉金、辰戌丑未土 */
const BRANCH_ELEMENTS: Record<string, FiveElementName> = {
  子: "water",
  亥: "water",
  寅: "wood",
  卯: "wood",
  巳: "fire",
  午: "fire",
  申: "metal",
  酉: "metal",
  辰: "earth",
  戌: "earth",
  丑: "earth",
  未: "earth",
};

/** 五行中文名（顺序固定，用于 missing 输出） */
const ELEMENT_LABEL: Record<FiveElementName, string> = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水",
};

/** 按日主五行配置的文案（2026 为丙午年，流年火旺） */
interface ElementProfile {
  personality: string;
  careerHint: string;
  loveHint: string;
  yearHint: string;
}

const PROFILES: Record<FiveElementName, ElementProfile> = {
  wood: {
    personality:
      "日主属木，性格坚韧生长、直率向上，内心藏着蓬勃的生命力。\n你擅长在变化中寻找出路，遇事有主见，也愿意为在乎的人付出。\n有时会因过于固执而显得倔强，学会适时转弯，路会更宽。",
    careerHint:
      "木性之人适合需要创造力与成长空间的领域，如教育、文化、设计或草木相关的行业。\n你适合长期积累型的工作，循序渐进往往比急于求成更有利。\n与火、土属性的同事合作，容易擦出意外的火花。",
    loveHint:
      "感情中你真诚而直接，喜欢就是喜欢，藏不住心事。\n挑选心思细腻、能包容你倔强的伴侣，相处会更融洽。\n在关系中学会倾听，比急着表达更能拉近两颗心的距离。",
    yearHint:
      "2026 丙午年火气当令，木遇旺火有泄秀之象。\n这一年的才华与创意容易被看见，是展现自己、积累人气的好时机。\n留意别让精力过度消耗，适度休养，后劲才足。",
  },
  fire: {
    personality:
      "日主属火，热情明亮、行动力强，天生的感染力让你在人群中颇为显眼。\n你思路快、敢想敢做，情绪来得快去得也快。\n注意别让急躁带走耐心，稳一稳，反而走得更远。",
    careerHint:
      "火性之人适合发挥表达与带动力的领域，如传媒、市场、演艺或需要灵感的行业。\n你适合冲锋在前的位置，把热情投在热爱的事上会格外有成就感。\n适度借助水、木属性的协作，能让成果更扎实。",
    loveHint:
      "感情里你热烈主动，认定一个人便愿意倾尽热情。\n对方若能懂你的外放与柔软，关系便能持续升温。\n偶尔慢下来，把浪漫落到细水长流的陪伴里。",
    yearHint:
      "2026 丙午年流年火旺，与日主同气相求。\n这一年状态饱满、行动力十足，适合把酝酿已久的计划推上日程。\n注意情绪与开支的节制，旺年更要懂得细水长流。",
  },
  earth: {
    personality:
      "日主属土，沉稳包容、踏实可信，是朋友眼中可靠的存在。\n你做事讲原则、有担当，耐得住性子也扛得住事。\n偶尔会显得固执守旧，试着对新事物多一些好奇，人生会更开阔。",
    careerHint:
      "土性之人适合稳定且能沉淀的领域，如地产、金融、管理或农业相关行业。\n你擅长把复杂的事情理出头绪，越大的盘子越能显你的本事。\n搭配金、水属性的伙伴，能补足灵活应变的能力。",
    loveHint:
      "感情中你重承诺、重实际，爱一个人便想给对方安稳的将来。\n对方若能欣赏你的厚重与专注，关系便会细水长流。\n多制造一点小惊喜，平淡里也能开出花来。",
    yearHint:
      "2026 丙午年旺火生土，日主得生扶，是一年底气渐厚的时节。\n适合夯实基础、经营人脉，之前的付出容易在这个流年看到回报。\n稳扎稳打，别被周围的热闹带乱了自己的节奏。",
  },
  metal: {
    personality:
      "日主属金，果断利落、外柔内刚，骨子里有一股不服输的劲。\n你重义气、讲规则，认准的事很少半途而废。\n偶尔锋芒太露容易伤人伤己，学着圆融些，反而更有力量。",
    careerHint:
      "金性之人适合讲究精度与规则的领域，如法律、技术、金融或器械制造等行业。\n你适合凭实力说话的岗位，专业精进是你最大的底气。\n与土、水属性的同伴搭档，能刚柔并济、相得益彰。",
    loveHint:
      "感情里你干脆认真，认定对方便一心一意。\n对方若能读懂你的硬气之下的温柔，便不会轻易放手。\n适时放下防备，柔软的一面更能留住人心。",
    yearHint:
      "2026 丙午年火势偏旺，金受火炼，是考验与淬炼并存的一年。\n压力之下正是磨砺锋芒的时候，沉住气把专业做实。\n多亲近水、土属性的人事物，能化解不少燥气。",
  },
  water: {
    personality:
      "日主属水，聪慧灵动、善解人意，适应力与洞察力都是你的长项。\n你心思细密、想象丰富，能看见别人看不见的细节。\n有时想得太多容易内耗，把念头落到行动上，烦恼自会消散。",
    careerHint:
      "水性之人适合需要沟通与流动感的领域，如传媒、贸易、咨询或艺术创作等行业。\n你适应环境的能力强，越是变化的环境越能发挥优势。\n与木、火属性的伙伴协作，容易产生灵感的共鸣。",
    loveHint:
      "感情中你温柔细腻、善解人意，懂得照顾对方的情绪。\n对方若能欣赏你的敏感与灵动，关系便会如流水般滋养彼此。\n遇到分歧时把话说明白，别让猜疑搅浑了清澈的心。",
    yearHint:
      "2026 丙午年火旺水弱，日主略显受制，宜养精蓄锐。\n这一年适合学习充电、低调积累，把心力用在刀刃上。\n少一些逞强，多一些从容，平稳即是上策。",
  },
};

/** 构造单柱结构 */
function toPillar(stem: string, branch: string, full?: string): Pillar {
  return { stem, branch, full: full || `${stem}${branch}` };
}

/** 输入合法性校验，非法返回中文错误信息，合法返回 null */
function validate(input: BirthInput): string | null {
  const { year, month, day, hour, gender } = input;
  if (!Number.isInteger(year) || year < 1900 || year > 2100) {
    return "年份需在 1900-2100 之间";
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return "月份需在 1-12 之间";
  }
  if (!Number.isInteger(day) || day < 1 || day > 31) {
    return "日期需在 1-31 之间";
  }
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return "小时需在 0-23 之间";
  }
  if (gender !== "male" && gender !== "female") {
    return "性别需为 male 或 female";
  }
  // 真实日期校验：2 月 30 日、4 月 31 日等不存在的日期在此拦截
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return "请输入有效的公历日期";
  }
  return null;
}

/**
 * 生辰八字计算主入口
 * 返回四柱（年/月/日/时）、日主、五行计数、缺失五行与按日主五行生成的文案
 */
export function computeBazi(input: BirthInput): EngineResult<BaziResult> {
  const invalid = validate(input);
  if (invalid) {
    return { ok: false, error: invalid };
  }

  try {
    const solar = lunar.Solar.fromYmdHms(input.year, input.month, input.day, input.hour, 0, 0);
    const lunarDate = solar.getLunar();
    const ec = lunarDate.getEightChar();

    const pillars = {
      year: toPillar(ec.getYearGan(), ec.getYearZhi(), ec.getYear()),
      month: toPillar(ec.getMonthGan(), ec.getMonthZhi(), ec.getMonth()),
      day: toPillar(ec.getDayGan(), ec.getDayZhi(), ec.getDay()),
      hour: toPillar(ec.getTimeGan(), ec.getTimeZhi(), ec.getTime()),
    };

    // 统计四柱 8 个字（4 干 + 4 支）的五行分布
    const counts: FiveElementCount = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    const elements: Array<FiveElementName | undefined> = [
      STEM_ELEMENTS[ec.getYearGan()],
      BRANCH_ELEMENTS[ec.getYearZhi()],
      STEM_ELEMENTS[ec.getMonthGan()],
      BRANCH_ELEMENTS[ec.getMonthZhi()],
      STEM_ELEMENTS[ec.getDayGan()],
      BRANCH_ELEMENTS[ec.getDayZhi()],
      STEM_ELEMENTS[ec.getTimeGan()],
      BRANCH_ELEMENTS[ec.getTimeZhi()],
    ];
    for (const el of elements) {
      if (el) counts[el] += 1;
    }

    const missing = (Object.keys(ELEMENT_LABEL) as FiveElementName[]).filter(
      (el) => counts[el] === 0
    ).map((el) => ELEMENT_LABEL[el]);

    const dayMaster = ec.getDayGan();
    const dayElement = STEM_ELEMENTS[dayMaster] ?? "wood";
    const profile = PROFILES[dayElement];

    return {
      ok: true,
      data: {
        birth: { ...input },
        pillars,
        dayMaster,
        fiveElements: counts,
        missing,
        personality: profile.personality,
        careerHint: profile.careerHint,
        loveHint: profile.loveHint,
        yearHint: profile.yearHint,
        zodiac: lunarDate.getYearShengXiao(),
      },
    };
  } catch {
    // lunar-javascript 对极个别边界值可能抛异常，兜底为校验错误而非崩溃
    return { ok: false, error: "无法解析该出生时间，请检查输入是否正确" };
  }
}
