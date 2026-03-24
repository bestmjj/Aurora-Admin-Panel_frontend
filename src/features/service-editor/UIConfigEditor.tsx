import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

/* ── Grid span presets ─────────────────────────────────── */

const GRID_PRESETS = [
  { value: "full", label: "Full width (12)", base: 12, md: 12 },
  { value: "half", label: "Half (6)", base: 12, md: 6 },
  { value: "third", label: "Third (4)", base: 12, md: 4 },
  { value: "quarter", label: "Quarter (3)", base: 12, md: 3 },
  { value: "two-thirds", label: "Two thirds (8)", base: 12, md: 8 },
] as const;

function getGridPresetValue(
  ui: ParamEditorProps["param"]["ui"]
): string {
  const md = ui?.grid?.colSpan?.md;
  if (md === 12) return "full";
  if (md === 6) return "half";
  if (md === 4) return "third";
  if (md === 3) return "quarter";
  if (md === 8) return "two-thirds";
  return "half"; // default
}

/* ── Main component ────────────────────────────────────── */

export default function UIConfigEditor({ param, onChange }: ParamEditorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {/* Grid span */}
      <FieldGrid>
        <FieldBlock label={t("Grid Column Span")}>
          <Select
            value={getGridPresetValue(param.ui)}
            onValueChange={(preset) => {
              const found = GRID_PRESETS.find((p) => p.value === preset);
              if (!found) return;
              onChange((p) => {
                if (!p.ui) p.ui = {};
                p.ui.grid = {
                  colSpan: { base: found.base, md: found.md },
                };
              });
            }}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRID_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldBlock>
      </FieldGrid>

      {/* Placeholder */}
      <FieldBlock label={t("Placeholder")}>
        <Input
          className="h-8 text-sm"
          placeholder={t("Input placeholder text")}
          value={param.ui?.placeholder ?? ""}
          onChange={(e) =>
            onChange((p) => {
              if (!p.ui) p.ui = {};
              if (!e.target.value) {
                delete p.ui.placeholder;
              } else {
                p.ui.placeholder = e.target.value;
              }
              // Clean up empty ui
              if (
                Object.keys(p.ui).length === 0 ||
                (Object.keys(p.ui).length === 1 && p.ui.grid)
              ) {
                // keep grid if it exists, just remove placeholder
              }
            })
          }
        />
      </FieldBlock>

      {/* Description / help text */}
      <FieldBlock label={t("Help Text")}>
        <Textarea
          className="min-h-0 text-sm"
          rows={2}
          placeholder={t("Description shown below the field")}
          value={param.ui?.description ?? ""}
          onChange={(e) =>
            onChange((p) => {
              if (!p.ui) p.ui = {};
              if (!e.target.value) {
                delete p.ui.description;
              } else {
                p.ui.description = e.target.value;
              }
            })
          }
        />
      </FieldBlock>
    </div>
  );
}
