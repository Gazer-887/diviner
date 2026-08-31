// ============================================================
// 塔罗内容库：78 张牌（22 张大阿卡纳 + 56 张小阿卡纳）
// 每张牌含正位/逆位各 3-5 个中文关键词
// index 由拼接顺序自动分配，保证 0-77 连续唯一
// ============================================================
import type { TarotCard } from "../engines/types";

/** 内容库内部种子，index 由 TAROT_CARDS 构造时统一分配 */
interface CardSeed {
  name: string;
  arcana: TarotCard["arcana"];
  suit?: TarotCard["suit"];
  number: number;
  upright: string[];
  reversed: string[];
}

// ---------- 大阿卡纳（22 张，number 0-21） ----------
const MAJOR_SEEDS: CardSeed[] = [
  { name: "愚者", arcana: "major", number: 0, upright: ["新的开始", "冒险精神", "自由奔放", "天真乐观"], reversed: ["鲁莽冲动", "犹豫不决", "轻率冒进", "缺乏规划"] },
  { name: "魔术师", arcana: "major", number: 1, upright: ["创造潜能", "行动力", "资源整合", "自信掌握"], reversed: ["操纵欺骗", "能力不足", "计划受阻", "方向混乱"] },
  { name: "女祭司", arcana: "major", number: 2, upright: ["直觉智慧", "内在洞察", "宁静沉思", "潜意识"], reversed: ["忽视直觉", "表面掩饰", "情绪波动", "隐藏真相"] },
  { name: "皇后", arcana: "major", number: 3, upright: ["丰饶滋养", "创造繁荣", "温柔关爱", "感官享受"], reversed: ["过度依赖", "创造力停滞", "疏忽自我", "放任安逸"] },
  { name: "皇帝", arcana: "major", number: 4, upright: ["权威领导", "秩序稳定", "责任担当", "掌控全局"], reversed: ["固执专断", "权力滥用", "失控混乱", "过度压制"] },
  { name: "教皇", arcana: "major", number: 5, upright: ["传统规范", "精神导师", "道德指引", "信念传承"], reversed: ["教条僵化", "质疑权威", "背离传统", "固执己见"] },
  { name: "恋人", arcana: "major", number: 6, upright: ["真爱结合", "和谐关系", "价值选择", "情感共鸣"], reversed: ["关系失衡", "犹豫不决", "分离疏远", "选择困境"] },
  { name: "战车", arcana: "major", number: 7, upright: ["意志胜利", "目标达成", "坚定前行", "掌控方向"], reversed: ["方向迷失", "受阻停滞", "好胜急躁", "失去控制"] },
  { name: "力量", arcana: "major", number: 8, upright: ["内在力量", "勇气耐心", "温柔化解", "自我掌控"], reversed: ["软弱无力", "信心不足", "情绪失控", "压抑自我"] },
  { name: "隐士", arcana: "major", number: 9, upright: ["内省独处", "寻求真理", "沉淀智慧", "指引他人"], reversed: ["孤僻封闭", "逃避现实", "固执偏执", "过度谨慎"] },
  { name: "命运之轮", arcana: "major", number: 10, upright: ["时来运转", "命运转机", "周期循环", "机遇降临"], reversed: ["运势反复", "不可控因素", "时运不济", "停滞不前"] },
  { name: "正义", arcana: "major", number: 11, upright: ["公正平衡", "理性判断", "因果相报", "真相昭彰"], reversed: ["失衡偏颇", "判决不公", "逃避责任", "自欺欺人"] },
  { name: "倒吊人", arcana: "major", number: 12, upright: ["换位思考", "暂时牺牲", "等待时机", "逆向思维"], reversed: ["无谓牺牲", "拖延不前", "固执己见", "急于挣脱"] },
  { name: "死神", arcana: "major", number: 13, upright: ["结束转化", "彻底蜕变", "放下过去", "开启新篇"], reversed: ["抗拒改变", "停滞僵局", "恐惧未知", "难以割舍"] },
  { name: "节制", arcana: "major", number: 14, upright: ["调和平衡", "循序渐进", "耐心融合", "适度节制"], reversed: ["失衡失序", "过度放纵", "急躁冒进", "沟通不畅"] },
  { name: "恶魔", arcana: "major", number: 15, upright: ["欲望诱惑", "物质束缚", "沉溺执念", "枷锁捆绑"], reversed: ["挣脱束缚", "戒除陋习", "重获自由", "清醒觉知"] },
  { name: "高塔", arcana: "major", number: 16, upright: ["突发变故", "骤变震荡", "真相揭露", "打破旧局"], reversed: ["灾难延缓", "恐惧受困", "逃避真相", "僵局持续"] },
  { name: "星星", arcana: "major", number: 17, upright: ["希望曙光", "愿望实现", "疗愈安慰", "灵感指引"], reversed: ["希望渺茫", "失去信心", "灵感枯竭", "梦想受挫"] },
  { name: "月亮", arcana: "major", number: 18, upright: ["迷雾幻觉", "直觉敏感", "潜意识浮现", "不安焦虑"], reversed: ["迷雾散去", "看清真相", "走出困惑", "疑虑消解"] },
  { name: "太阳", arcana: "major", number: 19, upright: ["成功喜悦", "活力充沛", "光明坦途", "收获圆满"], reversed: ["成果推迟", "热度消退", "过度乐观", "美中不足"] },
  { name: "审判", arcana: "major", number: 20, upright: ["觉醒重生", "豁然开朗", "因果分明", "重新评价"], reversed: ["自我怀疑", "错失机会", "内心责备", "难下决心"] },
  { name: "世界", arcana: "major", number: 21, upright: ["圆满完成", "整合圆融", "目标达成", "大局告成"], reversed: ["功亏一篑", "未竟之业", "缺乏圆满", "拖延收尾"] },
];

// ---------- 小阿卡纳（56 张，number 1-14） ----------
// 数字牌 1-10：权杖/圣杯/宝剑/星币各 10 张
// 宫廷牌 11-14：侍从/骑士/王后/国王
const WANDS_SEEDS: CardSeed[] = [
  { name: "权杖一", arcana: "minor", suit: "wands", number: 1, upright: ["新起点", "行动能量", "开创先机", "热情点燃"], reversed: ["推迟开始", "热情消退", "动力不足", "错失机会"] },
  { name: "权杖二", arcana: "minor", suit: "wands", number: 2, upright: ["规划未来", "权衡抉择", "展望远景", "主导全局"], reversed: ["畏首畏尾", "计划落空", "坐失良机", "视野狭隘"] },
  { name: "权杖三", arcana: "minor", suit: "wands", number: 3, upright: ["拓展视野", "合作开花", "远见布局", "初步成果"], reversed: ["协作不顺", "计划延误", "视野受限", "踌躇不前"] },
  { name: "权杖四", arcana: "minor", suit: "wands", number: 4, upright: ["稳固基础", "庆祝成就", "家庭和谐", "安顿归属"], reversed: ["基础动摇", "庆祝落空", "缺乏归属", "不安定感"] },
  { name: "权杖五", arcana: "minor", suit: "wands", number: 5, upright: ["竞争挑战", "意见交锋", "良性摩擦", "求同存异"], reversed: ["冲突升级", "内耗争斗", "回避对抗", "暂时停战"] },
  { name: "权杖六", arcana: "minor", suit: "wands", number: 6, upright: ["胜利凯旋", "获得认可", "好消息传来", "众望所归"], reversed: ["胜利延迟", "认可缺失", "骄傲自满", "优势流失"] },
  { name: "权杖七", arcana: "minor", suit: "wands", number: 7, upright: ["坚守立场", "捍卫主张", "迎难而上", "勇气坚持"], reversed: ["疲于防守", "信心动摇", "力不从心", "被迫退让"] },
  { name: "权杖八", arcana: "minor", suit: "wands", number: 8, upright: ["进展迅速", "消息纷至", "行动加速", "畅通无阻"], reversed: ["进度迟滞", "计划拖延", "忙中出错", "信息延迟"] },
  { name: "权杖九", arcana: "minor", suit: "wands", number: 9, upright: ["坚韧不拔", "最后的坚持", "警戒防御", "备战状态"], reversed: ["精疲力竭", "怀疑犹豫", "防备过重", "濒临放弃"] },
  { name: "权杖十", arcana: "minor", suit: "wands", number: 10, upright: ["责任繁重", "负重前行", "完成任务", "压力承载"], reversed: ["不堪重负", "超载过劳", "推卸责任", "力有不逮"] },
  { name: "权杖侍从", arcana: "minor", suit: "wands", number: 11, upright: ["热忱探索", "充满灵感", "勇于尝试", "新鲜消息"], reversed: ["三分钟热度", "缺乏经验", "拖延怠惰", "空想不实"] },
  { name: "权杖骑士", arcana: "minor", suit: "wands", number: 12, upright: ["勇往直前", "冒险行动", "热情奔放", "立刻出发"], reversed: ["鲁莽冲动", "行动急躁", "半途而废", "横冲直撞"] },
  { name: "权杖王后", arcana: "minor", suit: "wands", number: 13, upright: ["自信魅力", "乐观活力", "亲和感染", "热情鼓励"], reversed: ["情绪善变", "易怒急躁", "占有欲强", "缺乏耐性"] },
  { name: "权杖国王", arcana: "minor", suit: "wands", number: 14, upright: ["果敢领导", "远见魄力", "开创事业", "行动力强"], reversed: ["独断专行", "脾气火爆", "好高骛远", "决策鲁莽"] },
];

const CUPS_SEEDS: CardSeed[] = [
  { name: "圣杯一", arcana: "minor", suit: "cups", number: 1, upright: ["情感萌发", "新恋情", "直觉开启", "内心满足"], reversed: ["情感压抑", "心事落空", "情绪麻木", "爱意受阻"] },
  { name: "圣杯二", arcana: "minor", suit: "cups", number: 2, upright: ["相互吸引", "平等关系", "心意相通", "携手合作"], reversed: ["关系失衡", "沟通破裂", "貌合神离", "误会丛生"] },
  { name: "圣杯三", arcana: "minor", suit: "cups", number: 3, upright: ["友情欢聚", "庆祝分享", "社交顺利", "情谊深厚"], reversed: ["过度放纵", "圈子排挤", "流言闲话", "关系生变"] },
  { name: "圣杯四", arcana: "minor", suit: "cups", number: 4, upright: ["深思内省", "审视现状", "情感沉淀", "心绪平静"], reversed: ["倦怠麻木", "错失良机", "闷闷不乐", "过度自省"] },
  { name: "圣杯五", arcana: "minor", suit: "cups", number: 5, upright: ["失落遗憾", "沉湎过往", "情绪低谷", "凝视失去"], reversed: ["走出阴霾", "重拾希望", "放下遗憾", "重新振作"] },
  { name: "圣杯六", arcana: "minor", suit: "cups", number: 6, upright: ["怀旧温馨", "美好回忆", "纯真善意", "旧友重逢"], reversed: ["困于过去", "停滞不前", "过度依赖", "不愿成长"] },
  { name: "圣杯七", arcana: "minor", suit: "cups", number: 7, upright: ["想象丰富", "选择众多", "梦想展望", "愿景浮现"], reversed: ["幻想破灭", "好高骛远", "自欺欺人", "难以抉择"] },
  { name: "圣杯八", arcana: "minor", suit: "cups", number: 8, upright: ["主动离开", "追寻更高", "放下安逸", "踏上新程"], reversed: ["犹豫留恋", "不敢改变", "进退两难", "错失成长"] },
  { name: "圣杯九", arcana: "minor", suit: "cups", number: 9, upright: ["心愿达成", "满足幸福", "情感丰盈", "如愿以偿"], reversed: ["欲望未满", "自满怠惰", "表面风光", "内心空虚"] },
  { name: "圣杯十", arcana: "minor", suit: "cups", number: 10, upright: ["家庭美满", "情感圆满", "和谐幸福", "长久情谊"], reversed: ["关系裂痕", "家庭失和", "幸福受阻", "理想落差"] },
  { name: "圣杯侍从", arcana: "minor", suit: "cups", number: 11, upright: ["敏感温柔", "情感讯息", "创意灵感", "纯真示好"], reversed: ["情感幼稚", "害羞逃避", "情绪泛滥", "轻信受骗"] },
  { name: "圣杯骑士", arcana: "minor", suit: "cups", number: 12, upright: ["浪漫邀约", "温柔追求", "体贴迷人", "情感奔赴"], reversed: ["情绪无常", "敷衍暧昧", "承诺不定", "不切实际"] },
  { name: "圣杯王后", arcana: "minor", suit: "cups", number: 13, upright: ["温柔包容", "共情理解", "细腻关怀", "直觉丰沛"], reversed: ["情绪淹没", "过度敏感", "患得患失", "委屈压抑"] },
  { name: "圣杯国王", arcana: "minor", suit: "cups", number: 14, upright: ["情感成熟", "慈悲稳重", "善解人意", "平衡理性"], reversed: ["情绪压抑", "情感操纵", "冷漠疏离", "心口不一"] },
];

const SWORDS_SEEDS: CardSeed[] = [
  { name: "宝剑一", arcana: "minor", suit: "swords", number: 1, upright: ["思维清明", "真相开启", "理性决断", "新想法"], reversed: ["思绪混乱", "判断失真", "词不达意", "真相蒙蔽"] },
  { name: "宝剑二", arcana: "minor", suit: "swords", number: 2, upright: ["权衡僵持", "刻意回避", "内心抉择", "保持距离"], reversed: ["决断艰难", "自欺欺人", "对峙升级", "逃避面对"] },
  { name: "宝剑三", arcana: "minor", suit: "swords", number: 3, upright: ["心碎伤痛", "真相刺痛", "悲伤浮现", "接受现实"], reversed: ["疗愈恢复", "释怀放下", "伤痛渐愈", "宽恕前行"] },
  { name: "宝剑四", arcana: "minor", suit: "swords", number: 4, upright: ["休养生息", "暂停沉思", "恢复元气", "静待时机"], reversed: ["休息不足", "焦躁不安", "旧疾复发", "被迫停摆"] },
  { name: "宝剑五", arcana: "minor", suit: "swords", number: 5, upright: ["冲突获胜", "代价惨重", "争强好胜", "两败俱伤"], reversed: ["和解止损", "避免争执", "放下输赢", "退让保身"] },
  { name: "宝剑六", arcana: "minor", suit: "swords", number: 6, upright: ["过渡迁移", "渐趋平稳", "摆脱困境", "放下过往"], reversed: ["滞留困境", "舟车劳顿", "不愿前行", "波折未平"] },
  { name: "宝剑七", arcana: "minor", suit: "swords", number: 7, upright: ["策略巧思", "隐秘行动", "机警应变", "非常手段"], reversed: ["弄巧成拙", "失信于人", "隐瞒败露", "投机落空"] },
  { name: "宝剑八", arcana: "minor", suit: "swords", number: 8, upright: ["自我设限", "思绪束缚", "困境错觉", "感到被困"], reversed: ["打破枷锁", "解除限制", "豁然开朗", "重获自主"] },
  { name: "宝剑九", arcana: "minor", suit: "swords", number: 9, upright: ["焦虑失眠", "忧惧缠身", "自责内耗", "噩梦缠绕"], reversed: ["走出恐惧", "释放心结", "寻求帮助", "阴霾渐散"] },
  { name: "宝剑十", arcana: "minor", suit: "swords", number: 10, upright: ["彻底结束", "跌至谷底", "痛苦终结", "黎明之前"], reversed: ["触底反弹", "绝处逢生", "缓慢恢复", "转机出现"] },
  { name: "宝剑侍从", arcana: "minor", suit: "swords", number: 11, upright: ["机敏警觉", "思维敏捷", "好奇探究", "善于观察"], reversed: ["言语轻率", "八卦多嘴", "思维混乱", "轻信谣言"] },
  { name: "宝剑骑士", arcana: "minor", suit: "swords", number: 12, upright: ["目标明确", "迅速行动", "直率果断", "疾风推进"], reversed: ["仓促冒进", "言语伤人", "急躁失策", "半途失控"] },
  { name: "宝剑王后", arcana: "minor", suit: "swords", number: 13, upright: ["清醒独立", "洞察敏锐", "直言不讳", "明辨是非"], reversed: ["刻薄苛责", "怨怼尖锐", "冷嘲热讽", "心怀芥蒂"] },
  { name: "宝剑国王", arcana: "minor", suit: "swords", number: 14, upright: ["理性权威", "条理分明", "公正判断", "思路清晰"], reversed: ["固执武断", "冷酷无情", "滥用才智", "过度批判"] },
];

const PENTACLES_SEEDS: CardSeed[] = [
  { name: "星币一", arcana: "minor", suit: "pentacles", number: 1, upright: ["财运新机", "实际收获", "物质基础", "踏实开端"], reversed: ["财机落空", "投入不稳", "错失良机", "忽视务实"] },
  { name: "星币二", arcana: "minor", suit: "pentacles", number: 2, upright: ["灵活平衡", "收支调度", "多方兼顾", "随机应变"], reversed: ["顾此失彼", "财务波动", "应接不暇", "难以兼顾"] },
  { name: "星币三", arcana: "minor", suit: "pentacles", number: 3, upright: ["团队协作", "技艺精进", "规划落地", "专业认可"], reversed: ["配合失调", "进度迟缓", "技艺荒疏", "标准降低"] },
  { name: "星币四", arcana: "minor", suit: "pentacles", number: 4, upright: ["稳固积累", "守住成果", "稳健持家", "掌控资源"], reversed: ["过度吝啬", "固步自封", "害怕失去", "抓取不放"] },
  { name: "星币五", arcana: "minor", suit: "pentacles", number: 5, upright: ["匮乏困顿", "物质吃紧", "孤立无援", "身心疲惫"], reversed: ["困境转机", "获得援手", "走出低谷", "重燃希望"] },
  { name: "星币六", arcana: "minor", suit: "pentacles", number: 6, upright: ["慷慨给予", "资源流通", "施受平衡", "惠及他人"], reversed: ["斤斤计较", "资源失衡", "回报不均", "依赖施舍"] },
  { name: "星币七", arcana: "minor", suit: "pentacles", number: 7, upright: ["耐心等待", "评估成果", "长期耕耘", "审时度势"], reversed: ["急于求成", "回报寥寥", "信心动摇", "半途而废"] },
  { name: "星币八", arcana: "minor", suit: "pentacles", number: 8, upright: ["勤恳精进", "技艺磨炼", "专注投入", "务实积累"], reversed: ["敷衍了事", "专注不足", "品质下滑", "原地踏步"] },
  { name: "星币九", arcana: "minor", suit: "pentacles", number: 9, upright: ["独立富足", "自得其乐", "理财有成", "优雅从容"], reversed: ["过度工作", "依赖他人", "财务透支", "自我怀疑"] },
  { name: "星币十", arcana: "minor", suit: "pentacles", number: 10, upright: ["家族昌盛", "财富传承", "根基稳固", "长远保障"], reversed: ["家业不稳", "财务隐患", "家人疏离", "根基动摇"] },
  { name: "星币侍从", arcana: "minor", suit: "pentacles", number: 11, upright: ["务实学习", "理财新机", "勤勉踏实", "学业起步"], reversed: ["拖延怠惰", "三心二意", "眼高手低", "学习受阻"] },
  { name: "星币骑士", arcana: "minor", suit: "pentacles", number: 12, upright: ["稳健可靠", "按部就班", "尽职尽责", "耐心耕耘"], reversed: ["僵化拖延", "得过且过", "缺乏变通", "停滞不前"] },
  { name: "星币王后", arcana: "minor", suit: "pentacles", number: 13, upright: ["务实周全", "持家有道", "温厚可靠", "丰盈安稳"], reversed: ["过度操劳", "自我忽视", "患得患失", "现实焦虑"] },
  { name: "星币国王", arcana: "minor", suit: "pentacles", number: 14, upright: ["事业有成", "财务稳健", "可靠睿智", "积累丰厚"], reversed: ["守财固执", "物质至上", "经营失策", "回报落空"] },
];

/** 78 张牌，index 由拼接顺序分配 0-77 */
export const TAROT_CARDS: TarotCard[] = [
  ...MAJOR_SEEDS,
  ...WANDS_SEEDS,
  ...CUPS_SEEDS,
  ...SWORDS_SEEDS,
  ...PENTACLES_SEEDS,
].map((seed, i): TarotCard => ({ ...seed, index: i }));
