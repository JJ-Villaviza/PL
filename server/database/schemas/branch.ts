import { relations } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { accountTable, companyTable, locationTable, sessionTable } from ".";

export const establishmentEnum = pgEnum("type", ["main", "branch"]);

export const branchTable = pgTable("branch", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  type: establishmentEnum().notNull(),
  status: boolean("status").notNull().default(true),

  accountId: uuid("account_id").notNull(),
  companyId: uuid("company_id").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .$onUpdateFn(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const branchRelation = relations(branchTable, ({ one }) => ({
  account: one(accountTable, {
    fields: [branchTable.accountId],
    references: [accountTable.id],
  }),
  company: one(companyTable, {
    fields: [branchTable.companyId],
    references: [companyTable.id],
  }),
  location: one(locationTable, {
    fields: [branchTable.id],
    references: [locationTable.branchId],
  }),
  session: one(sessionTable, {
    fields: [branchTable.id],
    references: [sessionTable.branchId],
  }),
}));
