import { createSelectSchema } from "drizzle-zod";
import { classTermFees } from "../schema/class-term-fees";

export const classTermFeeSelectSchema = createSelectSchema(classTermFees);
