import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { attendanceRecords } from "../schema/attendance-records";

export const attendanceRecordSelectSchema = createSelectSchema(attendanceRecords);
export const attendanceRecordInsertSchema = createInsertSchema(attendanceRecords);
