import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export interface PageShellProps {
  /** 玩法名（宋体大字标题） */
  title: string;
  /** 副标题 */
  subtitle?: string;
  /** 页面主体（表单与结果） */
  children: ReactNode;
}

// 玩法页面统一外壳：顶栏（返回首页 + 主题切换）+ 标题区 + 内容 + 免责声明脚注
// 所有玩法页共用，保证全站结构一致
export function PageShell({ title, subtitle, children }: PageShellProps) {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link
          href="/"
          className="font-serif text-lg font-medium transition-opacity hover:opacity-80"
          style={{ color: "var(--accent)" }}
        >
          ← 灵犀 · 占卜
        </Link>
        <ThemeToggle />
      </header>

      <section className="mx-auto max-w-3xl px-5 pb-8 pt-2">
        <h1 className="font-serif text-xl font-medium sm:text-2xl">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-sub)" }}>
            {subtitle}
          </p>
        )}
        <div className="mt-6 space-y-5">{children}</div>
      </section>

      <footer
        className="mx-auto max-w-3xl px-5 py-10 text-center text-xs leading-relaxed"
        style={{ color: "var(--text-faint)" }}
      >
        <p>本服务为传统文化娱乐参考，不构成医疗、投资、婚恋或任何决策依据。</p>
        <p className="mt-1 opacity-70">心诚则灵——结果请以自己的判断为准。</p>
      </footer>
    </main>
  );
}
