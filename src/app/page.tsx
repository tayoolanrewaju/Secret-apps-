import Link from "next/link";
import { BrandMark } from "@/components/site-chrome";
import { ViewerChip } from "@/components/viewer-chip";

export default function HomePage() {
  return (
    <>
      <section className="landing">
        <div className="landing-atmosphere" aria-hidden />
        <div className="landing-frame">
          <div className="landing-top">
            <div className="brand-lockup">
              <BrandMark />
              <span>Orbit</span>
            </div>
            <ViewerChip />
          </div>

          <div className="landing-hero">
            <span className="eyebrow">Private social hub</span>
            <h1>Orbit</h1>
            <p>
              One neat dock for Snapchat, TikTok, and Instagram — deep-link
              launches, a personal credential vault, and rotatable entry links.
            </p>
            <div className="cta-row">
              <Link href="/hub" className="btn-primary">
                Open your hub
              </Link>
              <a href="#features" className="btn-ghost">
                See what’s inside
              </a>
            </div>
          </div>

          <p className="landing-foot">
            Built for personal use. Device Screen Time and household rules still
            apply — Orbit cannot override them.
          </p>
        </div>
      </section>

      <section id="features" className="feature-strip">
        <article>
          <h2>Deep-link launching</h2>
          <p>
            Each icon tries the official app URL first, so installed apps can
            open directly instead of the mobile website.
          </p>
        </article>
        <article>
          <h2>Credential vault</h2>
          <p>
            Store platform logins behind your own PIN. Secrets are encrypted in
            the browser before they ever reach storage.
          </p>
        </article>
        <article>
          <h2>Rotatable links</h2>
          <p>
            Mint fresh personal URLs that point to the same hub, and retire old
            ones whenever you want a new entry address.
          </p>
        </article>
      </section>
    </>
  );
}
