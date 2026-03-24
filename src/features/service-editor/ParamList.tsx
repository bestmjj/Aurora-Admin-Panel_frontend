import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { getEmitPresetKind, createDefaultParam } from "./builderUtils";
import type { ParamDraft, ContractDraft } from "./param-editor-types";

/* ── Types ──────────────────────────────────────────────── */

interface ParamListProps {
  params: ParamDraft[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

/* ── Single row ─────────────────────────────────────────── */

const ParamListRow = memo(function ParamListRow({
  param,
  idx,
  isSelected,
  paramsLength,
  onSelect,
  onRemove,
  onReorder,
}: {
  param: ParamDraft;
  idx: number;
  isSelected: boolean;
  paramsLength: number;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}) {
  return (
    <div
      className={cn(
        "group cursor-pointer rounded-lg border-l-[3px] p-2.5 transition-all duration-150",
        isSelected
          ? "border-l-primary bg-primary/8 shadow-sm"
          : "border-l-transparent bg-card hover:bg-muted/60"
      )}
      onClick={() => onSelect(idx)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(idx);
        }
      }}
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {param.label || param.key}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <code className="font-mono">{param.key}</code>
            <span>·</span>
            <span className="rounded bg-muted px-1 py-px">{param.type}</span>
            <span>·</span>
            <span>{getEmitPresetKind(param)}</span>
          </div>
        </div>

        <div
          className={cn(
            "ml-2 flex shrink-0 gap-0.5 transition-opacity",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              if (idx > 0) onReorder(idx, idx - 1);
            }}
            disabled={idx === 0}
          >
            <ChevronUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              if (idx < paramsLength - 1) onReorder(idx, idx + 1);
            }}
            disabled={idx === paramsLength - 1}
          >
            <ChevronDown className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-destructive/60 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(idx);
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
});

/* ── ParamList ──────────────────────────────────────────── */

export default function ParamList({
  params,
  selectedIndex,
  onSelect,
  onAdd,
  onRemove,
  onReorder,
}: ParamListProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-1.5">
      <ScrollArea className="max-h-80 pr-1">
        <div className="space-y-1">
          {params.map((param, idx) => (
            <ParamListRow
              key={`${param.key}-${idx}`}
              param={param}
              idx={idx}
              isSelected={idx === selectedIndex}
              paramsLength={params.length}
              onSelect={onSelect}
              onRemove={onRemove}
              onReorder={onReorder}
            />
          ))}
          {params.length === 0 && (
            <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
              {t("No params yet. Add one to start.")}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
