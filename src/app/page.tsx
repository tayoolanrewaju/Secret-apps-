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
              Quick access to Snapchat, TikTok, and Instagram — each opens as
              its own page inside Orbit, with a PIN-locked credential vault and
              rotatable entry links.
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
        </div>
      </section>

      <section id="features" className="feature-strip">
        <article>
          <h2>In-site app pages</h2>
          <p>
            Tap Snapchat, TikTok, or Instagram and stay on Orbit — each opens
            its own page on this site instead of leaving for another app.
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
