import { feePayments } from "../schema/fee-payments";

export type FeePaymentSelect = typeof feePayments.$inferSelect;
export type FeePaymentInsert = typeof feePayments.$inferInsert;