import Link from "next/link";

export interface PlayCardProps {
  icon: string;
  title: string;
  desc: string;
  href: string;
}

// 玩法导航卡片：主题表面 + 主题色图标 + 宋体标题
export function PlayCard({ icon, title, desc, href }: PlayCardProps) {
  return (
    <Link
      href={href}
      className="wb-card wb-card-hover block rounded-2xl border p-4 transition-opacity hover:opacity-85"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full font-serif text-sm font-medium"
        style={{ background: "var(--accent)", color: "var(--bg)" }}
      >
        {icon}
      </span>
      <div className="mt-2 font-serif font-medium" style={{ color: "var(--accent)" }}>
        {title}
      </div>
      <div className="mt-1 text-xs" style={{ color: "var(--text-sub)" }}>
        {desc}
      </div>
    </Link>
  );
}
