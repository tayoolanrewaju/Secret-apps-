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
            <span className="eyebrow">Your private social hub</span>
            <h1>Orbit</h1>
            <p>
              Quick access to Snapchat, TikTok, and Instagram — with deep-link
              launches, a PIN-locked credential vault, and rotatable entry
              links.
            </p>
            <div className="cta-row">
              <Link href="/hub" className="btn-primary">
                Open your hub
              </Link>
              <a href="#features" className="btn-ghost">
                How it works
              </a>
            </div>
          </div>

          <p className="landing-foot">
            Built for personal use. Device Screen Time and household rules still
            apply — Orbit cannot override them. Deep links only work when the
            official apps are installed.
          </p>
        </div>
      </section>

      <section id="features" className="feature-strip">
        <article>
          <h2>Deep-link launching</h2>
          <p>
            Each icon tries the official app URL first, then falls back to the
            web if the app is missing or the OS blocks the launch.
          </p>
        </article>
        <article>
          <h2>Credential vault</h2>
          <p>
            Your Cursor sign-in is the hub account. Inside, a master PIN encrypts
            each platform login before it is stored server-side.
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
