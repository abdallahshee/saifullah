import { createSelectSchema } from "drizzle-zod";
import { classes } from "../schema/classes";

export const classSelectSchema = createSelectSchema(classes);
