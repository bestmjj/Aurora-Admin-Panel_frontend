import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getEmitPresetKind,
  normalizeEmitForPreset,
  splitArgPrefix,
  joinArgPrefix,
  parseDefaultInputByType,
  prettyJson,
} from "./builderUtils";
import type { ParamEditorProps, EmitPresetKind } from "./param-editor-types";

/* ── Shared layout helpers ─────────────────────────────── */

function FieldGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-2 md:grid-cols-2 ${className}`.trim()}>
      {children}
    </div>
  );
}

function FieldBlock({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 transition-colors hover:bg-muted">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Switch size="sm" checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

/* ── Param type options ────────────────────────────────── */

const PARAM_TYPES = [
  "string",
  "int",
  "float",
  "bool",
  "enum",
  "secret",
  "list",
  "object",
] as const;

const WIDGET_OPTIONS = ["text", "textarea", "email"] as const;

/* ── Main component ────────────────────────────────────── */

export default function ParamTypeEditor({ param, onChange }: ParamEditorProps) {
  const { t } = useTranslation();
  const emitPreset = getEmitPresetKind(param);

  return (
    <div className="space-y-3">
      {/* Key + Label */}
      <FieldGrid>
        <FieldBlock label={t("Key")}>
          <Input
            className="h-8 text-sm"
            value={param.key || ""}
            onChange={(e) =>
              onChange((p) => {
                p.key = e.target.value;
                p.label = p.label || e.target.value;
                p.emit = normalizeEmitForPreset(
                  p.emit || {},
                  getEmitPresetKind(p),
                  e.target.value || p.key
                );
              })
            }
          />
        </FieldBlock>
        <FieldBlock label={t("Label")}>
          <Input
            className="h-8 text-sm"
            value={param.label || ""}
            onChange={(e) =>
              onChange((p) => {
                p.label = e.target.value;
              })
            }
          />
        </FieldBlock>
      </FieldGrid>

      {/* Type + Emit Preset */}
      <FieldGrid>
        <FieldBlock label={t("Type")}>
          <Select
            value={param.type || "string"}
            onValueChange={(nextType) =>
              onChange((p) => {
                p.type = nextType;
                if (nextType === "enum" && !Array.isArray(p.options)) {
                  p.options = [{ value: "option1", label: "Option 1" }];
                }
                if (nextType !== "enum") delete p.options;
                if (nextType === "list" && !p.items) {
                  p.items = {
                    key: `${p.key || "item"}_item`,
                    type: "string",
                    label: "Item",
                  };
                }
                if (nextType !== "list") delete p.items;
                if (nextType === "object" && !Array.isArray(p.properties)) {
                  p.properties = [
                    { key: "field1", type: "string", label: "Field 1" },
                  ];
                }
                if (nextType !== "object") delete p.properties;
                if (nextType === "secret") {
                  p.secret = true;
                  p.ui = { ...(p.ui || {}), widget: "password" };
                }
                if (
                  nextType === "bool" &&
                  !["flag", "flagTrue", "env", "arg"].includes(
                    getEmitPresetKind(p)
                  )
                ) {
                  const prev = splitArgPrefix(p.emit?.flag);
                  const prefix = prev.name ? prev.prefix : "--";
                  p.emit = {
                    flag: joinArgPrefix(
                      prefix,
                      String(p.key || "flag").replaceAll("_", "-")
                    ),
                  };
                }
              })
            }
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PARAM_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldBlock>

        <FieldBlock label={t("Emit Preset")}>
          <Select
            value={emitPreset}
            onValueChange={(preset) =>
              onChange((p) => {
                p.emit = normalizeEmitForPreset(
                  p.emit || {},
                  preset,
                  p.key
                );
              })
            }
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arg">{t("Arg Preset Label")}</SelectItem>
              <SelectItem value="flag">{t("Flag Preset Label")}</SelectItem>
              <SelectItem value="flagTrue">
                {t("Flag Pair Preset Label")}
              </SelectItem>
              <SelectItem value="env">{t("Env Preset Label")}</SelectItem>
              <SelectItem value="pos">
                {t("Positional Preset Label")}
              </SelectItem>
              <SelectItem value="file">{t("File Preset Label")}</SelectItem>
              <SelectItem value="stdin">{t("Stdin Preset Label")}</SelectItem>
            </SelectContent>
          </Select>
        </FieldBlock>
      </FieldGrid>

      {/* Widget (string type only) */}
      {param.type === "string" && (
        <FieldGrid>
          <FieldBlock label={t("Widget")}>
            <Select
              value={
                param.ui?.widget === "textarea"
                  ? "textarea"
                  : param.ui?.widget === "email"
                    ? "email"
                    : "text"
              }
              onValueChange={(w) =>
                onChange((p) => {
                  if (w === "text") {
                    if (p.ui) {
                      delete p.ui.widget;
                      if (!Object.keys(p.ui).length) delete p.ui;
                    }
                  } else {
                    if (!p.ui) p.ui = {};
                    p.ui.widget = w;
                  }
                })
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WIDGET_OPTIONS.map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldBlock>
        </FieldGrid>
      )}

      {/* Required + Secret toggles */}
      <FieldGrid>
        <ToggleRow
          label={t("Required")}
          checked={Boolean(param.required)}
          onChange={(checked) =>
            onChange((p) => {
              p.required = checked;
            })
          }
        />
        <ToggleRow
          label={t("Secret")}
          checked={Boolean(param.secret || param.type === "secret")}
          onChange={(checked) =>
            onChange((p) => {
              p.secret = checked;
            })
          }
        />
      </FieldGrid>

      {/* Default value */}
      <div className="space-y-1">
        <span className="text-[11px] font-medium text-muted-foreground">
          {t("Default")}
        </span>
        {param.type === "bool" ? (
          <ToggleRow
            label={t("Default")}
            checked={Boolean(param.default)}
            onChange={(checked) =>
              onChange((p) => {
                p.default = checked;
              })
            }
          />
        ) : (
          <Textarea
            className="min-h-0 font-mono text-xs"
            rows={
              param.type === "object" || param.type === "list" ? 3 : 2
            }
            value={
              param.default === undefined
                ? ""
                : typeof param.default === "object"
                  ? prettyJson(param.default)
                  : String(param.default)
            }
            onChange={(e) =>
              onChange((p) => {
                const parsed = parseDefaultInputByType(
                  p.type,
                  e.target.value
                );
                if (parsed === undefined) delete p.default;
                else p.default = parsed;
              })
            }
          />
        )}
      </div>

      {/* Enum options */}
      {param.type === "enum" && (
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            {t("Enum Options Hint")}
          </span>
          <Textarea
            className="min-h-0 font-mono text-xs"
            rows={4}
            value={(param.options || [])
              .map((opt) =>
                typeof opt === "object"
                  ? `${opt.value}${opt.label ? ` | ${opt.label}` : ""}`
                  : String(opt)
              )
              .join("\n")}
            onChange={(e) =>
              onChange((p) => {
                p.options = e.target.value
                  .split("\n")
                  .map((line) => line.trim())
                  .filter(Boolean)
                  .map((line) => {
                    const [value, label] = line
                      .split("|")
                      .map((x) => x?.trim());
                    return label
                      ? { value, label }
                      : { value, label: value };
                  });
              })
            }
          />
        </div>
      )}
    </div>
  );
}
