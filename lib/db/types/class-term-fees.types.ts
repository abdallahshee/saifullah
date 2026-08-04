import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { classTermFees } from "../schema/class-term-fees";

export const classTermFeeSelectSchema = createSelectSchema(classTermFees);
export const classTermFeeInsertSchema = createInsertSchema(classTermFees);
