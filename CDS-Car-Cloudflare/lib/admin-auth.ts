import { env } from "cloudflare:workers";

export function requireAdmin(request: Request) {
  const email = request.headers
    .get("cf-access-authenticated-user-email")
    ?.trim()
    .toLowerCase();
  const allowed = String(env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!email || allowed.length === 0 || !allowed.includes(email)) {
    return null;
  }

  return { email };
}
