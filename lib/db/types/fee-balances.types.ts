import { createSelectSchema } from "drizzle-zod";
import { feeBalances } from "../schema/fee-balances";

export const feeBalanceSelectSchema = createSelectSchema(feeBalances);
