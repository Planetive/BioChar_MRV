import { pgTable, text, serial, timestamp, integer, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productionRecordsTable = pgTable("production_records", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").notNull(),
  pyrolysisTemp: real("pyrolysis_temp").notNull(),
  residenceTimeMin: real("residence_time_min").notNull(),
  feedrateKgH: real("feedrate_kg_h"),
  outputBiocharKg: real("output_biochar_kg"),
  processingDate: date("processing_date", { mode: "string" }),
  operatorNotes: text("operator_notes"),
  equipmentId: text("equipment_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductionRecordSchema = createInsertSchema(productionRecordsTable).omit({ id: true, createdAt: true });
export type InsertProductionRecord = z.infer<typeof insertProductionRecordSchema>;
export type ProductionRecord = typeof productionRecordsTable.$inferSelect;
