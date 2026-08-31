import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

// 主按钮：主题色实底（accent 前景 bg 字号，与 PlayCard 图标同款对比）
// 幽灵按钮：仅描边，用于「重新测算」等次级动作
export function Button({ variant = "primary", children, ...rest }: ButtonProps) {
  const isPrimary = variant === "primary";
  return (
    <button
      {...rest}
      className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 ${rest.className ?? ""}`}
      style={
        isPrimary
          ? { background: "var(--accent)", color: "var(--bg)" }
          : { background: "transparent", color: "var(--text-sub)", border: "1px solid var(--border)" }
      }
    >
      {children}
    </button>
  );
}
