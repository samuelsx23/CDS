import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";
import { defaultVehicles, type Vehicle } from "../lib/site-data";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}

export function getRawDb(): D1Database {
  if (!env.DB) {
    throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  }
  return env.DB;
}

let schemaReady = false;

export async function ensureSiteSchema() {
  if (schemaReady) return;
  const d1 = getRawDb();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS vehicles (
      id integer PRIMARY KEY NOT NULL,
      brand text NOT NULL,
      model text NOT NULL,
      version text NOT NULL,
      price integer NOT NULL,
      year integer NOT NULL,
      km integer NOT NULL,
      color text NOT NULL,
      transmission text NOT NULL,
      fuel text NOT NULL,
      image text NOT NULL,
      featured integer DEFAULT false NOT NULL,
      updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS media_assets (
      id text PRIMARY KEY NOT NULL,
      vehicle_id integer NOT NULL,
      content_type text NOT NULL,
      size integer NOT NULL,
      uploaded_by text NOT NULL,
      data blob NOT NULL,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`),
    d1.prepare("CREATE INDEX IF NOT EXISTS media_assets_vehicle_id_idx ON media_assets (vehicle_id)"),
  ]);
  schemaReady = true;
}

export async function seedVehiclesIfEmpty() {
  await ensureSiteSchema();
  const d1 = getRawDb();
  const count = (await d1
    .prepare("SELECT COUNT(*) AS total FROM vehicles")
    .first()) as { total?: number } | null;
  if (Number(count?.total ?? 0) > 0) return;

  await d1.batch(
    defaultVehicles.map((vehicle) =>
      d1
        .prepare(
          `INSERT INTO vehicles
            (id, brand, model, version, price, year, km, color, transmission, fuel, image, featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          vehicle.id,
          vehicle.brand,
          vehicle.model,
          vehicle.version,
          vehicle.price,
          vehicle.year,
          vehicle.km,
          vehicle.color,
          vehicle.transmission,
          vehicle.fuel,
          vehicle.image,
          vehicle.featured ? 1 : 0,
        ),
    ),
  );
}

type VehicleRow = Omit<Vehicle, "featured"> & { featured: number };

export async function listVehicles(): Promise<Vehicle[]> {
  await seedVehiclesIfEmpty();
  const result = (await getRawDb()
    .prepare(
      `SELECT id, brand, model, version, price, year, km, color,
              transmission, fuel, image, featured
       FROM vehicles
       ORDER BY featured DESC, id DESC`,
    )
    .all()) as { results?: VehicleRow[] };

  return (result.results ?? []).map((vehicle: VehicleRow) => ({
    ...vehicle,
    featured: Boolean(vehicle.featured),
  }));
}

export async function updateVehicle(vehicle: Vehicle) {
  await getRawDb()
    .prepare(
      `UPDATE vehicles
       SET brand = ?, model = ?, version = ?, price = ?, year = ?, km = ?,
           color = ?, transmission = ?, fuel = ?, image = ?, featured = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
    .bind(
      vehicle.brand,
      vehicle.model,
      vehicle.version,
      vehicle.price,
      vehicle.year,
      vehicle.km,
      vehicle.color,
      vehicle.transmission,
      vehicle.fuel,
      vehicle.image,
      vehicle.featured ? 1 : 0,
      vehicle.id,
    )
    .run();
}
