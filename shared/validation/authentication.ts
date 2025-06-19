import { z } from "zod";

export const Register = z.object({
  name: z
    .string()
    .min(3, { message: "Has to be minimum of 3 characters" })
    .max(30, { message: "Has to be maximum of 30 characters" }),
  businessName: z
    .string()
    .min(3, { message: "Has to be minimum of 3 characters" })
    .max(30, { message: "Has to be maximum of 30 characters" }),
  email: z.string().email({ message: "Needs to be valid email" }),
  username: z
    .string()
    .min(3, { message: "Has to be minimum of 3 characters" })
    .max(20, { message: "Has to be maximum of 20 characters" })
    .regex(
      /^[a-z0-9]{6,20}$/,
      "Must not contain special characters or uppercase letters"
    ),
  password: z
    .string()
    .min(8, { message: "Has to be minimum of 8 characters" })
    .max(15, { message: "Has to be maximum of 15 characters" })
    .regex(/^(?=.*[A-Z]).{8,}$/, {
      message: "Should Contain at least one uppercase letter",
    }),
});

export const Login = z.object({
  username: z.string(),
  password: z.string(),
});

export const ForgetPassword = Register.pick({ email: true });
