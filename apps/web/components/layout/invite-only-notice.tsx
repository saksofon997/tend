"use client";

import { useI18n } from "@/lib/i18n/client";

export function InviteOnlyNotice() {
  const { t } = useI18n();

  return (
    <p className="mt-6 max-w-md text-center text-xs text-muted-foreground/80">
      {t("auth.privatePreAlpha")}
    </p>
  );
}
