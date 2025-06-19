import { z } from "zod";
import { Register } from "./authentication";

export const Company = Register.pick({
  businessName: true,
  email: true,
}).extend({
  mission: z
    .string()
    .min(5, { message: "Has to be minimum of 5 characters" })
    .max(350, { message: "Has to be maximum of 350 characters" }),
  vision: z
    .string()
    .min(5, { message: "Has to be minimum of 5 characters" })
    .max(350, { message: "Has to be maximum of 350 characters" }),
  description: z
    .string()
    .min(5, { message: "Has to be minimum of 5 characters" })
    .max(350, { message: "Has to be maximum of 350 characters" }),
});

export const AdditionalCompanyDetails = Company.pick({
  mission: true,
  vision: true,
  description: true,
});

export const UpdateCompany = Company.partial();
