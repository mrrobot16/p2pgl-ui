import type { Metadata } from "next";

import { TrialBalanceScreen } from "@/components/reports/trial-balance-screen";

export const metadata: Metadata = {
  title: "Trial Balance"
};

export default function TrialBalancePage() {
  return <TrialBalanceScreen />;
}
