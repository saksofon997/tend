"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/client";
import { useState } from "react";

export function ResetTendSection() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmReset() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/settings/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });

      if (!response.ok) {
        throw new Error("reset-failed");
      }

      setDone(true);
      setOpen(false);
    } catch {
      setError(t("settings.reset.error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.reset.title")}</CardTitle>
        <CardDescription>{t("settings.reset.body")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-start gap-3">
        {done ? (
          <Alert>
            <AlertDescription>{t("settings.reset.done")}</AlertDescription>
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Button
          type="button"
          variant="destructive"
          onClick={() => setOpen(true)}
          disabled={pending}
        >
          {pending ? t("settings.reset.working") : t("settings.reset.button")}
        </Button>
      </CardContent>
      <ConfirmDialog
        open={open}
        title={t("settings.reset.confirmTitle")}
        description={t("settings.reset.confirmMessage")}
        confirmLabel={pending ? t("settings.reset.working") : t("settings.reset.confirm")}
        cancelLabel={t("common.cancel")}
        variant="destructive"
        confirming={pending}
        onConfirm={() => void confirmReset()}
        onCancel={() => {
          if (!pending) {
            setOpen(false);
          }
        }}
      />
    </Card>
  );
}
