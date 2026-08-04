import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { profileRoles } from "../schema/profile-roles";

export const profileRoleSelectSchema = createSelectSchema(profileRoles);
export const profileRoleInsertSchema = createInsertSchema(profileRoles);
