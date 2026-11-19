"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import {
  createSalt,
  decryptPayload,
  encryptPayload,
  VERIFIER_PAYLOAD,
} from "@/lib/crypto";
import type { Platform } from "@/lib/platforms";
import { getVaultPin, setVaultPin } from "@/lib/vault-session";

type VaultState =
  | { status: "loading" }
  | { status: "needs_setup" }
  | {
      status: "locked";
      salt: string;
      verifierCiphertext: string;
      verifierIv: string;
    }
  | { status: "unlocked"; salt: string; pin: string };

type StoredCredential = {
  platform: string;
  label: string;
  ciphertext: string;
  iv: string;
};

type Revealed = { username: string; password: string };

export function PlatformAppPanel({ platform }: { platform: Platform }) {
  const [vault, setVault] = useState<VaultState>({ status: "loading" });
  const [credential, setCredential] = useState<StoredCredential | null>(null);
  const [revealed, setRevealed] = useState<Revealed | null>(null);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", label: "" });

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/vault", { cache: "no-store" });
      if (!res.ok) {
        setVault({ status: "needs_setup" });
        return;
      }
      const data = await res.json();
      if (!data.configured) {
        setVault({ status: "needs_setup" });
        return;
      }

      const savedPin = getVaultPin();
      if (savedPin) {
        try {
          await decryptPayload(
            savedPin,
            data.salt,
            data.verifierCiphertext,
            data.verifierIv,
          );
          setVault({ status: "unlocked", salt: data.salt, pin: savedPin });
          return;
        } catch {
          setVaultPin(null);
        }
      }

      setVault({
        status: "locked",
        salt: data.salt,
        verifierCiphertext: data.verifierCiphertext,
        verifierIv: data.verifierIv,
      });
    })();
  }, []);

  useEffect(() => {
    if (vault.status !== "unlocked") {
      setCredential(null);
      setRevealed(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/credentials", { cache: "no-store" });
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (cancelled) return;
      const row = (data.credentials as StoredCredential[] | undefined)?.find(
        (item) => item.platform === platform.id,
      );
      setCredential(row ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [vault, platform.id]);

  async function setupVault(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      setMessage("Choose a 4-digit PIN.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const salt = createSalt();
      const verifier = await encryptPayload(pin, salt, VERIFIER_PAYLOAD);
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          salt,
          verifierCiphertext: verifier.ciphertext,
          verifierIv: verifier.iv,
        }),
      });
      if (!res.ok) throw new Error("setup_failed");
      setVaultPin(pin);
      setVault({ status: "unlocked", salt, pin });
      setPin("");
    } catch {
      setMessage("Could not create the vault.");
    } finally {
      setBusy(false);
    }
  }

  async function unlockVault(event: FormEvent) {
    event.preventDefault();
    if (vault.status !== "locked") return;
    setBusy(true);
    setMessage(null);
    try {
      await decryptPayload(
        pin,
        vault.salt,
        vault.verifierCiphertext,
        vault.verifierIv,
      );
      setVaultPin(pin);
      setVault({ status: "unlocked", salt: vault.salt, pin });
      setPin("");
    } catch {
      setMessage("Wrong PIN.");
    } finally {
      setBusy(false);
    }
  }

  async function saveCredential(event: FormEvent) {
    event.preventDefault();
    if (vault.status !== "unlocked") return;
    if (!form.username.trim() || !form.password) {
      setMessage("Add both a username and password.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const encrypted = await encryptPayload(vault.pin, vault.salt, {
        username: form.username.trim(),
        password: form.password,
      });
      const res = await fetch("/api/credentials", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          platform: platform.id,
          label: form.label.trim(),
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
        }),
      });
      if (!res.ok) throw new Error("save_failed");
      setCredential({
        platform: platform.id,
        label: form.label.trim(),
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
      });
      setForm({ username: "", password: "", label: "" });
      setMessage("Saved.");
    } catch {
      setMessage("Could not save those credentials.");
    } finally {
      setBusy(false);
    }
  }

  async function reveal() {
    if (vault.status !== "unlocked" || !credential) return;
    try {
      const payload = await decryptPayload<Revealed>(
        vault.pin,
        vault.salt,
        credential.ciphertext,
        credential.iv,
      );
      setRevealed(payload);
    } catch {
      setMessage("Could not decrypt. Unlock again.");
    }
  }

  return (
    <div className="platform-app">
      <div
        className="platform-stage"
        style={{ "--accent": platform.accent } as CSSProperties}
      >
        <div className="platform-app-hero">
          <span
            className="platform-orb platform-app-mark"
            style={
              platform.id === "snapchat" ? { color: "#132833" } : undefined
            }
            aria-hidden
          >
            {platform.mark}
          </span>
          <div>
            <p className="eyebrow">{platform.name}</p>
            <h2 className="platform-app-title">{platform.name}</h2>
          </div>
        </div>
        <p>
          You’re still in Orbit. This is your {platform.name} space on this
          site — reveal a saved login or store a new one below.
        </p>
      </div>

      <div className="platform-app-actions">
        <Link href="/hub" className="btn-ghost">
          Back to dock
        </Link>
        <Link href="/hub/vault" className="btn-ghost">
          Full vault
        </Link>
      </div>

      {vault.status === "loading" ? (
        <div className="panel-form">
          <p className="muted">Opening vault…</p>
        </div>
      ) : null}

      {vault.status === "needs_setup" ? (
        <form className="panel-form" onSubmit={setupVault}>
          <h2>Create vault PIN</h2>
          <p className="muted">
            One 4-digit master PIN protects every platform login saved in Orbit.
          </p>
          <label>
            Master PIN
            <input
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              pattern="\d{4}"
              maxLength={4}
              minLength={4}
              value={pin}
              onChange={(event) =>
                setPin(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="4 digits"
              required
            />
          </label>
          {message ? <p className="error-text">{message}</p> : null}
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Creating…" : "Create vault"}
          </button>
        </form>
      ) : null}

      {vault.status === "locked" ? (
        <form className="panel-form" onSubmit={unlockVault}>
          <h2>Unlock vault</h2>
          <p className="muted">
            Enter your 4-digit master PIN to use {platform.name} credentials
            here.
          </p>
          <label>
            Master PIN
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              pattern="\d{4}"
              maxLength={4}
              minLength={4}
              value={pin}
              onChange={(event) =>
                setPin(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="4 digits"
              required
            />
          </label>
          {message ? <p className="error-text">{message}</p> : null}
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Checking…" : "Unlock"}
          </button>
        </form>
      ) : null}

      {vault.status === "unlocked" ? (
        <div className="vault-layout">
          <section className="panel-form">
            <h2>Saved login</h2>
            {!credential ? (
              <p className="muted">Nothing saved for {platform.name} yet.</p>
            ) : revealed ? (
              <div className="revealed-block">
                {credential.label ? (
                  <p>
                    <span>Label</span> {credential.label}
                  </p>
                ) : null}
                <p>
                  <span>User</span> {revealed.username}
                </p>
                <p>
                  <span>Pass</span> {revealed.password}
                </p>
              </div>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => void reveal()}
              >
                Reveal login
              </button>
            )}
          </section>

          <form className="panel-form" onSubmit={saveCredential}>
            <h2>{credential ? "Replace login" : "Save login"}</h2>
            <label>
              Label
              <input
                value={form.label}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
                placeholder="Optional note"
              />
            </label>
            <label>
              Username
              <input
                value={form.username}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                autoComplete="username"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                autoComplete="new-password"
                required
              />
            </label>
            {message ? <p className="soft-text">{message}</p> : null}
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Saving…" : "Save credentials"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
