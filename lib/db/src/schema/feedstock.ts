import { pgTable, text, serial, timestamp, integer, real, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const feedstockEntriesTable = pgTable("feedstock_entries", {
  id: serial("id").primaryKey(),
  batchId: integer("batch_id").notNull(),
  biomassSource: text("biomass_source").notNull(),
  biomassType: text("biomass_type").notNull(),
  quantityKg: real("quantity_kg").notNull(),
  moisturePercent: real("moisture_percent"),
  supplier: text("supplier"),
  collectionDate: date("collection_date", { mode: "string" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFeedstockEntrySchema = createInsertSchema(feedstockEntriesTable).omit({ id: true, createdAt: true });
export type InsertFeedstockEntry = z.infer<typeof insertFeedstockEntrySchema>;
export type FeedstockEntry = typeof feedstockEntriesTable.$inferSelect;
