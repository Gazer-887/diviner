"use client";

import { useState } from "react";

export interface ShareButtonProps {
  /** 分享的标题（如「生辰八字 · 戊寅日柱」） */
  title: string;
  /** 分享的文本（结构化的占卜结果摘要，2-6 行） */
  text: string;
  /** 分享的链接（默认当前页 URL） */
  url?: string;
  /** 自定义按钮文案，默认「分享结果」 */
  label?: string;
}

// 分享按钮：移动端优先 Web Share API（系统原生分享面板，含微信/朋友圈/QQ），
// 桌面端 fallback 到 navigator.clipboard.writeText 复制到剪贴板，并短暂提示「已复制」。
export function ShareButton({ title, text, url, label = "分享结果" }: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  const handleShare = async () => {
    const shareData = { title, text, url: url ?? (typeof window !== "undefined" ? window.location.href : "") };

    // 1. 优先尝试 Web Share API（移动端 / 部分桌面浏览器）
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch (e) {
        // 用户取消或不支持，回退到 clipboard
        if ((e as Error).name === "AbortError") return; // 用户取消，不算失败
      }
    }

    // 2. Fallback：复制到剪贴板
    try {
      const fullText = `${title}\n\n${text}\n\n${shareData.url}`;
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(fullText);
      } else {
        // 老浏览器 fallback（execCommand 已 deprecated，但作为降级保留）
        const ta = document.createElement("textarea");
        ta.value = fullText;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 1800);
    } catch {
      setStatus("failed");
      setTimeout(() => setStatus("idle"), 1800);
    }
  };

  const displayText =
    status === "copied" ? "✓ 已复制" : status === "failed" ? "复制失败" : label;

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-live="polite"
      className="rounded-xl border px-4 py-2 text-sm transition-all hover:opacity-80"
      style={{
        borderColor: "var(--border)",
        color: status === "copied" ? "var(--accent)" : "var(--text-sub)",
        background: "transparent",
      }}
    >
      {displayText}
    </button>
  );
}