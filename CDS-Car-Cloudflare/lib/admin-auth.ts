import { env } from "cloudflare:workers";

export const ADMIN_COOKIE_NAME = "cds_admin_session";

function constantTimeEqual(left: string, right: string) {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  if (!match) return "";
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return "";
  }
}

function getAdminEmail() {
  return String(env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .find(Boolean) ?? "administrador@cdscar.com.br";
}

export function validateAdminPassword(password: string) {
  const expected = String(env.ADMIN_PASSWORD ?? "");
  return expected.length >= 12 && constantTimeEqual(password, expected);
}

export function createAdminCookie() {
  const secret = String(env.ADMIN_SESSION_SECRET ?? "");
  if (secret.length < 32) return null;
  return `${ADMIN_COOKIE_NAME}=${encodeURIComponent(secret)}; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=28800`;
}

export function clearAdminCookie() {
  return `${ADMIN_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/admin; Max-Age=0`;
}

export function requireAdmin(request: Request) {
  const expected = String(env.ADMIN_SESSION_SECRET ?? "");
  const session = getCookie(request, ADMIN_COOKIE_NAME);

  if (expected.length < 32 || !constantTimeEqual(session, expected)) {
    return null;
  }

  return { email: getAdminEmail() };
}
