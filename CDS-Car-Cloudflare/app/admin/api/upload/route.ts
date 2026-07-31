import { env } from "cloudflare:workers";
import { getRawDb, seedVehiclesIfEmpty } from "../../../../db";
import { requireAdmin } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 1_500_000;

export async function POST(request: Request) {
  const admin = requireAdmin(request);
  if (!admin) return Response.json({ error: "Não autorizado" }, { status: 401 });
  if (!env.DB) return Response.json({ error: "Banco de imagens indisponível" }, { status: 503 });

  const form = await request.formData();
  const file = form.get("file");
  const vehicleId = Number(form.get("vehicleId"));

  if (!(file instanceof File) || !Number.isInteger(vehicleId)) {
    return Response.json({ error: "Selecione uma imagem válida" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "A imagem deve ter no máximo 1,5 MB após a otimização" }, { status: 400 });
  }

  const assetId = crypto.randomUUID();
  const image = `/media/${assetId}`;
  const bytes = await file.arrayBuffer();
  await seedVehiclesIfEmpty();
  const d1 = getRawDb();
  const current = (await d1.prepare("SELECT image FROM vehicles WHERE id = ?").bind(vehicleId).first()) as
    | { image: string }
    | null;
  if (!current) return Response.json({ error: "Veículo não encontrado" }, { status: 404 });

  const statements = [
    d1
      .prepare(
        `INSERT INTO media_assets
          (id, vehicle_id, content_type, size, uploaded_by, data)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(assetId, vehicleId, file.type, file.size, admin.email, bytes),
    d1
      .prepare("UPDATE vehicles SET image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(image, vehicleId),
  ];

  const previousAssetId = current.image.startsWith("/media/") ? current.image.slice("/media/".length) : "";
  if (previousAssetId && !previousAssetId.includes("/")) {
    statements.push(d1.prepare("DELETE FROM media_assets WHERE id = ?").bind(previousAssetId));
  }
  await d1.batch(statements);

  return Response.json({ image });
}
