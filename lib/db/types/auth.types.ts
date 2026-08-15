import { z } from "zod";

// Supabase Auth (GoTrue) hashes passwords with bcrypt, which silently
// truncates at 72 bytes - anything past that is ignored server-side. Capping
// it here means the user gets a clear client-side error instead of a
// confusing "your password changed" surprise later.
const MAX_PASSWORD_LENGTH = 72;

const email = z
  .email({ message: "Invalid email address" })
  .trim()
  .toLowerCase();

export const loginSchema = z.object({
  email,
  // Deliberately no strength/complexity rules here - this is checked
  // against an existing account, not creating one. Only bound the length so
  // Supabase's bcrypt truncation can't silently accept the wrong password.
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(MAX_PASSWORD_LENGTH, { message: "Password is too long" }),
});
export type LoginRequest = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email,
});
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(MAX_PASSWORD_LENGTH, { message: "Password is too long" })
      .regex(/[a-z]/, { message: "Password must include a lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must include an uppercase letter" })
      .regex(/[0-9]/, { message: "Password must include a number" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // attaches the error to the confirmPassword field
  });
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;