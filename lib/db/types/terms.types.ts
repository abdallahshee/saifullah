import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { terms } from "../schema/terms";

export const termSelectSchema = createSelectSchema(terms);
export const termInsertSchema = createInsertSchema(terms);
