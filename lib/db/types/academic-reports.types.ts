import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { academicReports } from "../schema/academic-reports";

export const academicReportSelectSchema = createSelectSchema(academicReports);
export const academicReportInsertSchema = createInsertSchema(academicReports);
