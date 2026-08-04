import { sql } from "drizzle-orm";
import { pgTable, pgPolicy, uuid, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";
import { feeRecords } from "./fee-records";
import { profiles } from "./profiles";

/**
 * A single M-Pesa installment against a fee record - a student/parent can
 * pay a term's fees in several bits, each one logged as its own row here.
 * `feeRecordId` transitively identifies the student, term, and class (via
 * fee_records), so those aren't repeated on every payment.
 *
 * No update/delete policies are defined below, which means RLS denies both
 * by default: payments are an append-only ledger for audit purposes. To
 * correct a mistaken entry, record an offsetting payment rather than
 * editing history.
 */
export const feePayments = pgTable(
  "fee_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    feeRecordId: uuid("fee_record_id")
      .notNull()
      .references(() => feeRecords.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    mpesaTransactionReference: text("mpesa_transaction_reference")
      .notNull()
      .unique(),
    paidAt: timestamp("paid_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    recordedBy: uuid("recorded_by").references(() => profiles.id, {
      onDelete: "set null",
    }),
  },
  () => [
    // Secretary reads and records M-Pesa payments as they come in.
    pgPolicy("fee_payments_select_secretary", {
      for: "select",
      to: authenticatedRole,
      using: sql`current_app_role() = 'secretary'`,
    }),
    pgPolicy("fee_payments_insert_secretary", {
      for: "insert",
      to: authenticatedRole,
      withCheck: sql`current_app_role() = 'secretary'`,
    }),
    // Admin gets read-only access, for analytics (e.g. collections over time).
    pgPolicy("fee_payments_select_admin", {
      for: "select",
      to: authenticatedRole,
      using: sql`current_app_role() = 'admin'`,
    }),
  ],
).enableRLS();
