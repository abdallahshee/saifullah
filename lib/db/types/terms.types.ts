import { createSelectSchema } from "drizzle-zod";
import { terms } from "../schema/terms";

export const termSelectSchema = createSelectSchema(terms);
