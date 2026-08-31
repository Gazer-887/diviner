"use client";

import type { TarotCard } from "@/lib/engines/types";
import { useEffect, useState } from "react";

// 小阿卡纳花色中文名（大阿卡纳无花色）
const SUIT_LABEL: Record<TarotCard["suit"] & string, string> = {
  wands: "权杖",
  cups: "圣杯",
  swords: "宝剑",
  pentacles: "星币",
};

export interface FlipCardProps {
  card: TarotCard;
  reversed: boolean;
  /** three 牌阵的位名：过去/现在/未来 */
  position?: string;
  /** 翻牌动画延迟（秒），三张牌时递增 0 / 0.2 / 0.4 */
  delay?: number;
  /** lg 单张放大，md 三张并排 */
  size?: "md" | "lg";
}

// 翻牌卡：父级 perspective（900px）→ 牌盒 wb-flip3d（preserve-3d + transition rotateY）
// 牌背（默认朝外，rotateY 0）/ 牌面（自身 rotateY 180，朝内），通过 is-flipped class
// 触发父 rotateY 0→180 的 transition 完成翻牌。
// 注：父元素用 CSS transition 而非关键帧动画，规避 Chrome 152 在 nested
// preserve-3d + keyframe animation 下对 backface-visibility 判定错乱的问题。
export function FlipCard({ card, reversed, position, delay = 0, size = "md" }: FlipCardProps) {
  const keywords = reversed ? card.reversed : card.upright;
  const arcanaLabel =
    card.arcana === "major" ? "大阿卡纳" : `小阿卡纳 · ${card.suit ? SUIT_LABEL[card.suit] : ""}`;
  const sizeClass = size === "lg" ? "w-28 h-40 sm:w-32 sm:h-44" : "w-24 h-36 sm:w-28 sm:h-40";
  const nameClass =
    size === "lg" ? "text-base sm:text-lg" : "text-sm sm:text-base";

  // 翻牌由父级 page 控制（800ms 洗牌仪式）后一次性触发，这里用 delay 错开三张
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 800 + delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div className="flex flex-col items-center">
      {/* 牌（翻牌仪式） */}
      <div style={{ perspective: 900 }}>
        <div
          className={`wb-flip3d ${sizeClass} ${flipped ? "is-flipped" : ""}`}
        >
          {/* 牌背：accent 渐变 + 图案字符 */}
          <div
            className="wb-face absolute inset-0 flex items-center justify-center rounded-xl border"
            style={{
              background:
                "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 55%, var(--surface)))",
              borderColor: "color-mix(in srgb, var(--accent) 55%, var(--bg))",
            }}
          >
            <span className="text-xl sm:text-2xl" style={{ color: "var(--bg)" }}>
              ✦
            </span>
          </div>
          {/* 牌面：翻完后可见 */}
          <div
            className="wb-face wb-face-back absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl border px-1 text-center"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <span
              className={`font-serif font-medium leading-tight ${nameClass}`}
              style={{ color: "var(--text)" }}
            >
              {card.name}
            </span>
            <span
              className="text-[11px]"
              style={{ color: reversed ? "var(--text-faint)" : "var(--accent)" }}
            >
              {reversed ? "逆位" : "正位"}
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
              {arcanaLabel}
            </span>
          </div>
        </div>
      </div>

      {/* 牌下文字区 */}
      <div className="mt-3 flex flex-col items-center gap-1.5 text-center">
        {position && (
          <span className="text-xs font-medium" style={{ color: "var(--text-sub)" }}>
            {position}
          </span>
        )}
        <span className="text-xs" style={{ color: reversed ? "var(--text-faint)" : "var(--accent)" }}>
          {reversed ? "逆位 · 建议审慎" : "正位 · 顺势而为"}
        </span>
        <div className="flex flex-wrap justify-center gap-1">
          {keywords.map((kw) => (
            <span
              key={kw}
              className="rounded-full border px-2 py-0.5 text-[10px]"
              style={{ borderColor: "var(--border)", color: "var(--text-sub)" }}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}