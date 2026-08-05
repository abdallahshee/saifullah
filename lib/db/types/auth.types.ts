import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});
export type LoginRequest = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Invalid email address" }),
});
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // attaches the error to the confirmPassword field
  });
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;