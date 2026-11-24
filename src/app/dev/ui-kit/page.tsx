import { notFound } from "next/navigation";
import { UiKitShowcase } from "@/components/dev/ui-kit-showcase";

export const metadata = { title: "UI kit" };

// Every UI kit component in every variant, for comparing with the old app
// side by side. Development only: in a production build this route is not
// found, so it never ships.
export default function UiKitPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <UiKitShowcase />;
}
