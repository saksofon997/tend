import { Select } from "@/components/ui/select";
import { RHYTHM_OPTIONS } from "@/lib/onboarding/constants";

interface RhythmSelectProps {
  value: number;
  onChange: (days: number) => void;
  options?: Array<{ days: number; label: string }>;
}

export function RhythmSelect({
  value,
  onChange,
  options = [...RHYTHM_OPTIONS],
}: RhythmSelectProps) {
  const hasOption = options.some((option) => option.days === value);

  return (
    <Select
      id="item-rhythm"
      value={String(value)}
      onChange={(event) => onChange(Number(event.target.value))}
    >
      {options.map((option) => (
        <option key={option.days} value={option.days}>
          {option.label}
        </option>
      ))}
      {!hasOption ? <option value={value}>Every {value} days</option> : null}
    </Select>
  );
}
