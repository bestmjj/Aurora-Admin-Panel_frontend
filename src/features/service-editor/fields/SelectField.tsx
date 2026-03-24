import type { FieldErrors, FieldValues, UseFormRegister, RegisterOptions } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import FieldError from "./FieldError";
import FieldShell from "./FieldShell";
import { get } from "../../../utils/object";
import useMaybeT from "../../../hooks/useMaybeT";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  register: UseFormRegister<FieldValues>;
  control?: Control<FieldValues>;
  errors: FieldErrors;
  name: string;
  label?: string;
  options?: SelectOption[];
  rules?: RegisterOptions;
  className?: string;
}

const SelectField = ({ register, control, errors, name, label, options = [], rules, className }: SelectFieldProps) => {
  const maybeT = useMaybeT();

  // Use Controller with shadcn Select for proper controlled component behavior
  if (control) {
    return (
      <FieldShell className={className} label={label}>
        <Controller
          name={name}
          control={control}
          rules={rules}
          render={({ field }) => (
            <Select value={field.value ?? ""} onValueChange={field.onChange}>
              <SelectTrigger
                className={cn(
                  "w-full",
                  !!get(errors, name) && "border-destructive ring-destructive/20"
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {maybeT(opt.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FieldError errors={errors} name={name} />
      </FieldShell>
    );
  }

  // Fallback: native select with register (for backward compatibility)
  return (
    <FieldShell className={className} label={label}>
      <select
        className={cn(
          "flex h-9 w-full rounded-4xl border border-input bg-input/30 px-3 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          !!get(errors, name) && "border-destructive ring-destructive/20"
        )}
        {...register(name, rules)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {maybeT(opt.label)}
          </option>
        ))}
      </select>
      <FieldError errors={errors} name={name} />
    </FieldShell>
  );
};

export default SelectField;
