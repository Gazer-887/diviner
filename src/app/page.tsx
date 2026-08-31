import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { PlayCard } from "@/components/ui/PlayCard";

const PLAYS = [
  { icon: "八", title: "生辰八字", desc: "四柱排盘 · 五行解析", href: "/bazi" },
  { icon: "名", title: "姓名测试", desc: "五格剖象 · 三才配置", href: "/name" },
  { icon: "运", title: "每日运势", desc: "今日吉凶 · 宜忌指引", href: "/daily" },
  { icon: "塔", title: "塔罗占卜", desc: "78 张 · 多种牌阵", href: "/tarot" },
  { icon: "签", title: "抽签解签", desc: "摇一签 · 解一卦", href: "/lottery" },
];

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-lg font-medium" style={{ color: "var(--accent)" }}>
            灵犀 · 占卜
          </span>
          <span className="hidden text-xs sm:inline" style={{ color: "var(--text-faint)" }}>
            周易六爻 · 塔罗星盘
          </span>
        </div>
        <ThemeToggle />
      </header>

      <section className="mx-auto max-w-3xl px-5 pb-8 pt-10 text-center sm:pt-14">
        <h1 className="font-serif text-2xl font-medium sm:text-3xl">今日宜问，所问有应</h1>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-sub)" }}>
          五法占断，一事一问。先静心，再起卦。
        </p>
      </section>

      <section className="mx-auto grid max-w-3xl grid-cols-2 gap-3 px-5 sm:grid-cols-3">
        {PLAYS.map((p) => (
          <PlayCard key={p.href} {...p} />
        ))}
      </section>

      <footer className="mx-auto max-w-3xl px-5 py-10 text-center text-xs leading-relaxed" style={{ color: "var(--text-faint)" }}>
        <p>本服务为传统文化娱乐参考，不构成医疗、投资、婚恋或任何决策依据。</p>
        <p className="mt-1 opacity-70">心诚则灵——结果请以自己的判断为准。</p>
      </footer>
    </main>
  );
}
