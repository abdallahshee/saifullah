import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { students } from "../schema/students";

export const studentSelectSchema = createSelectSchema(students);
export const studentInsertSchema = createInsertSchema(students);
