"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/lib/i18n/client";

export function SettingsPageHeader() {
  const { t } = useI18n();

  return <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />;
}
