import { pgTable, text, serial, timestamp, integer, real, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const labCertificatesTable = pgTable("lab_certificates", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").notNull(),
  labName: text("lab_name").notNull(),
  certificateRef: text("certificate_ref"),
  hCorgRatio: real("h_corg_ratio").notNull(),
  organicCarbonPercent: real("organic_carbon_percent").notNull(),
  ashPercent: real("ash_percent").notNull(),
  phValue: real("ph_value"),
  electricalConductivity: real("electrical_conductivity"),
  sampleDate: date("sample_date", { mode: "string" }),
  status: text("status").notNull().default("pending"),
  ocrExtracted: boolean("ocr_extracted").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLabCertificateSchema = createInsertSchema(labCertificatesTable).omit({ id: true, createdAt: true });
export type InsertLabCertificate = z.infer<typeof insertLabCertificateSchema>;
export type LabCertificate = typeof labCertificatesTable.$inferSelect;
