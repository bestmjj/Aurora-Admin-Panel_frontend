import { Controller } from "react-hook-form";
import type { Control, FieldErrors, FieldValues, RegisterOptions } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import FieldError from "./FieldError";
import FieldShell from "./FieldShell";
import { get } from "../../../utils/object";

interface TextAreaFieldProps {
  control: Control<FieldValues>;
  errors: FieldErrors;
  name: string;
  label?: string;
  rows?: number;
  rules?: RegisterOptions;
  className?: string;
}

const TextAreaField = ({ control, errors, name, label, rows = 4, rules, className }: TextAreaFieldProps) => {
  return (
    <FieldShell className={className} label={label}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Textarea
            className={cn(
              "w-full",
              !!get(errors, name) && "border-destructive ring-destructive/20"
            )}
            rows={rows}
            {...field}
          />
        )}
      />
      <FieldError errors={errors} name={name} />
    </FieldShell>
  );
};

export default TextAreaField;
