import { sql } from "drizzle-orm";
import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const vehicles = sqliteTable("vehicles", {
  id: integer("id").primaryKey(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  version: text("version").notNull(),
  price: integer("price").notNull(),
  year: integer("year").notNull(),
  km: integer("km").notNull(),
  color: text("color").notNull(),
  transmission: text("transmission").notNull(),
  fuel: text("fuel").notNull(),
  image: text("image").notNull(),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    vehicleId: integer("vehicle_id").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    uploadedBy: text("uploaded_by").notNull(),
    data: blob("data", { mode: "buffer" }).notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("media_assets_vehicle_id_idx").on(table.vehicleId)],
);
