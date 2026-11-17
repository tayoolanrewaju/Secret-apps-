/** In-memory vault PIN for the current tab. Cleared on reload (no sessionStorage). */
let unlockPin: string | null = null;

export function getVaultPin(): string | null {
  return unlockPin;
}

export function setVaultPin(pin: string | null): void {
  unlockPin = pin;
}
