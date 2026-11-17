import Link from "next/link";

export function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "lg" ? "h-14 w-14 text-2xl" : size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  return (
    <span
      className={`brand-mark inline-grid place-items-center rounded-[0.9rem] font-display font-bold tracking-tight ${dims}`}
      aria-hidden
    >
      O
    </span>
  );
}

export function HubNav({ active }: { active: "home" | "vault" | "links" }) {
  const items = [
    { id: "home" as const, href: "/hub", label: "Home" },
    { id: "vault" as const, href: "/hub/vault", label: "Vault" },
    { id: "links" as const, href: "/hub/links", label: "Links" },
  ];

  return (
    <nav className="hub-nav" aria-label="Hub">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={active === item.id ? "is-active" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function NoticeBanner() {
  return (
    <aside className="notice-banner" role="note">
      <strong>Device limits still apply.</strong> Orbit cannot override Screen
      Time or app limits. Deep links only open apps that are already installed,
      and some platforms may restrict them. Follow your device and household
      rules.
    </aside>
  );
}
