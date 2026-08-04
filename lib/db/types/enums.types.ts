import { z } from "zod";
import { userRole, reportStatus, termName, attendanceStatus } from "../schema/enums";

export const userRoleSchema = z.enum(userRole.enumValues);
export const reportStatusSchema = z.enum(reportStatus.enumValues);
export const termNameSchema = z.enum(termName.enumValues);
export const attendanceStatusSchema = z.enum(attendanceStatus.enumValues);
