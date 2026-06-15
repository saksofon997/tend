"use client";

import { MarkTendedButton } from "@/components/tend/mark-tended-button";
import { TypeBadge } from "@/components/tend/type-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buildAggregatedReminderCopy } from "@/lib/reminders/reminder-copy";
import type { ReminderResponse } from "@/lib/reminders/serialize";
import { cn } from "@/lib/utils";

interface ReminderBannerProps {
  reminders: ReminderResponse[];
  onTend: (id: string) => Promise<void>;
}

export function ReminderBanner({ reminders, onTend }: ReminderBannerProps) {
  if (reminders.length === 0) {
    return null;
  }

  const aggregatedCopy =
    reminders.length > 1
      ? buildAggregatedReminderCopy(
          reminders.map((reminder) => ({
            name: reminder.name,
            type: reminder.type,
            status: reminder.status,
            daysSinceLastTended: reminder.daysSinceLastTended,
            emphasis: reminder.emphasis,
          })),
          new Date(),
        )
      : reminders[0].copy;

  const hasMust = reminders.some((reminder) => reminder.type === "must");

  return (
    <Alert
      variant="reminder"
      className={cn("mb-6", hasMust && "border-l-4 border-l-[var(--tend-type-must-border)]")}
    >
      <AlertDescription>
        <p className="text-pretty text-foreground">{aggregatedCopy}</p>

        {reminders.length > 1 ? (
          <ul className="mt-4 flex flex-col gap-3">
            {reminders.map((reminder) => (
              <li
                key={reminder.itemId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-background/60 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{reminder.name}</span>
                  {reminder.type === "must" ? <TypeBadge type="must" size="sm" /> : null}
                </div>
                <MarkTendedButton itemId={reminder.itemId} onTend={onTend} size="sm" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {reminders[0].type === "must" ? <TypeBadge type="must" size="sm" /> : null}
            <MarkTendedButton itemId={reminders[0].itemId} onTend={onTend} size="sm" />
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
