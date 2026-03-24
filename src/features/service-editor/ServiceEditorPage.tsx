import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FilePlus2, Save, RefreshCw } from "lucide-react";
import type { FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import useDebouncedCallback from "../../hooks/useDebouncedCallback";
import { serviceDefinitionToDynamicSchema } from "./serviceAdapter";
import type { DynamicSchema } from "./serviceAdapter";
import ParamEditorPanel from "./ParamEditorPanel";
import AuthoringJsonPanel from "./AuthoringJsonPanel";
import FormPreviewPanel from "./FormPreviewPanel";
import CompileOutputPanel from "./CompileOutputPanel";
import {
  COMPILE_SERVICE_PREVIEW,
  CREATE_SERVICE_DEFINITION,
  DEFAULT_SERVICE_TEMPLATE,
  LIST_SERVICE_DEFINITIONS,
  UPDATE_SERVICE_DEFINITION,
} from "./constants";
import { cloneJson, prettyJson } from "./builderUtils";
import type { ContractDraft } from "./param-editor-types";

const AUTO_COMPILE_DEBOUNCE_MS = 400;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

interface CompileResult {
  ok?: boolean;
  error?: string;
  preview?: Record<string, unknown>;
  warnings?: Array<{ code?: string; message?: string }>;
  details?: Array<{ loc?: string[]; msg?: string; type?: string }>;
}

interface ServiceItem {
  id: string;
  serviceKey: string;
  version: number;
  title: string;
  description?: string;
  isActive: boolean;
  updatedAt: string;
  configJson: ContractDraft;
}

export default function ServiceEditorPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedParamIndex, setSelectedParamIndex] = useState(0);
  const [editorText, setEditorText] = useState(prettyJson(DEFAULT_SERVICE_TEMPLATE));
  const [saveMessage, setSaveMessage] = useState("");
  const [lastValues, setLastValues] = useState<FieldValues | null>(null);
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const compileRequestSeqRef = useRef(0);
  const lastAutoValuesKeyRef = useRef<string | null>(null);

  const { data, error, refetch } = useQuery(LIST_SERVICE_DEFINITIONS, {
    variables: { limit: 100, offset: 0 },
    fetchPolicy: "network-only",
  });
  const [createService, { loading: createLoading }] = useMutation(CREATE_SERVICE_DEFINITION);
  const [updateService, { loading: updateLoading }] = useMutation(UPDATE_SERVICE_DEFINITION);
  const [compileDraft, { loading: compileDraftLoading }] = useMutation(
    COMPILE_SERVICE_PREVIEW
  );

  const parseState = useMemo(() => {
    try {
      const parsed = JSON.parse(editorText) as ContractDraft;
      return { parsed, parseError: null };
    } catch (e) {
      return { parsed: null, parseError: String(e) };
    }
  }, [editorText]);

  const adaptedFormState = useMemo(() => {
    if (!parseState.parsed) return { schema: null as DynamicSchema | null, error: null as string | null };
    try {
      return {
        schema: serviceDefinitionToDynamicSchema(parseState.parsed) as DynamicSchema,
        error: null as string | null,
      };
    } catch (e) {
      return {
        schema: null as DynamicSchema | null,
        error: String(e),
      };
    }
  }, [parseState]);

  const services: ServiceItem[] = data?.paginatedServiceDefinitions?.items ?? [];
  const routeServiceId = serviceId ? Number(serviceId) : null;
  const previewSchemaKey = editorText;

  useEffect(() => {
    if (!routeServiceId || Number.isNaN(routeServiceId)) {
      return;
    }
    const item = services.find((svc) => Number(svc.id) === routeServiceId);
    if (!item) {
      return;
    }
    setSelectedId(item.id);
    setEditorText(prettyJson(item.configJson));
    setSelectedParamIndex(0);
    setSaveMessage("");
    setCompileResult(null);
  }, [routeServiceId, services]);

  const applyDraftMutation = useCallback(
    (mutator: (draft: ContractDraft) => void) => {
      if (!parseState.parsed) return;
      const next = cloneJson(parseState.parsed);
      if (!Array.isArray(next.params)) next.params = [];
      mutator(next);
      setEditorText(prettyJson(next));
      setCompileResult(null);
    },
    [parseState]
  );

  const handleNew = () => {
    navigate("/app/services/editor");
    setSelectedId(null);
    setEditorText(prettyJson(DEFAULT_SERVICE_TEMPLATE));
    setSelectedParamIndex(0);
    setSaveMessage("");
    setCompileResult(null);
  };

  const handleSaveNew = async () => {
    setSaveMessage("");
    if (!parseState.parsed) {
      setSaveMessage("Cannot save invalid JSON.");
      return;
    }
    try {
      const res = await createService({
        variables: { configJson: parseState.parsed },
      });
      const created = res?.data?.createServiceDefinition;
      if (created?.id) {
        setSelectedId(created.id);
        setEditorText(prettyJson(created.configJson));
        setSaveMessage(`Created service #${created.id}`);
        await refetch();
        navigate(`/app/services/editor/${created.id}`);
      } else {
        setSaveMessage("Create failed.");
      }
    } catch (e) {
      setSaveMessage(String((e as Error)?.message || e));
    }
  };

  const handleUpdate = async () => {
    setSaveMessage("");
    if (!selectedId) {
      setSaveMessage("Select or create a service first.");
      return;
    }
    if (!parseState.parsed) {
      setSaveMessage("Cannot update invalid JSON.");
      return;
    }
    try {
      const res = await updateService({
        variables: {
          id: Number(selectedId),
          configJson: parseState.parsed,
        },
      });
      if (res?.data?.updateServiceDefinition) {
        setSaveMessage(`Updated service #${selectedId}`);
        await refetch();
      } else {
        setSaveMessage(`Update failed for #${selectedId}`);
      }
    } catch (e) {
      setSaveMessage(String((e as Error)?.message || e));
    }
  };

  const compilePreview = useCallback(
    async (values: FieldValues) => {
      const requestSeq = ++compileRequestSeqRef.current;
      setLastValues(values);
      try {
        if (!parseState.parsed) {
          if (requestSeq !== compileRequestSeqRef.current) return;
          setCompileResult({ ok: false, error: "Invalid service definition JSON" });
          return;
        }
        const context: Record<string, unknown> = { jobId: "preview-ui" };
        if (parseState.parsed?.requiresPort !== false) {
          context.port = 0;
        }
        const res = await compileDraft({
          variables: {
            contract: parseState.parsed,
            values,
            context,
          },
        });
        if (requestSeq !== compileRequestSeqRef.current) return;
        setCompileResult(res?.data?.compileServicePreview ?? null);
      } catch (e) {
        if (requestSeq !== compileRequestSeqRef.current) return;
        setCompileResult({ ok: false, error: String((e as Error)?.message || e) });
      }
    },
    [compileDraft, parseState]
  );

  const { debouncedCallback: scheduleAutoCompile, cancel: cancelAutoCompile } = useDebouncedCallback(
    (values: FieldValues) => {
      compilePreview(values);
    },
    AUTO_COMPILE_DEBOUNCE_MS
  );

  const handlePreviewValuesChange = useCallback(
    (values: FieldValues) => {
      const valuesKey = JSON.stringify(values ?? {});
      if (valuesKey === lastAutoValuesKeyRef.current) return;
      lastAutoValuesKeyRef.current = valuesKey;
      scheduleAutoCompile(values);
    },
    [scheduleAutoCompile]
  );

  const handleCompileFromForm = useCallback(
    (values: FieldValues) => {
      cancelAutoCompile();
      const valuesKey = JSON.stringify(values ?? {});
      lastAutoValuesKeyRef.current = valuesKey;
      return compilePreview(values);
    },
    [cancelAutoCompile, compilePreview]
  );

  useEffect(() => {
    cancelAutoCompile();
    lastAutoValuesKeyRef.current = null;
    // Invalidate any in-flight compile response from the previous preview form instance.
    compileRequestSeqRef.current += 1;
  }, [previewSchemaKey, cancelAutoCompile]);

  const compileLoading = compileDraftLoading;
  const saveLoading = createLoading || updateLoading;

  if (error) {
    return (
      <div className="px-6 py-4">
        <Alert variant="destructive">
          <AlertDescription>{String(error.message || error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto flex w-full max-w-screen-2xl flex-col gap-6 px-4 py-6"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={fadeUp} className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">{t("Schema Builder")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("Build authoring schema JSON, render a parameter form, and compile a preview.")}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={handleNew}
            type="button"
          >
            <FilePlus2 size={15} />
            {t("New")}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            onClick={handleSaveNew}
            type="button"
            disabled={saveLoading}
          >
            <Save size={15} />
            {createLoading ? t("Saving") : t("Save New")}
          </Button>
          {selectedId && (
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5"
              onClick={handleUpdate}
              type="button"
              disabled={saveLoading}
            >
              <RefreshCw size={15} className={cn(updateLoading && "animate-spin")} />
              {updateLoading ? t("Updating") : t("Update")}
            </Button>
          )}
        </div>
      </motion.div>

      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <Alert>
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Builder Panel */}
      {!parseState.parseError && parseState.parsed && (
        <motion.div variants={fadeUp}>
          <ParamEditorPanel
            contract={parseState.parsed}
            selectedParamIndex={selectedParamIndex}
            setSelectedParamIndex={setSelectedParamIndex}
            applyDraftMutation={applyDraftMutation}
          />
        </motion.div>
      )}

      {/* Bottom Panels: JSON | Preview + Compile */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <AuthoringJsonPanel
          selectedId={selectedId}
          editorText={editorText}
          setEditorText={setEditorText}
          parseError={parseState.parseError}
          adapterError={adaptedFormState.error}
          setCompileResult={setCompileResult}
        />

        <div className="flex flex-col gap-5 xl:col-span-6">
          <FormPreviewPanel
            formSchema={adaptedFormState.schema}
            previewSchemaKey={previewSchemaKey}
            selectedId={selectedId}
            compileLoading={compileLoading}
            onSubmit={handleCompileFromForm}
            onValuesChange={handlePreviewValuesChange}
          />

          <CompileOutputPanel compileResult={compileResult} lastValues={lastValues} />
        </div>
      </motion.div>
    </motion.div>
  );
}
