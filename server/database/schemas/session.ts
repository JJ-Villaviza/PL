import { relations } from "drizzle-orm";
import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { branchTable } from ".";

export const sessionTable = pgTable("session", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: uuid("token").notNull().unique(),

  branchId: uuid("branch_id").notNull(),

  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const sessionRelation = relations(sessionTable, ({ one }) => ({
  branch: one(branchTable, {
    fields: [sessionTable.branchId],
    references: [branchTable.id],
  }),
}));
