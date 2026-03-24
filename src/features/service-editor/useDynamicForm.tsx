import { useEffect, useMemo } from "react";
import { useForm, type FieldValues, type UseFormReturn } from "react-hook-form";
import { FieldsRenderer } from "./fields";
import { deriveDefaultValues } from "./formUtils";
import type { DynamicSchema } from "./serviceAdapter";

interface GridConfig {
  cols?: Record<string, number>;
  gap?: number;
}

function buildGridContainerClasses(gridCfg?: GridConfig | Record<string, unknown>): string {
  const cols = (gridCfg as GridConfig)?.cols || {};
  const gap = (gridCfg as GridConfig)?.gap ?? 4;
  const parts: string[] = ["grid", `gap-${gap}`];
  const addCols = (bp: string, n?: number) => {
    if (!n) return;
    const pref = bp === "base" ? "" : `${bp}:`;
    parts.push(`${pref}grid-cols-${n}`);
  };
  addCols("base", cols.base || 1);
  addCols("sm", cols.sm);
  addCols("md", cols.md);
  addCols("lg", cols.lg);
  addCols("xl", cols.xl);
  addCols("2xl", cols["2xl"]);
  return parts.join(" ");
}

interface UseDynamicFormOptions {
  schema?: DynamicSchema | null;
  onSubmit?: (values: FieldValues) => void;
  defaultValues?: Record<string, unknown>;
  onValuesChange?: (values: FieldValues, meta: { type?: string; name?: string }) => void;
}

interface UseDynamicFormReturn {
  form: React.ReactNode;
  methods: UseFormReturn<FieldValues>;
}

/**
 * Hook to generate a dynamic form from a JSON schema.
 *
 * Usage:
 *   const { form, methods } = useDynamicForm({ schema, onSubmit, defaultValues });
 *   return form;
 */
export default function useDynamicForm({
  schema,
  onSubmit,
  defaultValues,
  onValuesChange,
}: UseDynamicFormOptions = {}): UseDynamicFormReturn {
  const computedDefaults = defaultValues ?? deriveDefaultValues(schema as Record<string, never> | null | undefined);
  const methods = useForm({ defaultValues: computedDefaults });
  const { register, control, handleSubmit, formState: { errors }, setValue } = methods;

  useEffect(() => {
    if (!onValuesChange) return undefined;

    onValuesChange(methods.getValues(), { type: "init" });
    const subscription = methods.watch((values, meta) => {
      onValuesChange(values as FieldValues, meta as { type?: string; name?: string });
    });

    return () => subscription?.unsubscribe?.();
  }, [methods, onValuesChange]);

  const form = useMemo(() => (
    <div className="w-full">
      <form className="w-full" onSubmit={handleSubmit(onSubmit ?? (() => {}))}>
        <div
          className={buildGridContainerClasses(schema?.$grid)}
        >
          <FieldsRenderer
            schema={schema as Record<string, unknown>}
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
          />
        </div>
      </form>
    </div>
  ), [schema, register, control, errors, setValue, handleSubmit, onSubmit]);

  return { form, methods };
}
