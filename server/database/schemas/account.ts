import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { branchTable, companyTable } from ".";

export const accountTable = pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  password: text("password").notNull(),

  companyId: uuid("company_id").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const accountRelation = relations(accountTable, ({ one }) => ({
  branch: one(branchTable, {
    fields: [accountTable.id],
    references: [branchTable.accountId],
  }),
  company: one(companyTable, {
    fields: [accountTable.companyId],
    references: [companyTable.id],
  }),
}));
