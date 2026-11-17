import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark, HubNav, NoticeBanner } from "@/components/site-chrome";

export function HubShell({
  title,
  subtitle,
  active,
  children,
}: {
  title: string;
  subtitle: string;
  active: "home" | "vault" | "links";
  children: ReactNode;
}) {
  return (
    <div className="hub-shell">
      <header className="hub-header">
        <Link href="/" className="brand-lockup">
          <BrandMark size="sm" />
          <span>Orbit</span>
        </Link>
        <HubNav active={active} />
      </header>
      <main className="hub-main">
        <div className="hub-heading">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
        <NoticeBanner />
      </main>
    </div>
  );
}
