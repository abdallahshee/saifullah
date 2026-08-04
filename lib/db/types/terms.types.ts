import { terms } from "../schema/terms";

export type TermSelect = typeof terms.$inferSelect;
export type TermInsert = typeof terms.$inferInsert;
