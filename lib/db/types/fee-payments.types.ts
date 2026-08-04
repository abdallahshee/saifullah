import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { feePayments } from "../schema/fee-payments";

export const feePaymentSelectSchema = createSelectSchema(feePayments);
export const feePaymentInsertSchema = createInsertSchema(feePayments);
