import { listVehicles, updateVehicle } from "../../../../db";
import { requireAdmin } from "../../../../lib/admin-auth";
import type { Vehicle } from "../../../../lib/site-data";

export const dynamic = "force-dynamic";

function isVehicle(value: unknown): value is Vehicle {
  if (!value || typeof value !== "object") return false;
  const vehicle = value as Partial<Vehicle>;
  return (
    Number.isInteger(vehicle.id) &&
    typeof vehicle.brand === "string" &&
    typeof vehicle.model === "string" &&
    typeof vehicle.version === "string" &&
    Number.isFinite(vehicle.price) &&
    Number.isInteger(vehicle.year) &&
    Number.isFinite(vehicle.km) &&
    typeof vehicle.color === "string" &&
    typeof vehicle.transmission === "string" &&
    typeof vehicle.fuel === "string" &&
    typeof vehicle.image === "string" &&
    typeof vehicle.featured === "boolean"
  );
}

export async function GET(request: Request) {
  const admin = requireAdmin(request);
  if (!admin) return Response.json({ error: "Não autorizado" }, { status: 401 });

  try {
    return Response.json({ vehicles: await listVehicles(), admin });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Banco indisponível" },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request) {
  const admin = requireAdmin(request);
  if (!admin) return Response.json({ error: "Não autorizado" }, { status: 401 });

  const payload = (await request.json()) as { vehicle?: unknown };
  if (!isVehicle(payload.vehicle)) {
    return Response.json({ error: "Dados do veículo inválidos" }, { status: 400 });
  }

  await updateVehicle(payload.vehicle);
  return Response.json({ vehicle: payload.vehicle });
}
