import { createSelectSchema } from "drizzle-zod";
import { studentGuardians } from "../schema/student-guardians";

export const studentGuardianSelectSchema = createSelectSchema(studentGuardians);
