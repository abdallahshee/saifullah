import { studentGuardians } from "../schema/student-guardians";

export type StudentGuardianSelect = typeof studentGuardians.$inferSelect;
export type StudentGuardianInsert = typeof studentGuardians.$inferInsert;
