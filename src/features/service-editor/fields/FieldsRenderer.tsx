import type { Control, FieldErrors, FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import TextField from "./TextField";
import TextAreaField from "./TextAreaField";
import SelectField from "./SelectField";
import CheckboxField from "./CheckboxField";
import ObjectField from "./ObjectField";
import ListField from "./ListField";
import { normalizeValidation } from "../formUtils";

interface GridSpanConfig {
  colSpan?: Record<string, number>;
}

interface FieldSpec {
  type: string;
  label?: string;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
  validation?: Record<string, unknown>;
  grid?: GridSpanConfig;
  of?: Record<string, unknown>;
  values?: Record<string, unknown>;
  [key: string]: unknown;
}

function buildColSpanClasses(gridCfg?: GridSpanConfig) {
  if (!gridCfg) return "col-span-12"; // default full row on small screens
  const span = gridCfg.colSpan || {};
  const parts: string[] = [];
  const add = (bp: string, n?: number) => {
    if (!n) return;
    const pref = bp === "base" ? "" : `${bp}:`;
    parts.push(`${pref}col-span-${n}`);
  };
  add("base", span.base || 12);
  add("sm", span.sm);
  add("md", span.md);
  add("lg", span.lg);
  add("xl", span.xl);
  add("2xl", span["2xl"]);
  return parts.join(" ");
}

interface FieldsRendererProps {
  schema: Record<string, unknown>;
  parent?: string | null;
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>;
  errors: FieldErrors;
  setValue: UseFormSetValue<FieldValues>;
}

const FieldsRenderer = ({ schema, parent = null, register, control, errors, setValue }: FieldsRendererProps) => {
  return (
    <>
      {Object.entries(schema)
        .filter(([key]) => !key.startsWith("$"))
        .map(([key, rawField]) => {
          const field = rawField as FieldSpec;
          const name = parent ? `${parent}.${key}` : key;
          const wrapperClass = buildColSpanClasses(field.grid);
          switch (field.type) {
            case "textarea":
              return (
                <TextAreaField
                  key={name}
                  control={control}
                  errors={errors}
                  name={name}
                  label={field.label}
                  rows={field.rows}
                  rules={normalizeValidation(field.validation)}
                  className={wrapperClass}
                />
              );
            case "text":
            case "email":
            case "number":
            case "password":
              return (
                <TextField
                  key={name}
                  control={control}
                  errors={errors}
                  name={name}
                  label={field.label}
                  type={field.type}
                  rules={normalizeValidation(field.validation)}
                  className={wrapperClass}
                />
              );
            case "select":
              return (
                <SelectField
                  key={name}
                  register={register}
                  control={control}
                  errors={errors}
                  name={name}
                  label={field.label}
                  options={field.options || []}
                  rules={normalizeValidation(field.validation)}
                  className={wrapperClass}
                />
              );
            case "checkbox":
              return (
                <CheckboxField
                  key={name}
                  register={register}
                  control={control}
                  errors={errors}
                  name={name}
                  label={field.label}
                  rules={normalizeValidation(field.validation)}
                  className={wrapperClass}
                />
              );
            case "object":
              return (
                <ObjectField
                  key={name}
                  schema={field.of as Record<string, unknown>}
                  parent={parent}
                  register={register}
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  name={key}
                  label={field.label}
                  className={wrapperClass}
                />
              );
            case "list":
              return (
                <ListField
                  key={name}
                  name={key}
                  label={field.label}
                  itemSchema={field.values as Record<string, unknown>}
                  parent={parent}
                  register={register}
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  className={wrapperClass}
                />
              );
            default:
              return null;
          }
        })}
    </>
  );
};

export default FieldsRenderer;
