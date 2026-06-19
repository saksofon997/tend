"use client";

import { useI18n } from "@/lib/i18n/client";
import Link from "next/link";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-lg font-medium">{t("notFound.title")}</h2>
      <Link href="/" className="text-primary hover:underline">
        {t("notFound.backHome")}
      </Link>
    </div>
  );
}
