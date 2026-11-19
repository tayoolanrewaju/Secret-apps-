"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createSalt,
  decryptPayload,
  encryptPayload,
  VERIFIER_PAYLOAD,
} from "@/lib/crypto";
import { readApiError } from "@/lib/api-error";
import { PLATFORMS, type PlatformId } from "@/lib/platforms";
import { getVaultPin, setVaultPin } from "@/lib/vault-session";

type VaultState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "needs_setup" }
  | {
      status: "locked";
      salt: string;
      verifierCiphertext: string;
      verifierIv: string;
    }
  | { status: "unlocked"; salt: string; pin: string };

type StoredCredential = {
  id: string;
  platform: PlatformId;
  label: string;
  ciphertext: string;
  iv: string;
};

type Revealed = {
  username: string;
  password: string;
};

async function readVaultState(): Promise<VaultState> {
  const res = await fetch("/api/vault", { cache: "no-store" });
  if (!res.ok) {
    return {
      status: "error",
      message: "Could not reach your vault. Sign in and try again.",
    };
  }
  const data = await res.json();
  if (!data.configured) return { status: "needs_setup" };

  const savedPin = getVaultPin();
  if (savedPin) {
    try {
      await decryptPayload(
        savedPin,
        data.salt,
        data.verifierCiphertext,
        data.verifierIv,
      );
      return { status: "unlocked", salt: data.salt, pin: savedPin };
    } catch {
      setVaultPin(null);
    }
  }

  return {
    status: "locked",
    salt: data.salt,
    verifierCiphertext: data.verifierCiphertext,
    verifierIv: data.verifierIv,
  };
}

async function readCredentials(): Promise<StoredCredential[]> {
  const res = await fetch("/api/credentials", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.credentials ?? [];
}

export function VaultPanel() {
  const [vault, setVault] = useState<VaultState>({ status: "loading" });
  const [credentials, setCredentials] = useState<StoredCredential[]>([]);
  const [revealed, setRevealed] = useState<
    Partial<Record<PlatformId, Revealed>>
  >({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [setupPin, setSetupPin] = useState("");
  const [unlockPin, setUnlockPin] = useState("");
  const [form, setForm] = useState({
    platform: "snapchat" as PlatformId,
    label: "",
    username: "",
    password: "",
  });

  async function refreshVault() {
    setVault({ status: "loading" });
    setMessage(null);
    try {
      const next = await readVaultState();
      setVault(next);
      if (next.status === "unlocked") {
        setCredentials(await readCredentials());
      }
    } catch {
      setVault({
        status: "error",
        message: "Could not reach your vault. Sign in and try again.",
      });
    }
  }

  useEffect(() => {
    void refreshVault();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savedPlatforms = useMemo(
    () => new Set(credentials.map((item) => item.platform)),
    [credentials],
  );

  async function setupVault(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{4}$/.test(setupPin)) {
      setMessage("Choose a 4-digit PIN.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const salt = createSalt();
      const verifier = await encryptPayload(setupPin, salt, VERIFIER_PAYLOAD);
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          salt,
          verifierCiphertext: verifier.ciphertext,
          verifierIv: verifier.iv,
        }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not create the vault."));
        return;
      }
      setVaultPin(setupPin);
      setVault({ status: "unlocked", salt, pin: setupPin });
      setCredentials([]);
      setSetupPin("");
    } catch {
      setMessage("Could not create the vault. Try again.");
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
        unlockPin,
        vault.salt,
        vault.verifierCiphertext,
        vault.verifierIv,
      );
      setVaultPin(unlockPin);
      setVault({ status: "unlocked", salt: vault.salt, pin: unlockPin });
      setCredentials(await readCredentials());
      setUnlockPin("");
    } catch {
      setMessage("Wrong PIN. Your vault stays locked.");
    } finally {
      setBusy(false);
    }
  }

  function lockVault() {
    setVaultPin(null);
    setRevealed({});
    setCredentials([]);
    void refreshVault();
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
          platform: form.platform,
          label: form.label.trim(),
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv,
        }),
      });
      if (!res.ok) throw new Error("save_failed");
      setForm((current) => ({
        ...current,
        username: "",
        password: "",
        label: "",
      }));
      setMessage("Saved securely in your vault.");
      setCredentials(await readCredentials());
    } catch {
      setMessage("Could not save those credentials.");
    } finally {
      setBusy(false);
    }
  }

  async function reveal(platform: PlatformId) {
    if (vault.status !== "unlocked") return;
    const row = credentials.find((item) => item.platform === platform);
    if (!row) return;
    try {
      const payload = await decryptPayload<Revealed>(
        vault.pin,
        vault.salt,
        row.ciphertext,
        row.iv,
      );
      setRevealed((current) => ({ ...current, [platform]: payload }));
    } catch {
      setMessage("Could not decrypt that entry. Unlock again.");
    }
  }

  async function removeCredential(platform: PlatformId) {
    setBusy(true);
    try {
      await fetch(`/api/credentials?platform=${platform}`, {
        method: "DELETE",
      });
      setRevealed((current) => {
        const next = { ...current };
        delete next[platform];
        return next;
      });
      setCredentials(await readCredentials());
    } finally {
      setBusy(false);
    }
  }

  if (vault.status === "loading") {
    return (
      <div className="panel-form">
        <p className="muted">Opening vault…</p>
      </div>
    );
  }

  if (vault.status === "error") {
    return (
      <div className="panel-form">
        <p className="error-text">{vault.message}</p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => void refreshVault()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (vault.status === "needs_setup") {
    return (
      <form className="panel-form" onSubmit={setupVault}>
        <h2>Create your vault PIN</h2>
        <p className="muted">
          Your Cursor sign-in is the hub account. This master PIN encrypts
          Snapchat, TikTok, and Instagram logins in the browser before they are
          saved to your private vault. Orbit never sees your PIN or plain
          passwords.
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
            value={setupPin}
            onChange={(event) =>
              setSetupPin(event.target.value.replace(/\D/g, "").slice(0, 4))
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
    );
  }

  if (vault.status === "locked") {
    return (
      <form className="panel-form" onSubmit={unlockVault}>
        <h2>Unlock vault</h2>
        <p className="muted">
          Enter your 4-digit master PIN to view or edit saved logins.
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
            value={unlockPin}
            onChange={(event) =>
              setUnlockPin(event.target.value.replace(/\D/g, "").slice(0, 4))
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
    );
  }

  return (
    <div className="vault-layout">
      <div className="vault-toolbar">
        <p className="muted">Vault unlocked for this visit.</p>
        <button type="button" className="btn-ghost" onClick={lockVault}>
          Lock
        </button>
      </div>

      <form className="panel-form" onSubmit={saveCredential}>
        <h2>Save a login</h2>
        <label>
          Platform
          <select
            value={form.platform}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                platform: event.target.value as PlatformId,
              }))
            }
          >
            {PLATFORMS.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
                {savedPlatforms.has(platform.id) ? " (replace)" : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          Label
          <input
            value={form.label}
            onChange={(event) =>
              setForm((current) => ({ ...current, label: event.target.value }))
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

      <section className="credential-list">
        <h2>Saved accounts</h2>
        {credentials.length === 0 ? (
          <p className="muted">Nothing saved yet.</p>
        ) : (
          credentials.map((item) => {
            const platform = PLATFORMS.find((p) => p.id === item.platform);
            const open = revealed[item.platform];
            return (
              <article key={item.id} className="credential-row">
                <div>
                  <h3>{platform?.name ?? item.platform}</h3>
                  {item.label ? <p className="muted">{item.label}</p> : null}
                </div>
                {open ? (
                  <div className="revealed-block">
                    <p>
                      <span>User</span> {open.username}
                    </p>
                    <p>
                      <span>Pass</span> {open.password}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => void reveal(item.platform)}
                  >
                    Reveal
                  </button>
                )}
                <button
                  type="button"
                  className="btn-ghost danger"
                  onClick={() => void removeCredential(item.platform)}
                >
                  Remove
                </button>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
