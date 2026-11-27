import type { Metadata } from "next";

import { BalanceSheetScreen } from "@/components/reports/balance-sheet-screen";

export const metadata: Metadata = {
  title: "Balance Sheet"
};

export default function BalanceSheetPage() {
  return <BalanceSheetScreen />;
}
