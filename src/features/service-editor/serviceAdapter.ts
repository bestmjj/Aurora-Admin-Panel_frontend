import type { RegisterOptions } from "react-hook-form";
import type { ParamDraft } from "./param-editor-types";

/** A single select option */
interface SelectOption {
  value: string;
  label: string;
}

/** Dynamic field spec consumed by the form renderer */
export interface DynamicFieldSpec {
  type: "text" | "email" | "password" | "number" | "textarea" | "checkbox" | "select" | "list" | "object";
  label: string;
  defaultValue?: unknown;
  rows?: number;
  options?: SelectOption[];
  validation?: RegisterOptions;
  grid?: { colSpan?: Record<string, number> };
  of?: DynamicSchema;
  values?: DynamicFieldSpec;
}

/** A dynamic schema is a map of field keys to field specs, with an optional $grid meta key */
export interface DynamicSchema {
  [key: string]: DynamicFieldSpec | Record<string, unknown>;
  $grid?: Record<string, unknown>;
}

/** Grid configuration at the service definition level */
interface GridConfig {
  cols?: Record<string, number>;
  gap?: number;
}

/** Service definition (contract) shape relevant to the adapter */
interface ServiceDefinition {
  params: ParamDraft[];
  ui?: {
    grid?: GridConfig;
    [key: string]: unknown;
  };
}

/* ── Helpers ────────────────────────────────────────────── */

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function toSelectOptions(options: unknown): SelectOption[] {
  return ensureArray<unknown>(options).map((opt) => {
    if (opt && typeof opt === "object" && "value" in opt) {
      const o = opt as { value: string; label?: string };
      return {
        value: o.value,
        label: o.label ?? String(o.value),
      };
    }
    return {
      value: opt as string,
      label: String(opt),
    };
  });
}

function buildValidation(param: ParamDraft | null | undefined): RegisterOptions | undefined {
  const validation: Record<string, unknown> = { ...(param?.validation || {}) };
  if (param?.required && validation.required === undefined) {
    validation.required = `${param.label || param.key || "Field"} is required`;
  }
  return Object.keys(validation).length ? (validation as RegisterOptions) : undefined;
}

function mapParamToDynamicField(param: ParamDraft): DynamicFieldSpec {
  if (!param || typeof param !== "object") {
    throw new Error("Invalid param definition");
  }

  const base = {
    label: param.label || param.key,
    grid: param.ui?.grid,
    validation: buildValidation(param),
  };

  switch (param.type) {
    case "string": {
      const widget = param.ui?.widget;
      if (widget === "textarea") {
        return { ...base, type: "textarea", rows: 4, defaultValue: param.default ?? "" };
      }
      return { ...base, type: widget === "email" ? "email" : "text", defaultValue: param.default ?? "" };
    }
    case "secret":
      return {
        ...base,
        type: "password",
        defaultValue: param.default ?? "",
      };
    case "int":
    case "float":
      return {
        ...base,
        type: "number",
        defaultValue: param.default ?? "",
      };
    case "bool":
      return {
        ...base,
        type: "checkbox",
        defaultValue: param.default ?? false,
      };
    case "enum":
      return {
        ...base,
        type: "select",
        options: toSelectOptions(param.options),
        defaultValue:
          param.default ??
          (Array.isArray(param.options) && param.options.length
            ? (param.options[0]?.value ?? param.options[0])
            : ""),
      };
    case "list":
      return {
        ...base,
        type: "list",
        defaultValue: param.default ?? [],
        values: mapParamToDynamicField({
          ...(param.items || { type: "string", label: "Item", key: "item" }),
          key: `${param.key || "item"}_item`,
        }),
      };
    case "object": {
      const nested = serviceParamsToDynamicSchema(param.properties || []);
      return {
        ...base,
        type: "object",
        defaultValue: param.default,
        of: nested,
      };
    }
    default:
      throw new Error(`Unsupported param type for form renderer: ${param.type}`);
  }
}

/* ── Public API ─────────────────────────────────────────── */

export function serviceParamsToDynamicSchema(params: unknown): DynamicSchema {
  const out: DynamicSchema = {};
  for (const param of ensureArray<ParamDraft>(params)) {
    if (!param?.key) continue;
    out[param.key] = mapParamToDynamicField(param);
  }
  return out;
}

export function serviceDefinitionToDynamicSchema(contract: unknown): DynamicSchema {
  if (!contract || typeof contract !== "object") {
    throw new Error("Service definition must be an object");
  }
  const def = contract as ServiceDefinition;
  if (!Array.isArray(def.params)) {
    throw new Error("Service definition params must be an array");
  }

  const schema = serviceParamsToDynamicSchema(def.params);
  if (def.ui?.grid) {
    schema.$grid = def.ui.grid as Record<string, unknown>;
  }
  return schema;
}
