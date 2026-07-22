import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const creditAllocationsTable = pgTable("credit_allocations", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").notNull(),
  modelRunId: integer("model_run_id").notNull(),
  registry: text("registry").notNull(),
  netCo2e: real("net_co2e").notNull(),
  creditValue: real("credit_value"),
  revenueUsd: real("revenue_usd"),
  status: text("status").notNull().default("pending"),
  registryRefId: text("registry_ref_id"),
  exportedAt: timestamp("exported_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCreditAllocationSchema = createInsertSchema(creditAllocationsTable).omit({ id: true, createdAt: true });
export type InsertCreditAllocation = z.infer<typeof insertCreditAllocationSchema>;
export type CreditAllocation = typeof creditAllocationsTable.$inferSelect;
