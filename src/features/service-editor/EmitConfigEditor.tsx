import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEmitPresetKind, splitArgPrefix, joinArgPrefix } from "./builderUtils";
import type { ParamEditorProps } from "./param-editor-types";

/* ── Layout helpers ────────────────────────────────────── */

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

/* ── Prefix + Name input combo ─────────────────────────── */

function PrefixedArgInput({
  label,
  value,
  onChangeValue,
}: {
  label: string;
  value: string | undefined;
  onChangeValue: (full: string) => void;
}) {
  const { prefix, name } = splitArgPrefix(value);
  return (
    <FieldBlock label={label}>
      <div className="flex w-full">
        <Select
          value={prefix}
          onValueChange={(p) => onChangeValue(joinArgPrefix(p, name))}
        >
          <SelectTrigger size="sm" className="w-16 shrink-0 rounded-r-none border-r-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="--">--</SelectItem>
            <SelectItem value="-">-</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="h-8 min-w-0 flex-1 rounded-l-none text-sm"
          value={name}
          onChange={(e) => onChangeValue(joinArgPrefix(prefix, e.target.value))}
        />
      </div>
    </FieldBlock>
  );
}

/* ── Main component ────────────────────────────────────── */

export default function EmitConfigEditor({ param, onChange }: ParamEditorProps) {
  const { t } = useTranslation();
  const emitPreset = getEmitPresetKind(param);

  return (
    <div className="space-y-2">
      {/* Arg */}
      {emitPreset === "arg" && (
        <FieldGrid>
          <PrefixedArgInput
            label={t("Arg")}
            value={param.emit?.arg}
            onChangeValue={(val) =>
              onChange((p) => {
                if (!p.emit) p.emit = {};
                p.emit.arg = val;
              })
            }
          />
          <FieldBlock label={t("Mode (lists only)")}>
            <Select
              value={param.emit?.mode || "repeat"}
              onValueChange={(val) =>
                onChange((p) => {
                  if (!p.emit) p.emit = {};
                  if (val === "repeat") delete p.emit.mode;
                  else p.emit.mode = val;
                })
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="repeat">repeat</SelectItem>
                <SelectItem value="csv">csv</SelectItem>
              </SelectContent>
            </Select>
          </FieldBlock>
        </FieldGrid>
      )}

      {/* Flag */}
      {emitPreset === "flag" && (
        <PrefixedArgInput
          label={t("Flag")}
          value={param.emit?.flag}
          onChangeValue={(val) =>
            onChange((p) => {
              if (!p.emit) p.emit = {};
              p.emit.flag = val;
            })
          }
        />
      )}

      {/* Flag True / False pair */}
      {emitPreset === "flagTrue" && (
        <FieldGrid>
          <PrefixedArgInput
            label={t("Flag True")}
            value={param.emit?.flagTrue}
            onChangeValue={(val) =>
              onChange((p) => {
                if (!p.emit) p.emit = {};
                p.emit.flagTrue = val;
              })
            }
          />
          <FieldBlock label={t("Flag False")}>
            <Input
              className="h-8 text-sm"
              value={param.emit?.flagFalse || ""}
              onChange={(e) =>
                onChange((p) => {
                  if (!p.emit) p.emit = {};
                  if (!e.target.value) delete p.emit.flagFalse;
                  else p.emit.flagFalse = e.target.value;
                })
              }
            />
          </FieldBlock>
        </FieldGrid>
      )}

      {/* Env */}
      {emitPreset === "env" && (
        <FieldBlock label={t("Env")}>
          <Input
            className="h-8 text-sm"
            value={param.emit?.env || ""}
            onChange={(e) =>
              onChange((p) => {
                if (!p.emit) p.emit = {};
                p.emit.env = e.target.value;
              })
            }
          />
        </FieldBlock>
      )}

      {/* Positional */}
      {emitPreset === "pos" && (
        <FieldBlock label={t("Position")}>
          <Input
            type="number"
            className="h-8 text-sm"
            value={param.emit?.pos ?? 0}
            onChange={(e) =>
              onChange((p) => {
                if (!p.emit) p.emit = {};
                p.emit.pos = Number(e.target.value || 0);
              })
            }
          />
        </FieldBlock>
      )}

      {/* File */}
      {emitPreset === "file" && (
        <div className="space-y-2">
          <FieldBlock label={t("Path Template")}>
            <Input
              className="h-8 text-sm"
              value={param.emit?.file?.pathTemplate || ""}
              onChange={(e) =>
                onChange((p) => {
                  if (!p.emit) p.emit = {};
                  p.emit.file = {
                    ...(p.emit.file || {}),
                    pathTemplate: e.target.value,
                  };
                })
              }
            />
          </FieldBlock>
          <FieldGrid>
            <FieldBlock label={t("Format")}>
              <Select
                value={param.emit?.file?.format || "json"}
                onValueChange={(val) =>
                  onChange((p) => {
                    if (!p.emit) p.emit = {};
                    p.emit.file = {
                      ...(p.emit.file || {}),
                      format: val,
                    };
                  })
                }
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">json</SelectItem>
                  <SelectItem value="raw">raw</SelectItem>
                </SelectContent>
              </Select>
            </FieldBlock>
            <FieldBlock label={t("Encoding")}>
              <Input
                className="h-8 text-sm"
                value={param.emit?.file?.encoding || "utf-8"}
                onChange={(e) =>
                  onChange((p) => {
                    if (!p.emit) p.emit = {};
                    p.emit.file = {
                      ...(p.emit.file || {}),
                      encoding: e.target.value,
                    };
                  })
                }
              />
            </FieldBlock>
          </FieldGrid>
        </div>
      )}

      {/* Stdin */}
      {emitPreset === "stdin" && (
        <FieldGrid>
          <FieldBlock label={t("Format")}>
            <Select
              value={param.emit?.stdin?.format || "raw"}
              onValueChange={(val) =>
                onChange((p) => {
                  if (!p.emit) p.emit = {};
                  p.emit.stdin = {
                    ...(p.emit.stdin || {}),
                    format: val,
                  };
                })
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raw">raw</SelectItem>
                <SelectItem value="json">json</SelectItem>
              </SelectContent>
            </Select>
          </FieldBlock>
          <FieldBlock label={t("Encoding")}>
            <Input
              className="h-8 text-sm"
              value={param.emit?.stdin?.encoding || "utf-8"}
              onChange={(e) =>
                onChange((p) => {
                  if (!p.emit) p.emit = {};
                  p.emit.stdin = {
                    ...(p.emit.stdin || {}),
                    encoding: e.target.value,
                  };
                })
              }
            />
          </FieldBlock>
        </FieldGrid>
      )}
    </div>
  );
}
