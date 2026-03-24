import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Code2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AuthoringJsonPanelProps {
  selectedId: string | number | null;
  editorText: string;
  setEditorText: (text: string) => void;
  parseError: string | null;
  adapterError: string | null;
  setCompileResult: (result: unknown) => void;
}

const AuthoringJsonPanel = memo(function AuthoringJsonPanel({
  selectedId,
  editorText,
  setEditorText,
  parseError,
  adapterError,
  setCompileResult,
}: AuthoringJsonPanelProps) {
  const { t } = useTranslation();

  const lineCount = editorText.split("\n").length;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card xl:col-span-6">
      {/* Header bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <Code2 size={15} className="text-primary" />
        <h2 className="text-sm font-bold tracking-wide">{t("Authoring Schema JSON")}</h2>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[11px] tabular-nums text-muted-foreground/60">{lineCount} lines</span>
          <span className={cn(
            "rounded-md px-2 py-0.5 text-[11px] font-medium",
            selectedId
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          )}>
            {selectedId ? `#${selectedId}` : t("Unsaved Draft")}
          </span>
        </div>
      </div>

      {/* Editor area */}
      <div className="relative flex-1">
        <Textarea
          className="h-[70vh] w-full resize-none rounded-none border-0 bg-muted/40 p-4 font-mono text-[13px] leading-relaxed text-foreground/90 placeholder:text-muted-foreground/30 focus-visible:ring-0"
          value={editorText}
          onChange={(e) => {
            setEditorText(e.target.value);
            setCompileResult(null);
          }}
          spellCheck={false}
        />
      </div>

      {/* Error strip */}
      {parseError && (
        <div className="border-t-2 border-destructive/40 bg-destructive/5 px-4 py-2 text-xs text-destructive">
          JSON parse error: {parseError}
        </div>
      )}
      {!parseError && adapterError && (
        <div className="border-t-2 border-yellow-500/40 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-600 dark:text-yellow-400">
          Form adapter error: {adapterError}
        </div>
      )}
    </div>
  );
});

export default AuthoringJsonPanel;
