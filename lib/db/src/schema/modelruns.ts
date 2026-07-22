import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const modelRunsTable = pgTable("model_runs", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").notNull(),
  registry: text("registry").notNull(),
  biomassCarbonFraction: real("biomass_carbon_fraction").notNull().default(0),
  pyrolysisRetentionFactor: real("pyrolysis_retention_factor").notNull().default(0),
  grossCo2e: real("gross_co2e").notNull().default(0),
  permanenceDiscount: real("permanence_discount").notNull().default(0),
  netCo2e: real("net_co2e").notNull().default(0),
  estimatedCreditValue: real("estimated_credit_value"),
  eligibility: text("eligibility").notNull().default("conditional"),
  eligibilityNotes: text("eligibility_notes"),
  creditPrice: real("credit_price"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertModelRunSchema = createInsertSchema(modelRunsTable).omit({ id: true, createdAt: true });
export type InsertModelRun = z.infer<typeof insertModelRunSchema>;
export type ModelRun = typeof modelRunsTable.$inferSelect;
