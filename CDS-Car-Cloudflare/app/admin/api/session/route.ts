import { requireAdmin } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = requireAdmin(request);
  if (!admin) return Response.json({ error: "Não autorizado" }, { status: 401 });
  return Response.json(admin, { headers: { "Cache-Control": "no-store" } });
}
