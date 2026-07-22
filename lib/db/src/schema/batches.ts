import { pgTable, text, serial, timestamp, integer, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const batchesTable = pgTable("batches", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").notNull(),
  batchCode: text("batch_code").notNull(),
  description: text("description"),
  stage: text("stage").notNull().default("collect"),
  status: text("status").notNull().default("in_progress"),
  productionDate: date("production_date", { mode: "string" }),
  totalBiomassKg: real("total_biomass_kg"),
  totalBiocharKg: real("total_biochar_kg"),
  estimatedCo2e: real("estimated_co2e"),
  permanenceDiscount: real("permanence_discount"),
  netCo2e: real("net_co2e"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBatchSchema = createInsertSchema(batchesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batchesTable.$inferSelect;
