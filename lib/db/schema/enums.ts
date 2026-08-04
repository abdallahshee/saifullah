import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "secretary", "teacher"]);
export const reportStatus = pgEnum("report_status", ["draft", "sent"]);
export const termName = pgEnum("term_name", ["Term 1", "Term 2", "Term 3"]);
