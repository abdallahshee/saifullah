import { feeRecords } from "../schema/fee-records";

export type FeeRecordSelect = typeof feeRecords.$inferSelect;
export type FeeRecordInsert = typeof feeRecords.$inferInsert;
