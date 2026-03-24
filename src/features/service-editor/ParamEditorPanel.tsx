import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Layers,
  Cpu,
  FolderDown,
  Sliders,
  Type,
  Radio,
  ShieldCheck,
  GitBranch,
  PanelTop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { createDefaultParam, normalizeEmitForPreset } from "./builderUtils";
import ParamList from "./ParamList";
import ParamTypeEditor from "./ParamTypeEditor";
import EmitConfigEditor from "./EmitConfigEditor";
import ValidationEditor from "./ValidationEditor";
import ConditionEditor from "./ConditionEditor";
import UIConfigEditor from "./UIConfigEditor";
import type {
  ContractDraft,
  ExecDraft,
  ParamDraft,
} from "./param-editor-types";

/* ── Accent system ─────────────────────────────────────── */

const sectionAccents = {
  service: "border-l-primary",
  exec: "border-l-secondary",
  source: "border-l-[hsl(var(--chart-3))]",
  params: "border-l-[hsl(var(--chart-4))]",
} as const;

/* ── Shared primitives ─────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  label,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  accent: string;
}) {
  const colorClass =
    accent === "primary"
      ? "text-primary"
      : accent === "secondary"
        ? "text-secondary"
        : "text-muted-foreground";
  return (
    <div className="flex items-center gap-2 pb-2">
      {Icon && <Icon size={14} className={colorClass} />}
      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
        {label}
      </span>
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
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function BuilderSection({
  accent,
  icon,
  label,
  children,
}: {
  accent: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border border-l-[3px] bg-card p-4",
        accent
      )}
    >
      <SectionHeader
        icon={icon}
        label={label}
        accent={accent.replace("border-l-", "")}
      />
      {children}
    </div>
  );
}

/* ── Props ─────────────────────────────────────────────── */

interface ParamEditorPanelProps {
  contract: ContractDraft;
  selectedParamIndex: number;
  setSelectedParamIndex: React.Dispatch<React.SetStateAction<number>>;
  applyDraftMutation: (fn: (draft: ContractDraft) => void) => void;
}

/* ── Main Component ────────────────────────────────────── */

export default function ParamEditorPanel({
  contract,
  selectedParamIndex,
  setSelectedParamIndex,
  applyDraftMutation,
}: ParamEditorPanelProps) {
  const { t } = useTranslation();
  const params: ParamDraft[] = Array.isArray(contract?.params)
    ? contract.params
    : [];
  const execConfig = contract?.exec || ({} as Partial<ExecDraft>);
  const selected = params[selectedParamIndex] ?? null;

  /* ── Mutation helpers ────────────────────────────────── */

  const patchContract = (fn: (draft: ContractDraft) => void) => {
    applyDraftMutation((draft) => fn(draft));
  };

  const patchSelected = (fn: (param: ParamDraft, draft?: ContractDraft) => void) => {
    if (selectedParamIndex == null || selectedParamIndex < 0) return;
    applyDraftMutation((draft) => {
      if (!Array.isArray(draft.params) || !draft.params[selectedParamIndex])
        return;
      if (!draft.params[selectedParamIndex].emit) {
        draft.params[selectedParamIndex].emit = normalizeEmitForPreset(
          {},
          "arg",
          draft.params[selectedParamIndex].key
        );
      }
      fn(draft.params[selectedParamIndex], draft);
    });
  };

  const patchExec = (fn: (exec: ExecDraft, draft: ContractDraft) => void) => {
    applyDraftMutation((draft) => {
      if (!draft.exec || typeof draft.exec !== "object") {
        draft.exec = { bin: "", baseArgs: [], timeoutSeconds: 300 };
      }
      if (!Array.isArray(draft.exec!.baseArgs)) {
        draft.exec!.baseArgs = [];
      }
      fn(draft.exec as ExecDraft, draft);
    });
  };

  const patchExecSource = (
    fn: (exec: ExecDraft, draft: ContractDraft) => void
  ) => {
    applyDraftMutation((draft) => {
      if (!draft.exec || typeof draft.exec !== "object") {
        draft.exec = { bin: "", baseArgs: [], timeoutSeconds: 300 };
      }
      fn(draft.exec as ExecDraft, draft);
    });
  };

  const sourceConfig = execConfig.source || null;
  const sourceType = sourceConfig?.type || "none";

  /* ── Param list callbacks ────────────────────────────── */

  const handleAddParam = () => {
    applyDraftMutation((draft) => {
      if (!Array.isArray(draft.params)) draft.params = [];
      draft.params.push(createDefaultParam(draft.params.length));
    });
    setSelectedParamIndex(params.length);
  };

  const handleRemoveParam = (idx: number) => {
    applyDraftMutation((draft) => {
      if (!Array.isArray(draft.params) || !draft.params[idx]) return;
      draft.params.splice(idx, 1);
    });
    setSelectedParamIndex((prev: number) => {
      if (params.length <= 1) return 0;
      if (prev > idx) return prev - 1;
      return Math.min(prev, params.length - 2);
    });
  };

  const handleReorderParam = (fromIndex: number, toIndex: number) => {
    applyDraftMutation((draft) => {
      if (!Array.isArray(draft.params)) return;
      if (fromIndex < 0 || fromIndex >= draft.params.length) return;
      if (toIndex < 0 || toIndex >= draft.params.length) return;
      [draft.params[fromIndex], draft.params[toIndex]] = [
        draft.params[toIndex],
        draft.params[fromIndex],
      ];
    });
    setSelectedParamIndex(toIndex);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted/50">
      {/* Panel header */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <Sliders size={16} className="text-primary" />
        <h2 className="text-base font-bold tracking-tight">{t("Builder (v1)")}</h2>
      </div>

      <div className="space-y-4 p-5">
        {/* ── Service Metadata ──────────────────────────── */}
        <BuilderSection
          accent={sectionAccents.service}
          icon={Layers}
          label={t("Service")}
        >
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <FieldBlock label={t("Title")} className="md:col-span-2">
              <Input
                className="h-8 text-sm"
                value={contract?.title || ""}
                onChange={(e) =>
                  patchContract((draft) => {
                    draft.title = e.target.value;
                  })
                }
              />
            </FieldBlock>

            <FieldBlock label={t("Service Key")}>
              <Input
                className="h-8 font-mono text-sm"
                value={contract?.contractKey || ""}
                onChange={(e) =>
                  patchContract((draft) => {
                    draft.contractKey = e.target.value;
                  })
                }
              />
            </FieldBlock>

            <FieldBlock label={t("Version")}>
              <Input
                type="number"
                className="h-8 text-sm"
                value={contract?.version ?? 1}
                min={1}
                onChange={(e) =>
                  patchContract((draft) => {
                    const next = Number(e.target.value || 1);
                    draft.version =
                      Number.isFinite(next) && next > 0
                        ? Math.trunc(next)
                        : 1;
                  })
                }
              />
            </FieldBlock>

            <FieldBlock label={t("Description")} className="md:col-span-2">
              <Textarea
                className="min-h-0 text-xs"
                rows={2}
                value={contract?.description || ""}
                onChange={(e) =>
                  patchContract((draft) => {
                    if (!e.target.value.trim()) delete draft.description;
                    else draft.description = e.target.value;
                  })
                }
              />
            </FieldBlock>
          </div>

          <label className="mt-2 flex cursor-pointer items-center gap-2">
            <Switch
              size="sm"
              checked={contract?.requiresPort !== false}
              onCheckedChange={(checked) =>
                patchContract((draft) => {
                  draft.requiresPort = checked;
                })
              }
            />
            <span className="text-xs font-medium">{t("Requires Port")}</span>
            <span className="text-[11px] text-muted-foreground/60">
              {"-- "}
              {t("{{port}} available in baseArgs, defaults & file templates")}
            </span>
          </label>
        </BuilderSection>

        {/* ── Exec Configuration ────────────────────────── */}
        <BuilderSection
          accent={sectionAccents.exec}
          icon={Cpu}
          label={t("Exec (command prefix)")}
        >
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <FieldBlock label={t("Binary")} className="md:col-span-2">
              <Input
                className="h-8 text-sm"
                value={execConfig.bin || ""}
                onChange={(e) =>
                  patchExec((exec) => {
                    exec.bin = e.target.value;
                  })
                }
              />
            </FieldBlock>

            <FieldBlock label={t("Working Directory")}>
              <Input
                className="h-8 text-sm"
                value={execConfig.workingDir || ""}
                placeholder={t("Working Directory Placeholder")}
                onChange={(e) =>
                  patchExec((exec) => {
                    if (!e.target.value) delete exec.workingDir;
                    else exec.workingDir = e.target.value;
                  })
                }
              />
            </FieldBlock>

            <FieldBlock label={t("Timeout Seconds")}>
              <Input
                type="number"
                className="h-8 text-sm"
                value={execConfig.timeoutSeconds ?? ""}
                onChange={(e) =>
                  patchExec((exec) => {
                    if (e.target.value === "") delete exec.timeoutSeconds;
                    else exec.timeoutSeconds = Number(e.target.value);
                  })
                }
              />
            </FieldBlock>

            <FieldBlock
              label={t("Base Args (one per line)")}
              className="md:col-span-2"
            >
              <Textarea
                className="min-h-0 font-mono text-xs"
                rows={3}
                value={
                  Array.isArray(execConfig.baseArgs)
                    ? execConfig.baseArgs.join("\n")
                    : ""
                }
                onChange={(e) =>
                  patchExec((exec) => {
                    exec.baseArgs = e.target.value
                      .split("\n")
                      .map((line) => line.trim())
                      .filter(Boolean);
                  })
                }
              />
            </FieldBlock>
          </div>
        </BuilderSection>

        {/* ── Source Configuration ───────────────────────── */}
        <BuilderSection
          accent={sectionAccents.source}
          icon={FolderDown}
          label={t("Source (binary acquisition)")}
        >
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <FieldBlock label={t("Source Type")} className="md:col-span-2">
              <Select
                value={sourceType}
                onValueChange={(val) =>
                  patchExecSource((exec) => {
                    if (val === "none") {
                      delete exec.source;
                    } else {
                      exec.source = { type: val };
                    }
                  })
                }
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("None (uploaded file)")}</SelectItem>
                  <SelectItem value="github">{t("GitHub Release")}</SelectItem>
                  <SelectItem value="url">{t("URL Download")}</SelectItem>
                  <SelectItem value="package">
                    {t("Package Manager")}
                  </SelectItem>
                  <SelectItem value="upload">
                    {t("Upload (explicit)")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FieldBlock>

            {/* GitHub source fields */}
            {sourceType === "github" && (
              <>
                <FieldBlock label={t("Repository")} className="md:col-span-2">
                  <Input
                    className="h-8 font-mono text-sm"
                    placeholder="owner/repo"
                    value={sourceConfig?.repo || ""}
                    onChange={(e) =>
                      patchExecSource((exec) => {
                        if (!e.target.value) delete exec.source!.repo;
                        else exec.source!.repo = e.target.value;
                      })
                    }
                  />
                </FieldBlock>
                <FieldBlock label={t("Asset Pattern")} className="md:col-span-2">
                  <Input
                    className="h-8 font-mono text-sm"
                    placeholder="binary-*-linux-{arch}.tar.gz"
                    value={sourceConfig?.assetPattern || ""}
                    onChange={(e) =>
                      patchExecSource((exec) => {
                        if (!e.target.value) delete exec.source!.assetPattern;
                        else exec.source!.assetPattern = e.target.value;
                      })
                    }
                  />
                </FieldBlock>
                <FieldBlock label={t("Tag")}>
                  <Input
                    className="h-8 font-mono text-sm"
                    placeholder="latest"
                    value={sourceConfig?.tag || ""}
                    onChange={(e) =>
                      patchExecSource((exec) => {
                        if (!e.target.value) delete exec.source!.tag;
                        else exec.source!.tag = e.target.value;
                      })
                    }
                  />
                </FieldBlock>
                <FieldBlock label={t("Extract Path")}>
                  <Input
                    className="h-8 font-mono text-sm"
                    placeholder="path/to/binary"
                    value={sourceConfig?.extractPath || ""}
                    onChange={(e) =>
                      patchExecSource((exec) => {
                        if (!e.target.value) delete exec.source!.extractPath;
                        else exec.source!.extractPath = e.target.value;
                      })
                    }
                  />
                </FieldBlock>
                <FieldBlock label={t("Strip Components")}>
                  <Input
                    type="number"
                    className="h-8 text-sm"
                    min={0}
                    value={sourceConfig?.strip ?? ""}
                    onChange={(e) =>
                      patchExecSource((exec) => {
                        if (e.target.value === "") delete exec.source!.strip;
                        else exec.source!.strip = Number(e.target.value);
                      })
                    }
                  />
                </FieldBlock>
              </>
            )}

            {/* URL source fields */}
            {sourceType === "url" && (
              <>
                <FieldBlock label={t("URL")} className="md:col-span-2">
                  <Input
                    className="h-8 font-mono text-sm"
                    placeholder="https://..."
                    value={sourceConfig?.url || ""}
                    onChange={(e) =>
                      patchExecSource((exec) => {
                        if (!e.target.value) delete exec.source!.url;
                        else exec.source!.url = e.target.value;
                      })
                    }
                  />
                </FieldBlock>
                <div className="md:col-span-2">
                  <span className="mb-1 block text-[11px] text-muted-foreground">
                    {t("Arch-specific URLs")}
                  </span>
                  <div className="space-y-1">
                    {["x86_64", "aarch64", "armv7l"].map((arch) => (
                      <FieldBlock key={arch} label={arch}>
                        <Input
                          className="h-8 font-mono text-sm"
                          placeholder="https://..."
                          value={sourceConfig?.arch?.[arch] || ""}
                          onChange={(e) =>
                            patchExecSource((exec) => {
                              if (!e.target.value) {
                                if (exec.source!.arch)
                                  delete exec.source!.arch[arch];
                                if (
                                  exec.source!.arch &&
                                  !Object.values(exec.source!.arch).some(
                                    Boolean
                                  )
                                )
                                  delete exec.source!.arch;
                              } else {
                                if (!exec.source!.arch) exec.source!.arch = {};
                                exec.source!.arch[arch] = e.target.value;
                              }
                            })
                          }
                        />
                      </FieldBlock>
                    ))}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground/50">
                    {t("Provide either a single URL or arch-specific URLs")}
                  </div>
                </div>
                <FieldBlock label={t("Extract Path")}>
                  <Input
                    className="h-8 font-mono text-sm"
                    placeholder="path/to/binary"
                    value={sourceConfig?.extractPath || ""}
                    onChange={(e) =>
                      patchExecSource((exec) => {
                        if (!e.target.value) delete exec.source!.extractPath;
                        else exec.source!.extractPath = e.target.value;
                      })
                    }
                  />
                </FieldBlock>
                <FieldBlock label={t("Strip Components")}>
                  <Input
                    type="number"
                    className="h-8 text-sm"
                    min={0}
                    value={sourceConfig?.strip ?? ""}
                    onChange={(e) =>
                      patchExecSource((exec) => {
                        if (e.target.value === "") delete exec.source!.strip;
                        else exec.source!.strip = Number(e.target.value);
                      })
                    }
                  />
                </FieldBlock>
              </>
            )}

            {/* Package source fields */}
            {sourceType === "package" && (
              <FieldBlock label={t("Package Name")} className="md:col-span-2">
                <Input
                  className="h-8 font-mono text-sm"
                  placeholder="nginx"
                  value={sourceConfig?.packageName || ""}
                  onChange={(e) =>
                    patchExecSource((exec) => {
                      if (!e.target.value) delete exec.source!.packageName;
                      else exec.source!.packageName = e.target.value;
                    })
                  }
                />
              </FieldBlock>
            )}

            {/* Upload source info */}
            {sourceType === "upload" && (
              <div className="text-xs text-muted-foreground md:col-span-2">
                {t("Binary will be provided via file upload")}
              </div>
            )}
          </div>
        </BuilderSection>

        {/* ── Params ────────────────────────────────────── */}
        <div
          className={cn(
            "rounded-xl border border-border border-l-[3px] bg-card p-4",
            sectionAccents.params
          )}
        >
          <div className="flex items-center justify-between pb-3">
            <SectionHeader icon={Sliders} label={t("Params")} accent="info" />
            <Button
              type="button"
              size="xs"
              className="gap-1"
              onClick={handleAddParam}
            >
              <Plus className="size-3.5" />
              {t("Add Param")}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            {/* Left: Param list */}
            <ParamList
              params={params}
              selectedIndex={selectedParamIndex}
              onSelect={setSelectedParamIndex}
              onAdd={handleAddParam}
              onRemove={handleRemoveParam}
              onReorder={handleReorderParam}
            />

            {/* Right: Selected param editor */}
            <AnimatePresence mode="wait">
              {!selected ? (
                <motion.div
                  key="no-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-20 items-center justify-center rounded-xl bg-muted/40 text-sm text-muted-foreground"
                >
                  {t("Select a param to edit.")}
                </motion.div>
              ) : (
                <motion.div
                  key={`param-${selectedParamIndex}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl border border-border bg-muted/30 p-4"
                >
                  <Tabs defaultValue="type">
                    <TabsList className="mb-3 w-full">
                      <TabsTrigger value="type" className="gap-1 text-xs">
                        <Type className="size-3" />
                        {t("Type")}
                      </TabsTrigger>
                      <TabsTrigger value="emit" className="gap-1 text-xs">
                        <Radio className="size-3" />
                        {t("Emit")}
                      </TabsTrigger>
                      <TabsTrigger value="validation" className="gap-1 text-xs">
                        <ShieldCheck className="size-3" />
                        {t("Validation")}
                      </TabsTrigger>
                      <TabsTrigger value="conditions" className="gap-1 text-xs">
                        <GitBranch className="size-3" />
                        {t("Conditions")}
                      </TabsTrigger>
                      <TabsTrigger value="ui" className="gap-1 text-xs">
                        <PanelTop className="size-3" />
                        {t("UI")}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="type">
                      <ParamTypeEditor
                        param={selected}
                        onChange={patchSelected}
                      />
                    </TabsContent>

                    <TabsContent value="emit">
                      <EmitConfigEditor
                        param={selected}
                        onChange={patchSelected}
                      />
                    </TabsContent>

                    <TabsContent value="validation">
                      <ValidationEditor
                        param={selected}
                        onChange={patchSelected}
                      />
                    </TabsContent>

                    <TabsContent value="conditions">
                      <ConditionEditor
                        param={selected}
                        onChange={patchSelected}
                      />
                    </TabsContent>

                    <TabsContent value="ui">
                      <UIConfigEditor
                        param={selected}
                        onChange={patchSelected}
                      />
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
