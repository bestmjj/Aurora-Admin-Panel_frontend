import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import type { ParamEditorProps } from "./param-editor-types";

/* ── Layout helpers ────────────────────────────────────── */

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-2 md:grid-cols-2">{children}</div>;
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

/* ── Main component ────────────────────────────────────── */

export default function ValidationEditor({ param, onChange }: ParamEditorProps) {
  const { t } = useTranslation();
  const validation = param.validation || {};
  const isNumeric = param.type === "int" || param.type === "float";
  const isString = param.type === "string" || param.type === "secret";

  const patchValidation = (
    key: string,
    value: string | number | undefined
  ) => {
    onChange((p) => {
      if (!p.validation) p.validation = {};
      if (value === undefined || value === "") {
        delete (p.validation as Record<string, unknown>)[key];
        // Clean up empty validation object
        if (Object.keys(p.validation).length === 0) {
          delete p.validation;
        }
      } else {
        (p.validation as Record<string, unknown>)[key] = value;
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Numeric constraints */}
      {isNumeric && (
        <FieldGrid>
          <FieldBlock label={t("Min")}>
            <Input
              type="number"
              className="h-8 text-sm"
              value={validation.min ?? ""}
              onChange={(e) =>
                patchValidation(
                  "min",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
          </FieldBlock>
          <FieldBlock label={t("Max")}>
            <Input
              type="number"
              className="h-8 text-sm"
              value={validation.max ?? ""}
              onChange={(e) =>
                patchValidation(
                  "max",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
          </FieldBlock>
        </FieldGrid>
      )}

      {/* String length constraints */}
      {isString && (
        <FieldGrid>
          <FieldBlock label={t("Min Length")}>
            <Input
              type="number"
              className="h-8 text-sm"
              min={0}
              value={validation.minLength ?? ""}
              onChange={(e) =>
                patchValidation(
                  "minLength",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
          </FieldBlock>
          <FieldBlock label={t("Max Length")}>
            <Input
              type="number"
              className="h-8 text-sm"
              min={0}
              value={validation.maxLength ?? ""}
              onChange={(e) =>
                patchValidation(
                  "maxLength",
                  e.target.value === "" ? undefined : Number(e.target.value)
                )
              }
            />
          </FieldBlock>
        </FieldGrid>
      )}

      {/* Pattern (regex) — strings only */}
      {isString && (
        <FieldGrid>
          <FieldBlock label={t("Pattern (regex)")}>
            <Input
              className="h-8 font-mono text-sm"
              placeholder="^[a-z]+$"
              value={validation.pattern ?? ""}
              onChange={(e) =>
                patchValidation("pattern", e.target.value || undefined)
              }
            />
          </FieldBlock>
          <FieldBlock label={t("Pattern Error Message")}>
            <Input
              className="h-8 text-sm"
              placeholder={t("Invalid format")}
              value={validation.patternError ?? ""}
              onChange={(e) =>
                patchValidation("patternError", e.target.value || undefined)
              }
            />
          </FieldBlock>
        </FieldGrid>
      )}

      {/* Empty state for types with no validation options */}
      {!isNumeric && !isString && (
        <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
          {t("No validation options for this type.")}
        </div>
      )}
    </div>
  );
}
