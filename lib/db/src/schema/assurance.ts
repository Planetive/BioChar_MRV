import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const assuranceIssuesTable = pgTable("assurance_issues", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").notNull(),
  siteId: integer("site_id"),
  issueType: text("issue_type").notNull(),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("open"),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: text("assigned_to"),
  autoSubstituted: boolean("auto_substituted").notNull().default(false),
  substituteValue: text("substitute_value"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedBy: text("resolved_by"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertAssuranceIssueSchema = createInsertSchema(assuranceIssuesTable).omit({ id: true, createdAt: true });
export type InsertAssuranceIssue = z.infer<typeof insertAssuranceIssueSchema>;
export type AssuranceIssue = typeof assuranceIssuesTable.$inferSelect;
