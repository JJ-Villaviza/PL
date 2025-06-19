import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { branchTable } from ".";

export const locationTable = pgTable("location", {
  id: uuid("id").primaryKey().defaultRandom(),
  address: text("address").notNull(),
  longitude: text("longitude").notNull(),
  latitude: text("latitude").notNull(),

  branchId: text("branch_id").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .$onUpdateFn(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const locationRelation = relations(locationTable, ({ one }) => ({
  branch: one(branchTable, {
    fields: [locationTable.branchId],
    references: [branchTable.id],
  }),
}));
