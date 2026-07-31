import { clearAdminCookie } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const response = Response.redirect(new URL("/admin/login", request.url), 303);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Set-Cookie", clearAdminCookie());
  return response;
}
