import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

// ---------- 表单控件公共样式 ----------
// 布局走 Tailwind 类，主题色走 CSS 变量（与全站风格一致）
const CONTROL_CLASS =
  "wb-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors";

// ---------- 字段容器 ----------
export interface FieldProps {
  label: string;
  /** 引擎返回的校验错误，红字展示 */
  error?: string;
  /** 辅助说明 */
  hint?: string;
  children: ReactNode;
}

export function Field({ label, error, hint, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm" style={{ color: "var(--text-sub)" }}>
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1.5 block text-xs" style={{ color: "var(--text-faint)" }}>
          {hint}
        </span>
      )}
      {error && (
        <span className="mt-1.5 block text-xs" style={{ color: "#e5534b" }}>
          {error}
        </span>
      )}
    </label>
  );
}

// ---------- 文本输入 ----------
export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL_CLASS} ${props.className ?? ""}`} />;
}

// ---------- 下拉选择 ----------
// 说明：不用 appearance-none + 内联 SVG 箭头（Windows 中文 select 下会把选中文本
// 渲染成斜线/杂纹）。改为保留原生外观、直接以 CSS 变量控制配色，最稳妥。
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${CONTROL_CLASS} cursor-pointer ${props.className ?? ""}`}
      style={{
        color: "var(--text)",
        backgroundColor: "var(--surface)",
        ...props.style,
      }}
    >
      {props.children}
    </select>
  );
}

// ---------- 多行文本 ----------
export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${CONTROL_CLASS} resize-none ${props.className ?? ""}`} />;
}
