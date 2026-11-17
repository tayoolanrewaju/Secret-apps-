"use client";

import { useEffect, useState } from "react";

type HubLink = {
  id: string;
  slug: string;
  active: boolean;
  path: string;
  createdAt?: string;
};

async function fetchLinks(): Promise<HubLink[]> {
  const res = await fetch("/api/links", { cache: "no-store" });
  if (!res.ok) throw new Error("load_failed");
  const data = await res.json();
  return data.links ?? [];
}

export function LinksPanel() {
  const [links, setLinks] = useState<HubLink[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    try {
      setLinks(await fetchLinks());
    } catch {
      setMessage("Could not load your custom links.");
      setLinks([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createLink() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/links", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(
          data.error === "limit_reached"
            ? "You already have the maximum number of links."
            : "Could not create a link.",
        );
        return;
      }
      await load();
      setMessage("New entry link ready.");
    } finally {
      setBusy(false);
    }
  }

  async function setActive(id: string, active: boolean) {
    setBusy(true);
    try {
      await fetch("/api/links", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, active }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function copyPath(path: string) {
    const url = `${window.location.origin}${path}`;
    await navigator.clipboard.writeText(url);
    setCopied(path);
    window.setTimeout(() => setCopied(null), 1400);
  }

  return (
    <div className="links-layout">
      <div className="panel-form">
        <h2>Rotatable entry links</h2>
        <p className="muted">
          Generate unique URLs that open the same private hub. Rotate whenever
          you want a fresh personal address. Old links can be turned off.
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => void createLink()}
          disabled={busy}
        >
          {busy ? "Working…" : "Generate new link"}
        </button>
        {message ? <p className="soft-text">{message}</p> : null}
      </div>

      <section className="credential-list">
        <h2>Your links</h2>
        {links === null ? (
          <div>
            <p className="muted">Loading links…</p>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => void load()}
            >
              Retry
            </button>
          </div>
        ) : links.length === 0 ? (
          <p className="muted">No custom links yet.</p>
        ) : (
          links.map((link) => (
            <article key={link.id} className="credential-row">
              <div>
                <h3 className="mono-path">{link.path}</h3>
                <p className="muted">{link.active ? "Active" : "Retired"}</p>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => void copyPath(link.path)}
              >
                {copied === link.path ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => void setActive(link.id, !link.active)}
              >
                {link.active ? "Retire" : "Reactivate"}
              </button>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
