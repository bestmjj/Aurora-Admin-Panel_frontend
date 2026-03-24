import { memo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Types ─────────────────────────────────────────────── */

interface CompileWarning {
  code?: string;
  message?: string;
}

interface CompileDetail {
  loc?: string[];
  msg?: string;
  type?: string;
}

interface CompilePreview {
  shell?: string;
  env?: Record<string, string>;
  files?: unknown[];
  stdin?: unknown;
}

interface CompileResultShape {
  ok?: boolean;
  preview?: CompilePreview;
  warnings?: CompileWarning[];
  error?: string;
  details?: CompileDetail[];
}

/* ── Sub-components ────────────────────────────────────── */

function CompileOutputSectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">{children}</div>;
}

function CompileOutputEmptyState({ lastValues, t }: { lastValues: unknown; t: (key: string) => string }) {
  return (
    <div className="flex h-24 flex-col items-center justify-center gap-1 text-muted-foreground/40">
      <Terminal size={20} />
      <span className="text-xs">
        {lastValues ? t("No compile result yet") : t("Preview Auto Updates While Editing")}
      </span>
    </div>
  );
}

function CompileOutputErrorState({ compileResult }: { compileResult: CompileResultShape }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-2 font-bold text-destructive">
        <XCircle size={14} />
        {t("Compile Failed")}
      </div>
      <div className="whitespace-pre-wrap break-words text-foreground/70">
        {compileResult?.error || t("Unknown Compile Error")}
      </div>
      {Array.isArray(compileResult?.details) && compileResult.details.length > 0 ? (
        <div className="space-y-1">
          <div className="font-medium text-muted-foreground">
            {t("Compile Validation Details Count", { count: compileResult.details.length })}
          </div>
          <ul className="list-disc space-y-1 pl-4 text-muted-foreground/80">
            {compileResult.details.slice(0, 5).map((detail, idx) => (
              <li key={idx} className="break-words">
                {Array.isArray(detail.loc) && detail.loc.length > 0 && (
                  <span className="font-mono font-semibold text-destructive/80">{detail.loc.join(" > ")}: </span>
                )}
                {detail.msg || detail.type || JSON.stringify(detail)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function CompileWarningsList({ warnings }: { warnings: CompileWarning[] }) {
  const { t } = useTranslation();
  if (!warnings.length) return null;

  return (
    <div className="space-y-1">
      <CompileOutputSectionTitle>{t("Warnings")}</CompileOutputSectionTitle>
      <ul className="space-y-1 pl-4 text-yellow-600 dark:text-yellow-400">
        {warnings.slice(0, 5).map((warning, idx) => (
          <li key={`${warning.code || "warn"}-${idx}`} className="flex items-start gap-1.5 break-words">
            <AlertTriangle size={11} className="mt-0.5 shrink-0" />
            <span>{warning.message || warning.code || t("Warning")}</span>
          </li>
        ))}
        {warnings.length > 5 ? (
          <li className="text-muted-foreground/60">{t("Compile More Warnings Count", { count: warnings.length - 5 })}</li>
        ) : null}
      </ul>
    </div>
  );
}

interface SuccessStateProps {
  preview: CompilePreview;
  warnings: CompileWarning[];
  envCount: number;
  fileCount: number;
  hasStdin: boolean;
}

function CompileOutputSuccessState({ preview, warnings, envCount, fileCount, hasStdin }: SuccessStateProps) {
  const { t } = useTranslation();
  return (
    <motion.div
      className="space-y-3 text-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <CheckCircle2 size={14} className="text-emerald-500" />
        <span className="font-bold text-emerald-500">{t("Ready")}</span>
        {warnings.length > 0 && (
          <span className="text-muted-foreground/60">
            {t("Compiled With Warning Count", { count: warnings.length })}
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <CompileOutputSectionTitle>{t("Command")}</CompileOutputSectionTitle>
        <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-muted/70 p-3 font-mono text-[12px] leading-relaxed text-foreground/80">
          {preview.shell || t("No Shell Preview Available")}
        </pre>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[
          { label: t("Compile Summary Env Count", { count: envCount }), show: true },
          { label: t("Compile Summary Files Count", { count: fileCount }), show: true },
          { label: t("Compile Summary Stdin", { value: t(hasStdin ? "Yes" : "No") }), show: true },
        ].filter(b => b.show).map((b, i) => (
          <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            {b.label}
          </span>
        ))}
      </div>

      <CompileWarningsList warnings={warnings} />
    </motion.div>
  );
}

/* ── Main Panel ────────────────────────────────────────── */

interface CompileOutputPanelProps {
  compileResult: CompileResultShape | null;
  lastValues: unknown;
}

const CompileOutputPanel = memo(function CompileOutputPanel({ compileResult, lastValues }: CompileOutputPanelProps) {
  const { t } = useTranslation();
  const isOk = Boolean(compileResult?.ok);
  const preview = compileResult?.preview || {};
  const warnings = Array.isArray(compileResult?.warnings) ? compileResult.warnings : [];
  const fileCount = Array.isArray(preview.files) ? preview.files.length : 0;
  const envCount =
    preview.env && typeof preview.env === "object" ? Object.keys(preview.env).length : 0;
  const hasStdin = Boolean(preview.stdin);

  const statusColor = !compileResult
    ? "border-border"
    : isOk
      ? "border-emerald-500/30"
      : "border-destructive/30";

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border bg-card transition-colors duration-300", statusColor)}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <Terminal size={15} className="text-violet-500" />
        <h2 className="text-sm font-bold tracking-wide">{t("Compile Preview Output")}</h2>
      </div>

      {/* Output area */}
      <div className="max-h-[28vh] flex-1 overflow-auto p-4">
        <AnimatePresence mode="wait">
          {!compileResult ? (
            <CompileOutputEmptyState key="empty" lastValues={lastValues} t={t} />
          ) : !isOk ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CompileOutputErrorState compileResult={compileResult} />
            </motion.div>
          ) : (
            <CompileOutputSuccessState
              key="success"
              preview={preview}
              warnings={warnings}
              envCount={envCount}
              fileCount={fileCount}
              hasStdin={hasStdin}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default CompileOutputPanel;
