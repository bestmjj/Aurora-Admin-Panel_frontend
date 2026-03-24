import type { Control, FieldErrors, FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { cn } from "@/lib/utils";
import FieldsRenderer from "./FieldsRenderer";
import FieldShell from "./FieldShell";

interface GridConfig {
  cols?: Record<string, number>;
  gap?: number;
}

function buildGridContainerClasses(gridCfg?: GridConfig) {
  const cols = gridCfg?.cols || {};
  const gap = gridCfg?.gap ?? 2;
  const parts = ["grid", `gap-${gap}`];
  const addCols = (bp: string, n?: number) => {
    if (!n) return;
    const pref = bp === "base" ? "" : `${bp}:`;
    parts.push(`${pref}grid-cols-${n}`);
  };
  addCols("base", cols.base || 1);
  addCols("sm", cols.sm);
  addCols("md", cols.md || 12);
  addCols("lg", cols.lg);
  addCols("xl", cols.xl);
  addCols("2xl", cols["2xl"]);
  return parts.join(" ");
}

interface ObjectFieldProps {
  schema: Record<string, unknown> & { $grid?: GridConfig };
  parent?: string | null;
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>;
  errors: FieldErrors;
  setValue: UseFormSetValue<FieldValues>;
  name: string;
  label?: string;
  className?: string;
}

const ObjectField = ({ schema, parent, register, control, errors, setValue, name, label, className }: ObjectFieldProps) => {
  const fullName = parent ? `${parent}.${name}` : name;
  const level = parent ? parent.split(".").length + 1 : 1;
  return (
    <FieldShell
      className={cn("rounded-lg border border-border/50 bg-muted/30 p-3", className)}
      label={label}
    >
      <div className={cn(buildGridContainerClasses(schema?.$grid), `pl-${level}`, `pr-${level}`)}>
        <FieldsRenderer
          schema={schema}
          parent={fullName}
          register={register}
          control={control}
          errors={errors}
          setValue={setValue}
        />
      </div>
    </FieldShell>
  );
};

export default ObjectField;
