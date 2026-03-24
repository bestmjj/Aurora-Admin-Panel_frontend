import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Eye, Loader2 } from "lucide-react";
import type { FieldValues } from "react-hook-form";
import useDynamicForm from "./useDynamicForm";
import type { DynamicSchema } from "./serviceAdapter";

interface ServiceValuesFormProps {
  formSchema: DynamicSchema;
  onSubmit: (values: FieldValues) => void;
  onValuesChange: (values: FieldValues, meta: { type?: string; name?: string }) => void;
}

function ServiceValuesForm({ formSchema, onSubmit, onValuesChange }: ServiceValuesFormProps) {
  const { form } = useDynamicForm({
    schema: formSchema,
    onSubmit,
    onValuesChange,
  });

  return form;
}

interface FormPreviewPanelProps {
  formSchema: DynamicSchema | null;
  previewSchemaKey: string;
  selectedId: string | number | null;
  compileLoading: boolean;
  onSubmit: (values: FieldValues) => void;
  onValuesChange: (values: FieldValues, meta: { type?: string; name?: string }) => void;
}

const FormPreviewPanel = memo(function FormPreviewPanel({
  formSchema,
  previewSchemaKey,
  selectedId,
  compileLoading,
  onSubmit,
  onValuesChange,
}: FormPreviewPanelProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <Eye size={15} className="text-blue-500" />
        <h2 className="text-sm font-bold tracking-wide">{t("Parameter Form Preview")}</h2>
        {compileLoading && (
          <Loader2 size={14} className="ml-auto animate-spin text-muted-foreground/60" />
        )}
      </div>

      {/* Form body */}
      <div className="flex-1 p-4">
        {!formSchema ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground/60">
            {t("Fix schema JSON to render the form preview.")}
          </div>
        ) : (
          <div className="max-h-[44vh] overflow-auto pr-1">
            <ServiceValuesForm
              key={previewSchemaKey}
              formSchema={formSchema}
              onSubmit={onSubmit}
              onValuesChange={onValuesChange}
            />
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t border-border/50 px-4 py-1.5 text-[11px] text-muted-foreground/50">
        {selectedId
          ? t("Preview Auto Compiles By Stored Service")
          : t("Preview Auto Compiles Unsaved Draft")}
      </div>
    </div>
  );
});

export default FormPreviewPanel;
