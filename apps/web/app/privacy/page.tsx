import { LegalPage } from "@/components/marketing/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · Tend",
};

export default function PrivacyPage() {
  return <LegalPage slug="privacy" />;
}
