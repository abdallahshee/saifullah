import { students } from "../schema/students";

export type StudentSelect = typeof students.$inferSelect;
export type StudentInsert = typeof students.$inferInsert;
