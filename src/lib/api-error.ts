export async function readApiError(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string };
    switch (data.error) {
      case "csrf":
        return "Could not verify this request. Refresh and try again.";
      case "unauthorized":
        return "Sign in to Cursor to use the vault.";
      case "already_configured":
        return "Vault already exists. Unlock it with your PIN.";
      case "invalid_body":
        return "That PIN setup looked invalid. Try again.";
      case "vault_missing":
        return "Create your vault PIN first.";
      case "people_only":
        return "Open Orbit while signed in as yourself.";
      default:
        return fallback;
    }
  } catch {
    return fallback;
  }
}
