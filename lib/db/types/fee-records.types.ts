import { createSelectSchema } from "drizzle-zod";
import { feeRecords } from "../schema/fee-records";

export const feeRecordSelectSchema = createSelectSchema(feeRecords);
