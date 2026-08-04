import { createSelectSchema } from "drizzle-zod";
import { profiles } from "../schema/profiles";
import { z } from "zod";
import { userRole } from "../schema";

const Schema = createSelectSchema(profiles, {
    email: z.email({ message: "Invalid email address" }),
    role: z
        .enum(userRole.enumValues)
        .array()
        .min(1, { message: "At least one role is required" }),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{7,14}$/, { message: "Invalid phone number" })
        .optional(),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" })
});

export const profileSchema = Schema.pick({
    email: true,
    phone: true,
    firstName: true,
    lastName: true
})
export type ProfileRequest=z.infer<typeof profileSchema>

export const secretarySchema = Schema.extend({
    role:z.string('secretary')
})
export type SecretaryRequest = z.infer<typeof secretarySchema>;


export const parentSchema = Schema.extend({
    role:z.string('parent')
})
export type ParentRequest = z.infer<typeof parentSchema>;
