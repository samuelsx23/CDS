import { defaultVehicles } from "../../../lib/site-data";
import { listVehicles } from "../../../db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const vehicles = await listVehicles();
    return Response.json(
      { vehicles, source: "database" },
      { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=300" } },
    );
  } catch {
    return Response.json(
      { vehicles: defaultVehicles, source: "fallback" },
      { headers: { "Cache-Control": "public, max-age=10" } },
    );
  }
}
