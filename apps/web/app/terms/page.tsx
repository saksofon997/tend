import { LegalPage } from "@/components/marketing/legal-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · Tend",
};

export default function TermsPage() {
  return <LegalPage slug="terms" />;
}
