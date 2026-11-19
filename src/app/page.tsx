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
              Snapchat, TikTok, and Instagram in one place — each opens as a
              page inside Orbit, with a PIN vault for your logins.
            </p>
            <div className="cta-row">
              <a href="/hub" className="btn-primary">
                Open your hub
              </a>
              <a href="#features" className="btn-ghost">
                How it works
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="feature-strip">
        <article>
          <h2>Stay on Orbit</h2>
          <p>
            Tap a platform and open its page on this site. Nothing jumps out to
            another app.
          </p>
        </article>
        <article>
          <h2>Credential vault</h2>
          <p>
            Your Cursor sign-in is the hub account. A master PIN encrypts each
            platform login before it is stored.
          </p>
        </article>
        <article>
          <h2>Rotatable links</h2>
          <p>
            Mint personal URLs that open the same hub, and retire them whenever
            you want a fresh entry address.
          </p>
        </article>
      </section>
    </>
  );
}
