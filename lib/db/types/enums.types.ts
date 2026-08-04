import { userRole, reportStatus, termName } from "../schema/enums";

export type UserRole = (typeof userRole.enumValues)[number];
export type ReportStatus = (typeof reportStatus.enumValues)[number];
export type TermName = (typeof termName.enumValues)[number];
