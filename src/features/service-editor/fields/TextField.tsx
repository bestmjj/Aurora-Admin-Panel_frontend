import { Controller } from "react-hook-form";
import type { Control, FieldErrors, FieldValues, RegisterOptions } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import FieldError from "./FieldError";
import FieldShell from "./FieldShell";
import { get } from "../../../utils/object";

interface TextFieldProps {
  control: Control<FieldValues>;
  errors: FieldErrors;
  name: string;
  label?: string;
  type?: string;
  rules?: RegisterOptions;
  className?: string;
}

const TextField = ({ control, errors, name, label, type = "text", rules, className }: TextFieldProps) => {
  return (
    <FieldShell className={className} label={label}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <Input
            className={cn(
              "w-full",
              !!get(errors, name) && "border-destructive ring-destructive/20"
            )}
            type={type}
            {...field}
          />
        )}
      />
      <FieldError errors={errors} name={name} />
    </FieldShell>
  );
};

export default TextField;
