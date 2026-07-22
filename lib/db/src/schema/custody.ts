import { pgTable, text, serial, timestamp, integer, real, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const custodyRecordsTable = pgTable("custody_records", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").notNull(),
  custodyType: text("custody_type").notNull(),
  party: text("party").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  destinationSite: text("destination_site"),
  transportMethod: text("transport_method"),
  quantityKg: real("quantity_kg"),
  evidenceRef: text("evidence_ref"),
  verified: boolean("verified").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCustodyRecordSchema = createInsertSchema(custodyRecordsTable).omit({ id: true, createdAt: true });
export type InsertCustodyRecord = z.infer<typeof insertCustodyRecordSchema>;
export type CustodyRecord = typeof custodyRecordsTable.$inferSelect;
