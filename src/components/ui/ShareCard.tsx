"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

export interface ShareCardLine {
  label: string;
  value: string;
}

export interface ShareCardProps {
  /** 玩法名，如 生辰八字 */
  theme: string;
  /** 卡片主标题，如 四柱排盘 结果摘要 */
  title: string;
  /** 图标（1 字），如 八 */
  icon: string;
  /** 摘要结构化行 */
  lines: ShareCardLine[];
  /** 页面分享链接 */
  url?: string;
}

// 固定喜庆配色卡片常量（不依赖主题 CSS 变量，避免 html-to-image 序列化 var()/color-mix 失败）
const CARD_BG = "linear-gradient(160deg, #8c1f1f 0%, #a83a2a 100%)";
const CARD_ACCENT = "#f0d9a6";
const CARD_TEXT = "#fdf6e8";
const CARD_SUB = "rgba(253, 246, 232, 0.85)";
const CARD_LINE = "rgba(240, 217, 166, 0.3)";
/** 固定卡片宽度（px）：保证 html-to-image 输出与预览一致，避免响应式裁切 */
const CARD_WIDTH = 360;

export function ShareCard({ theme, title, icon, lines, url }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "done" | "fail">("idle");

  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

  const handleSavePng = async () => {
    if (!cardRef.current) return;
    setStatus("idle");
    try {
      const source = cardRef.current;
      // 离屏捕获：克隆到 fixed 尺寸容器（left:-9999 不影响页面），
      // 彻底摆脱父容器/响应式布局/transform 干扰，保证预览=截图
      const clone = source.cloneNode(true) as HTMLElement;
      clone.style.width = `${CARD_WIDTH}px`;
      clone.style.height = "auto";
      clone.style.margin = "0";
      clone.style.maxWidth = "none";
      // 离屏托管容器
      const host = document.createElement("div");
      host.style.position = "fixed";
      host.style.left = "-9999px";
      host.style.top = "0";
      host.style.width = `${CARD_WIDTH}px`;
      host.style.pointerEvents = "none";
      host.appendChild(clone);
      document.body.appendChild(host);

      // 让字体/布局稳定后再取真实尺寸
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const h = clone.scrollHeight;

      const dataUrl = await toPng(clone, {
        pixelRatio: 2,
        backgroundColor: "#8c1f1f",
        width: CARD_WIDTH,
        height: h,
        canvasWidth: CARD_WIDTH * 2,
        canvasHeight: h * 2,
        cacheBust: true,
      });
      host.remove();

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `卜兮-${theme}-${Date.now()}.png`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStatus("done");
    } catch {
      setStatus("fail");
    }
    setTimeout(() => setStatus("idle"), 2000);
  };

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setStatus("done");
    } catch {
      setStatus("fail");
    }
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 捕获用卡片：固定宽度，预览与截图一致 */}
      <div
        ref={cardRef}
        className="mx-auto overflow-hidden rounded-2xl p-6"
        style={{
          width: `${CARD_WIDTH}px`,
          maxWidth: "100%",
          background: CARD_BG,
          color: CARD_TEXT,
          border: `1px solid ${CARD_LINE}`,
          fontFamily: "var(--font-serif)",
          boxSizing: "border-box",
        }}
      >
        {/* 顶部：玩法名 + 图标 */}
        <div className="flex items-center gap-2 text-sm" style={{ color: CARD_ACCENT }}>
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
            style={{ background: CARD_ACCENT, color: "#8c1f1f" }}
          >
            {icon}
          </span>
          <span className="truncate">{theme}</span>
          <span className="flex-1" style={{ borderTop: `1px solid ${CARD_LINE}` }} />
        </div>

        {/* 主标题 */}
        <div className="mt-4 text-center">
          <div className="text-2xl font-medium">{title}</div>
        </div>

        {/* 摘要行：完整解读内容 */}
        <div className="mt-5 space-y-2.5">
          {lines.map((l) => (
            <div key={l.label} className="flex items-start gap-2 text-sm">
              <span className="w-14 shrink-0" style={{ color: CARD_ACCENT }}>
                {l.label}
              </span>
              <span className="min-w-0 flex-1 whitespace-normal leading-relaxed" style={{ color: CARD_SUB }}>
                {l.value}
              </span>
            </div>
          ))}
        </div>

        {/* 底部 */}
        <div className="mt-6 text-center text-xs" style={{ color: CARD_SUB }}>
          卜兮 · 灵犀一点
        </div>
      </div>

      {/* 操作区：仅 保存为图片 / 复制链接 */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleSavePng}
          className="rounded-xl border px-4 py-2 text-sm transition-all hover:opacity-80"
          style={{ borderColor: "var(--border)", color: "var(--text)" }}
        >
          {status === "done" ? "✓ 图片已保存" : status === "fail" ? "保存失败" : "保存为图片"}
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded-xl border px-4 py-2 text-sm transition-all hover:opacity-80"
          style={{ borderColor: "var(--border)", color: "var(--text-sub)" }}
        >
          复制链接
        </button>
      </div>
    </div>
  );
}
