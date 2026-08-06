import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { classes } from "../schema/classes";

export const classSelectSchema = createSelectSchema(classes, {
    name: z.string().min(1, { message: "Class name is required" }),
    classUrl: z.url({ message: "Invalid class image URL" }).nullable().optional(),
});
export type ClassSelect = z.infer<typeof classSelectSchema>;
