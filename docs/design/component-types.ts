/**
 * Component prop contracts for Tend UI.
 * Reference only — move to apps/web when implementing.
 * See docs/design/components.md for full specs.
 */

import type { LifeArea, TendItemType, TendStatus } from "@tend/domain";

// ── Layout ────────────────────────────────────────────────────

export interface AppShellProps {
  children: React.ReactNode;
  user?: { displayName: string };
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// ── Forms ─────────────────────────────────────────────────────

export interface FormFieldProps {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export interface AuthFormData {
  displayName?: string;
  email: string;
  password: string;
}

export interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (data: AuthFormData) => Promise<void>;
}

export interface ItemFormValues {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  lifeArea: LifeArea | null;
  lastTendedDate: string;
}

export interface ItemFormProps {
  initial?: Partial<ItemFormValues>;
  onSubmit: (values: ItemFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export interface TypeSelectorProps {
  value: TendItemType;
  onChange: (type: TendItemType) => void;
}

export interface RhythmSelectProps {
  value: number;
  onChange: (days: number) => void;
  options?: Array<{ days: number; label: string }>;
}

export interface AvailabilityWindow {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
}

export interface AvailabilityEditorProps {
  windows: AvailabilityWindow[];
  onChange: (windows: AvailabilityWindow[]) => void;
  onSave: () => Promise<void>;
}

// ── Domain display ────────────────────────────────────────────

export interface StatusBadgeProps {
  status: TendStatus;
  size?: "sm" | "md";
}

export interface TypeBadgeProps {
  type: TendItemType;
  size?: "sm" | "md";
}

export interface RelativeTimeProps {
  date: Date | string | null;
  prefix?: string;
}

export interface TendItemCardProps {
  id: string;
  name: string;
  type: TendItemType;
  status: TendStatus;
  lastTendedAt: Date | string | null;
  rhythmDays: number;
  lifeArea?: LifeArea | null;
  onTend?: (id: string) => void;
  onClick?: (id: string) => void;
  loading?: boolean;
}

export interface AttentionSectionProps {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export interface AttentionHeroProps {
  item: {
    id: string;
    name: string;
    type: TendItemType;
    status: TendStatus;
    lastTendedAt: Date | string | null;
  };
  onTend: (id: string) => void;
}

export interface MarkTendedButtonProps {
  itemId: string;
  onTend: (id: string) => Promise<void>;
  size?: "sm" | "default" | "lg";
  className?: string;
}

export interface LifeAreaChipProps {
  area: LifeArea;
  selected?: boolean;
  onClick?: () => void;
}

export interface LifeAreaFilterProps {
  selected: LifeArea | null;
  onChange: (area: LifeArea | null) => void;
}

export interface PresetCardProps {
  name: string;
  type: TendItemType;
  rhythmDays: number;
  onSelect: () => void;
}

export interface ReminderBannerProps {
  reminders: Array<{
    itemId: string;
    name: string;
    type: TendItemType;
    copy: string;
  }>;
  onTend: (id: string) => void;
  onDismiss?: () => void;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export type EmptyStatePreset = "no-items" | "all-fresh" | "no-activity" | "no-availability";

export interface ActivityListItemProps {
  itemName: string;
  tendedAt: Date | string;
  onEdit?: () => void;
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
}

// ── Label maps (implement in lib/design/status-labels.ts) ─────

export const STATUS_LABELS: Record<TendStatus, string> = {
  fresh: "Fresh",
  getting_stale: "Getting stale",
  needs_attention: "Needs attention",
};

export const TYPE_LABELS: Record<TendItemType, string> = {
  want: "Want",
  must: "Must",
};
