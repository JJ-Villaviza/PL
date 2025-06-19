import * as schema from "@/database/schemas";

export type Branch = typeof schema.branchTable.$inferSelect;
export type Account = typeof schema.accountTable.$inferSelect;
export type Company = typeof schema.companyTable.$inferSelect;
export type Location = typeof schema.locationTable.$inferSelect;
export type Profile = typeof schema.profileTable.$inferSelect;
export type Session = typeof schema.sessionTable.$inferSelect;

export type InsertBranch = typeof schema.branchTable.$inferInsert;
export type InsertAccount = typeof schema.accountTable.$inferInsert;
export type InsertCompany = typeof schema.companyTable.$inferInsert;
export type InsertLocation = typeof schema.locationTable.$inferInsert;
export type InsertProfile = typeof schema.profileTable.$inferInsert;
export type InsertSession = typeof schema.sessionTable.$inferInsert;
