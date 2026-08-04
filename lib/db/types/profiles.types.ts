import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { profiles } from "../schema/profiles";

export const profileSelectSchema = createSelectSchema(profiles);
export const profileInsertSchema = createInsertSchema(profiles);
