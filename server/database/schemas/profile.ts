import { relations } from "drizzle-orm";
import {
  customType,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { companyTable } from ".";

export const bytea = customType<{
  data: string;
  notNull: false;
  default: false;
}>({
  dataType() {
    return "bytea";
  },
  toDriver(val) {
    let newVal = val;
    if (val.startsWith("0x")) {
      newVal = val.slice(2);
    }

    return Buffer.from(newVal, "hex");
  },
  fromDriver(val: unknown) {
    return (val as Buffer).toString("hex");
  },
});

export const profileTable = pgTable("userImage", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: text("size").notNull(),
  image: bytea("image").notNull(),
  table: text("table").notNull(),

  accountId: uuid("account_id").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .$onUpdateFn(() => new Date()),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const profileRelation = relations(profileTable, ({ many }) => ({
  company: many(companyTable),
}));
