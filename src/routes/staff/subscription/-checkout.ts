export function getPaystackAccessCode(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const checkout = value as Record<string, unknown>;
  const direct = checkout.access_code ?? checkout.accessCode;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const authorizationUrl =
    checkout.authorization_url ??
    checkout.authorizationUrl ??
    checkout.checkoutUrl ??
    checkout.paystackUrl ??
    checkout.url;
  if (typeof authorizationUrl !== "string") return null;

  try {
    const url = new URL(authorizationUrl);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "checkout.paystack.com" ||
      url.username ||
      url.password
    ) {
      return null;
    }

    // Paystack's standard checkout URL is /<access_code>.
    const code = url.pathname.slice(1);
    return /^[a-zA-Z0-9_-]+$/.test(code) ? code : null;
  } catch {
    return null;
  }
}
