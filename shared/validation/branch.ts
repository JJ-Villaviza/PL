import { Register } from "./authentication";

export const AddBranch = Register.omit({ businessName: true, email: true });

export const UpdatedBranch = Register.pick({
  name: true,
  username: true,
}).partial();

export const UpdatePassword = Register.pick({
  password: true,
});
