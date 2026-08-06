import { createSelectSchema } from "drizzle-zod";
import { profiles } from "../schema/profiles";
import { z } from "zod";
import { userRole } from "../schema";

const Schema = createSelectSchema(profiles, {
    email: z.email({ message: "Invalid email address" }), // not z.string() — that only checks it's a string, not a valid email
    roles: z
        .enum(userRole.enumValues)
        .array()
        .min(1, { message: "At least one role is required" }),
    dateOfBirth: z.string().nullable(),
    phone: z
        .string()
        .regex(/^\+?[1-9]\d{7,14}$/, { message: "Invalid phone number" })
        .nullable() // matches the column: phone: text("phone") — no .notNull(), so it's nullable in the DB
        .optional(),
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    profileUrl: z
        .url({ message: "Invalid profile URL" })
        .nullable() // matches the column: profileUrl: text("profile_url") — no .notNull(), so it's nullable in the DB
        .optional(),
});

export type Profile = z.infer<typeof Schema>;

export const profileSchema = Schema.pick({
    email: true,
    phone: true,
    firstName: true,
    lastName: true,
    profileUrl: true
})
export type ProfileRequest = z.infer<typeof profileSchema>

export const secretarySchema = Schema.extend({
    roles: z.string('secretary')
})
export type SecretaryRequest = z.infer<typeof secretarySchema>;


export const parentSchema = Schema.extend({
    roles: z.string('parent')
})
export type ParentRequest = z.infer<typeof parentSchema>;


export const teacherSchema = Schema.extend({
    roles: z.string('teacher')
})
export type TeacherRequest = z.infer<typeof parentSchema>;



