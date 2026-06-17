"use client";

import { MarkTendedButton } from "@/components/tend/mark-tended-button";
import { TypeBadge } from "@/components/tend/type-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

  const headlineCopy = buildAggregatedReminderCopy(
    reminders.map((reminder) => ({
      name: reminder.name,
      type: reminder.type,
      status: reminder.status,
      daysSinceLastTended: reminder.daysSinceLastTended,
      emphasis: reminder.emphasis,
    })),
    new Date(),
  );

  const hasMust = reminders.some((reminder) => reminder.type === "must");

  return (
    <Alert
      variant="reminder"
      className={cn("mb-6", hasMust && "border-l-4 border-l-[var(--tend-type-must-border)]")}
    >
      <AlertDescription>
        <AlertTitle className="font-display text-pretty text-lg font-medium text-balance text-foreground">
          {headlineCopy}
        </AlertTitle>

        <ul className="mt-4 flex flex-col gap-3">
          {reminders.map((reminder) => (
            <li
              key={reminder.itemId}
              className="flex flex-col gap-3 rounded-md bg-background/60 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-pretty break-words font-medium text-foreground">
                  {reminder.name}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {reminder.type === "must" ? <TypeBadge type="must" size="sm" /> : null}
                <MarkTendedButton
                  itemId={reminder.itemId}
                  onTend={onTend}
                  size="sm"
                  className="ml-auto"
                />
              </div>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
