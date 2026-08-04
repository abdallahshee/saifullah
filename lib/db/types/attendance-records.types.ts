import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { attendanceRecords } from "../schema/attendance-records";
import { attendanceStatus } from "../schema/enums";

export const attendanceRecordSelectSchema = createSelectSchema(attendanceRecords);

export const attendanceStatusSchema = z.enum(attendanceStatus.enumValues);

const attendanceEntrySchema = z.object({
  studentId: z.uuid(),
  status: attendanceStatusSchema,
});

export const markAttendanceSchema = z.object({
  classId: z.uuid(),
  date: new Date(),
  records: z.array(attendanceEntrySchema).min(1, {
    message: "At least one student is required",
  }),
});
export type MarkAttendanceRequest = z.infer<typeof markAttendanceSchema>;
