import {
  clearAdminCookie,
  createAdminCookie,
  requireAdmin,
  validateAdminPassword,
} from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = requireAdmin(request);
  if (!admin) return Response.json({ error: "Não autorizado" }, { status: 401 });
  return Response.json(admin, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const cookie = createAdminCookie();
  if (!cookie) {
    return Response.json(
      { error: "O acesso administrativo ainda não foi configurado." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!validateAdminPassword(password)) {
    return Response.json(
      { error: "Senha incorreta. Verifique e tente novamente." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store", "Set-Cookie": cookie } },
  );
}

export async function DELETE() {
  return Response.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store", "Set-Cookie": clearAdminCookie() } },
  );
}
