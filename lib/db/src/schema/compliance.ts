import { pgTable, text, serial, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const complianceDeadlinesTable = pgTable("compliance_deadlines", {
  id: serial("id").primaryKey(),
  siteId: integer("site_id").notNull(),
  batchId: integer("batch_id"),
  registry: text("registry").notNull(),
  deadlineType: text("deadline_type").notNull(),
  title: text("title").notNull(),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  status: text("status").notNull().default("upcoming"),
  assignedTo: text("assigned_to"),
  reminderDays: integer("reminder_days").notNull().default(7),
  conflictsWith: integer("conflicts_with"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertComplianceDeadlineSchema = createInsertSchema(complianceDeadlinesTable).omit({ id: true, createdAt: true });
export type InsertComplianceDeadline = z.infer<typeof insertComplianceDeadlineSchema>;
export type ComplianceDeadline = typeof complianceDeadlinesTable.$inferSelect;
