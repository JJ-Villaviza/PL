import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { accountTable, branchTable, profileTable } from ".";

export const companyTable = pgTable("company", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  businessName: text("business_name").notNull(),
  mission: text("mission"),
  vision: text("vision"),
  description: text("description"),
  status: boolean("status").notNull().default(true),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .$onUpdateFn(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const companyRelation = relations(companyTable, ({ one, many }) => ({
  account: many(accountTable),
  branch: many(branchTable),
  profile: one(profileTable, {
    fields: [companyTable.id],
    references: [profileTable.accountId],
  }),
}));
