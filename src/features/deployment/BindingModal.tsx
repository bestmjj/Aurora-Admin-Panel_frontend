import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@apollo/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getReadableSize } from "../../utils/formatter";
import DataLoading from "../DataLoading";
import { useModal } from "../../atoms/modal";
import {
  GET_SERVICE_BINDINGS,
  GET_EXECUTABLE_FILES,
  GET_SERVICES_FOR_BINDING,
  CREATE_SERVICE_BINDING,
  DELETE_SERVICE_BINDING,
} from "../../queries/deployment";
import ModalShell from "../ui/ModalShell";

interface ServiceInfo {
  id: number;
  title?: string;
  serviceKey?: string;
  version?: string;
}

interface FileInfo {
  id: number;
  name: string;
  version?: string | null;
  size?: number | null;
}

interface Binding {
  id: number;
  serviceId: number;
  fileId: number;
  service?: ServiceInfo | null;
  file?: FileInfo | null;
}

interface DropdownOption {
  value: number;
  label: string;
}

interface BindingModalProps {
  modalProps: {
    fileId?: number | null;
    serviceId?: number | null;
    fileName?: string;
    fileVersion?: string;
    serviceTitle?: string;
    [key: string]: unknown;
  };
  close: () => void;
  resolve?: (value: unknown) => void;
}

const BindingModal = ({ modalProps, close, resolve }: BindingModalProps) => {
  const { t } = useTranslation();
  const { confirm } = useModal();

  const fileId = modalProps?.fileId ?? null;
  const serviceId = modalProps?.serviceId ?? null;
  const isFileMode = fileId !== null;

  const [selectedBindingId, setSelectedBindingId] = useState<number | null>(null);
  const [addValue, setAddValue] = useState("");

  // Always fetch bindings filtered by the known side
  const { data: bindingsData, loading: bindingsLoading, refetch } = useQuery(
    GET_SERVICE_BINDINGS,
    {
      variables: {
        ...(fileId && { fileId }),
        ...(serviceId && { serviceId }),
      },
    },
  );

  // Fetch the "other side" options for the add dropdown
  const { data: filesData, loading: filesLoading } = useQuery(
    GET_EXECUTABLE_FILES,
    { skip: isFileMode }, // Only need files list when in service mode
  );
  const { data: servicesData, loading: servicesLoading } = useQuery(
    GET_SERVICES_FOR_BINDING,
    { skip: !isFileMode }, // Only need services list when in file mode
  );

  const [createBinding, { loading: creating }] = useMutation(CREATE_SERVICE_BINDING);
  const [deleteBinding] = useMutation(DELETE_SERVICE_BINDING);

  const bindings: Binding[] = bindingsData?.serviceBindings ?? [];
  const files: FileInfo[] = filesData?.files ?? [];
  const services: ServiceInfo[] = servicesData?.serviceDefinitions ?? [];

  // Derive the modal title from the first binding's known-side data
  const deriveTitle = () => {
    if (isFileMode) {
      const name = modalProps?.fileName;
      const version = modalProps?.fileVersion;
      if (name) return `${name}${version ? ` (${version})` : ""}`;
      return t("File Bindings");
    } else {
      const title = modalProps?.serviceTitle;
      if (title) return title;
      return t("Service Bindings");
    }
  };

  const handleAdd = async () => {
    if (!addValue) return;
    await createBinding({
      variables: {
        fileId: isFileMode ? fileId : Number(addValue),
        serviceId: isFileMode ? Number(addValue) : serviceId,
      },
    });
    setAddValue("");
    refetch();
  };

  const handleRemove = async () => {
    if (!selectedBindingId) return;
    const confirmed = await confirm({
      title: t("Remove Binding"),
      message: t("Are you sure you want to remove this binding?"),
    });
    if (!confirmed) return;
    await deleteBinding({ variables: { id: selectedBindingId } });
    setSelectedBindingId(null);
    refetch();
  };

  const handleClose = () => {
    if (resolve) resolve(true);
    close();
  };

  const isLoading = bindingsLoading || filesLoading || servicesLoading;

  // Build dropdown options (the "other side"), excluding already-bound items
  const boundIds = new Set(
    bindings.map((b) => (isFileMode ? b.serviceId : b.fileId)),
  );
  const dropdownOptions: DropdownOption[] = isFileMode
    ? services
        .filter((s) => !boundIds.has(s.id))
        .map((s) => ({
          value: s.id,
          label: `${s.title} (${s.serviceKey} v${s.version})`,
        }))
    : files
        .filter((f) => !boundIds.has(f.id))
        .map((f) => ({
          value: f.id,
          label: `${f.name}${f.version ? ` (${f.version})` : ""}`,
        }));

  return (
    <ModalShell
      title={deriveTitle()}
      onClose={handleClose}
    >
      {isLoading ? (
        <div className="py-8">
          <DataLoading />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bindings list */}
          {bindings.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {t("No bindings yet")}
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {bindings.map((b) => (
                <div
                  key={b.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-colors",
                    selectedBindingId === b.id
                      ? "bg-primary/10"
                      : "hover:bg-muted",
                  )}
                  onClick={() =>
                    setSelectedBindingId(
                      selectedBindingId === b.id ? null : b.id,
                    )
                  }
                >
                  {isFileMode ? (
                    /* Show the service side */
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-medium">
                        {b.service?.title || `Service #${b.serviceId}`}
                      </span>
                      <Badge variant="ghost" className="shrink-0 font-mono text-xs">
                        {b.service?.serviceKey}
                      </Badge>
                      {b.service?.version && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          v{b.service.version}
                        </span>
                      )}
                    </div>
                  ) : (
                    /* Show the file side */
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate font-medium">
                        {b.file?.name || `File #${b.fileId}`}
                      </span>
                      {b.file?.version && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          v{b.file.version}
                        </span>
                      )}
                      {b.file?.size && (
                        <span className="shrink-0 text-xs text-muted-foreground/60">
                          {getReadableSize(b.file.size)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add new binding */}
          <div className="flex items-center gap-2">
            <Select
              value={addValue}
              onValueChange={setAddValue}
            >
              <SelectTrigger size="sm" className="flex-1">
                <SelectValue
                  placeholder={isFileMode ? t("Select a service...") : t("Select a file...")}
                />
              </SelectTrigger>
              <SelectContent>
                {dropdownOptions.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="default"
              size="sm"
              disabled={!addValue || creating}
              onClick={handleAdd}
            >
              {creating ? t("Adding...") : t("Add")}
            </Button>
          </div>

          {/* Remove button -- only visible when a binding is selected */}
          {selectedBindingId && (
            <div className="flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                {t("Remove")}
              </Button>
            </div>
          )}
        </div>
      )}
    </ModalShell>
  );
};

export default BindingModal;
