import { createSelectSchema } from "drizzle-zod";
import { students } from "../schema/students";
import z from "zod"

const Schema = createSelectSchema(students, {
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.string(),
    classId: z.uuid(),
    profileUrl: z.url({ message: "Invalid profile URL" }).nullable().optional(),
});

export type Student = z.infer<typeof Schema>;

export const studentSchema = Schema.pick({
    firstName: true,
    lastName: true,
    dateOfBirth: true,
    classId: true,
    profileUrl: true,
})
export type StudentRequest=z.infer<typeof studentSchema>