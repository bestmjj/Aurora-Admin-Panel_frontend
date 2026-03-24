import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ParamEditorProps, ConditionDraft } from "./param-editor-types";

/* ── Layout helpers ────────────────────────────────────── */

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

const OPERATORS = [
  { value: "eq", label: "equals" },
  { value: "neq", label: "not equals" },
  { value: "in", label: "in list" },
] as const;

/* ── Main component ────────────────────────────────────── */

export default function ConditionEditor({ param, onChange }: ParamEditorProps) {
  const { t } = useTranslation();
  const conditions = param.conditions || [];

  const addCondition = () => {
    onChange((p) => {
      if (!p.conditions) p.conditions = [];
      p.conditions.push({ when: "", operator: "eq", eq: "" });
    });
  };

  const removeCondition = (index: number) => {
    onChange((p) => {
      if (!Array.isArray(p.conditions)) return;
      p.conditions.splice(index, 1);
      if (p.conditions.length === 0) delete p.conditions;
    });
  };

  const patchCondition = (
    index: number,
    updates: Partial<ConditionDraft>
  ) => {
    onChange((p) => {
      if (!Array.isArray(p.conditions) || !p.conditions[index]) return;
      Object.assign(p.conditions[index], updates);
    });
  };

  return (
    <div className="space-y-3">
      {conditions.map((cond, idx) => (
        <div
          key={idx}
          className="space-y-2 rounded-lg border border-border bg-muted/30 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t("Condition")} {idx + 1}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="text-destructive/60 hover:text-destructive"
              onClick={() => removeCondition(idx)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <FieldBlock label={t("When (param key)")}>
              <Input
                className="h-8 font-mono text-sm"
                placeholder="other_param"
                value={cond.when || ""}
                onChange={(e) =>
                  patchCondition(idx, { when: e.target.value })
                }
              />
            </FieldBlock>

            <FieldBlock label={t("Operator")}>
              <Select
                value={cond.operator || "eq"}
                onValueChange={(op) => {
                  const updates: Partial<ConditionDraft> = { operator: op };
                  // Reset value fields when operator changes
                  if (op === "in") {
                    updates.in = [];
                    delete (cond as Record<string, unknown>).eq;
                    delete (cond as Record<string, unknown>).neq;
                  } else if (op === "eq") {
                    updates.eq = "";
                    delete (cond as Record<string, unknown>).neq;
                    delete (cond as Record<string, unknown>).in;
                  } else if (op === "neq") {
                    updates.neq = "";
                    delete (cond as Record<string, unknown>).eq;
                    delete (cond as Record<string, unknown>).in;
                  }
                  patchCondition(idx, updates);
                }}
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBlock>

            <FieldBlock label={t("Value")}>
              <Input
                className="h-8 text-sm"
                placeholder={
                  (cond.operator || "eq") === "in"
                    ? "val1, val2, val3"
                    : "value"
                }
                value={
                  (cond.operator || "eq") === "in"
                    ? Array.isArray(cond.in)
                      ? cond.in.join(", ")
                      : ""
                    : (cond.operator || "eq") === "neq"
                      ? String(cond.neq ?? "")
                      : String(cond.eq ?? "")
                }
                onChange={(e) => {
                  const op = cond.operator || "eq";
                  if (op === "in") {
                    patchCondition(idx, {
                      in: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    });
                  } else if (op === "neq") {
                    patchCondition(idx, { neq: e.target.value });
                  } else {
                    patchCondition(idx, { eq: e.target.value });
                  }
                }}
              />
            </FieldBlock>
          </div>
        </div>
      ))}

      {conditions.length === 0 && (
        <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
          {t("No conditions. This param is always visible.")}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={addCondition}
      >
        <Plus className="size-3.5" />
        {t("Add Condition")}
      </Button>
    </div>
  );
}
