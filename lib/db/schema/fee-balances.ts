import { and, eq, sql } from "drizzle-orm";
import { pgView } from "drizzle-orm/pg-core";
import { feeRecords } from "./fee-records";
import { classTermFees } from "./class-term-fees";
import { feePayments } from "./fee-payments";

/**
 * Read-only, always-fresh fee balance per student per term: the class's
 * term fee amount minus whatever's been paid against it so far (paid in
 * one go or several M-Pesa installments).
 *
 * `securityInvoker: true` makes the view enforce RLS as the querying user
 * (Postgres 15+), rather than as whoever owns the view - so it inherits
 * the same access rules as fee_records/class_term_fees/fee_payments
 * instead of needing its own policies.
 */
export const feeBalances = pgView("fee_balances")
  .with({ securityInvoker: true })
  .as((qb) =>
    qb
      .select({
        feeRecordId: feeRecords.id,
        studentId: feeRecords.studentId,
        termId: feeRecords.termId,
        classId: feeRecords.classId,
        amountExpected: classTermFees.amount,
        amountPaid:
          sql<string>`coalesce(sum(${feePayments.amount}), 0)`.as("amount_paid"),
        amountDue:
          sql<string>`${classTermFees.amount} - coalesce(sum(${feePayments.amount}), 0)`.as(
            "amount_due",
          ),
      })
      .from(feeRecords)
      .innerJoin(
        classTermFees,
        and(
          eq(classTermFees.termId, feeRecords.termId),
          eq(classTermFees.classId, feeRecords.classId),
        ),
      )
      .leftJoin(feePayments, eq(feePayments.feeRecordId, feeRecords.id))
      .groupBy(feeRecords.id, classTermFees.amount),
  );
