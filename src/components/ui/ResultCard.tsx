import type { ReactNode } from "react";

export interface ResultCardProps {
  /** 分节标题（宋体主题色） */
  title?: string;
  /** 可选右置小字，如「正位 / 逆位」标记 */
  tag?: string;
  children: ReactNode;
}

// 结果分节卡片：surface 背景 + 主题描边，进入时淡入上浮
export function ResultCard({ title, tag, children }: ResultCardProps) {
  return (
    <section
      className="anim-fade-up rounded-2xl border p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {(title || tag) && (
        <div className="mb-3 flex items-baseline justify-between">
          {title && (
            <h2 className="font-serif text-base font-medium" style={{ color: "var(--accent)" }}>
              {title}
            </h2>
          )}
          {tag && (
            <span className="text-xs" style={{ color: "var(--text-faint)" }}>
              {tag}
            </span>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
