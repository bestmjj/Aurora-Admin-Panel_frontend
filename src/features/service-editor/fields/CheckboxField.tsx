import { Controller } from "react-hook-form";
import type { Control, FieldErrors, FieldValues, UseFormRegister, RegisterOptions } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import FieldError from "./FieldError";
import FieldShell from "./FieldShell";

interface CheckboxFieldProps {
  register: UseFormRegister<FieldValues>;
  control?: Control<FieldValues>;
  errors: FieldErrors;
  name: string;
  label?: string;
  rules?: RegisterOptions;
  className?: string;
}

const CheckboxField = ({ register, control, errors, name, label, rules, className }: CheckboxFieldProps) => {
  // Use Controller with Switch for proper controlled component behavior
  if (control) {
    return (
      <FieldShell className={className} label={label}>
        <div className="flex h-full items-center justify-start gap-3">
          <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field }) => (
              <Switch
                size="sm"
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
        <FieldError errors={errors} name={name} />
      </FieldShell>
    );
  }

  // Fallback: native checkbox with register
  return (
    <FieldShell className={className} label={label}>
      <div className="flex h-full items-center justify-start gap-3">
        <input
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border border-input accent-primary"
          )}
          {...register(name, rules)}
        />
      </div>
      <FieldError errors={errors} name={name} />
    </FieldShell>
  );
};

export default CheckboxField;
