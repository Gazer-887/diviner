import Link from "next/link";

// 自定义 404 页面：兜底「传统文化娱乐参考」免责声明 + 返回首页链接
// 静态导出（output: export）下 Next.js 会预渲染此页面到 out/404.html
export default function NotFound() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-5 text-center"
      style={{ color: "var(--text)" }}
    >
      <div
        className="font-serif text-5xl font-medium sm:text-6xl"
        style={{ color: "var(--accent)" }}
      >
        404
      </div>
      <h1 className="mt-3 font-serif text-xl sm:text-2xl">此签未现</h1>
      <p
        className="mt-3 max-w-md text-sm leading-relaxed"
        style={{ color: "var(--text-sub)" }}
      >
        您所寻的页面不在签筒之中。或许它去了别处——
        不如回到首页，再起一卦。
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl border px-5 py-2 text-sm transition-opacity hover:opacity-80"
        style={{ borderColor: "var(--border)", color: "var(--accent)" }}
      >
        ← 回到首页
      </Link>
      <p
        className="mt-10 max-w-sm text-xs leading-relaxed"
        style={{ color: "var(--text-faint)" }}
      >
        本服务为传统文化娱乐参考，不构成医疗、投资、婚恋或任何决策依据。
      </p>
    </main>
  );
}