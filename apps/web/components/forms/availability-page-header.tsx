"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/client";

export function AvailabilityPageHeader() {
  const { t } = useI18n();

  return <PageHeader title={t("availability.title")} subtitle={t("availability.subtitle")} />;
}
