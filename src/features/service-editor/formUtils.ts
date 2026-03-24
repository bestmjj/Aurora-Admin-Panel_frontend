import type { RegisterOptions } from "react-hook-form";

/** Validation rules from service definition params */
interface RawValidationRules {
  pattern?: string | { value: string; flags?: string; message?: string };
  required?: string | boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  [key: string]: unknown;
}

export function normalizeValidation(rules: RawValidationRules | undefined | null): RegisterOptions | undefined {
  if (!rules) return undefined;
  const out: Record<string, unknown> = { ...rules };
  // Normalize pattern: allow string or { value: string, flags, message }
  if (typeof out.pattern === "string") {
    out.pattern = new RegExp(out.pattern as string);
  } else if (out.pattern && typeof (out.pattern as Record<string, unknown>).value === "string") {
    try {
      const p = out.pattern as { value: string; flags?: string; message?: string };
      out.pattern = {
        ...p,
        value: new RegExp(p.value, p.flags || undefined),
      };
    } catch {
      // If invalid regex, drop to avoid runtime errors
      delete out.pattern;
    }
  }
  return out as RegisterOptions;
}

/** Dynamic form field spec */
interface FieldSpec {
  type: string;
  label?: string;
  defaultValue?: unknown;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
  validation?: RegisterOptions;
  grid?: { colSpan?: Record<string, number> };
  of?: Record<string, FieldSpec>;
  values?: FieldSpec;
  [key: string]: unknown;
}

export function deriveDefaultValues(schema: Record<string, FieldSpec> | null | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!schema) return out;
  for (const [key, field] of Object.entries(schema).filter(([k]) => !k.startsWith("$"))) {
    switch (field.type) {
      case "text":
      case "email":
      case "password":
      case "number": {
        out[key] = field.defaultValue ?? "";
        break;
      }
      case "select": {
        const fallback = Array.isArray(field.options) && field.options.length > 0 ? field.options[0].value : "";
        out[key] = field.defaultValue ?? fallback;
        break;
      }
      case "checkbox": {
        out[key] = field.defaultValue ?? false;
        break;
      }
      case "list": {
        out[key] = field.defaultValue ?? [];
        break;
      }
      case "object": {
        out[key] = deriveDefaultValues(field.of || {});
        break;
      }
      default: {
        out[key] = field.defaultValue;
      }
    }
  }
  return out;
}
