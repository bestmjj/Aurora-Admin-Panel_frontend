import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useMutation } from "@apollo/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getReadableSize } from "../../utils/formatter";
import { useModal } from "../../atoms/modal";
import { downloadFile } from "../../utils/download";
import { DELETE_FILE_MUTATION } from "../../queries/file";
import {
  Image,
  Video,
  FileText,
  Terminal,
  Key,
  File as FileIcon,
  Trash2,
  Eye,
  Download,
  Link as LinkIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FileTypeConfigEntry {
  icon: LucideIcon;
  accentBar: string;
  iconBg: string;
  label: string;
}

const fileTypeConfig: Record<string, FileTypeConfigEntry> = {
  IMAGE: {
    icon: Image,
    accentBar: "bg-secondary/70",
    iconBg: "bg-secondary/10 text-secondary",
    label: "IMAGE",
  },
  VIDEO: {
    icon: Video,
    accentBar: "bg-primary/70",
    iconBg: "bg-primary/10 text-primary",
    label: "VIDEO",
  },
  TEXT: {
    icon: FileText,
    accentBar: "bg-muted-foreground/40",
    iconBg: "bg-muted text-muted-foreground",
    label: "TEXT",
  },
  EXECUTABLE: {
    icon: Terminal,
    accentBar: "bg-blue-500/70",
    iconBg: "bg-blue-500/10 text-blue-500",
    label: "EXECUTABLE",
  },
  SECRET: {
    icon: Key,
    accentBar: "bg-destructive/60",
    iconBg: "bg-destructive/10 text-destructive",
    label: "SECRET",
  },
};

const fallbackConfig: FileTypeConfigEntry = {
  icon: FileIcon,
  accentBar: "bg-foreground/20",
  iconBg: "bg-foreground/5 text-foreground/60",
  label: "FILE",
};

interface FileItem {
  id: number;
  name: string;
  path: string;
  type: string;
  size: number;
  version?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface FileCardProps {
  file: FileItem;
  onUpdate: () => void;
  index?: number;
}

const FileCard = ({ file, onUpdate, index = 0 }: FileCardProps) => {
  const { t } = useTranslation();
  const [deleteFile, { called, error }] = useMutation(DELETE_FILE_MUTATION);
  const { open, confirm } = useModal();

  const config = fileTypeConfig[file.type] || fallbackConfig;
  const IconComponent = config.icon;

  const openInModal = () => {
    open("filePreview", { file });
  };

  const handleClickCancel = async () => {
    const confirmed = await confirm({
      title: t("Delete File"),
      message: t("Are you sure you want to delete this file", {
        name: file.name,
      }),
    });
    if (confirmed) {
      deleteFile({ variables: { id: file.id } });
    }
  };

  const handleCheck = () => {
    switch (file.type) {
      case "IMAGE":
      case "VIDEO":
      case "TEXT":
        return openInModal();
      case "EXECUTABLE":
      case "SECRET":
      default:
        return downloadFile(file.path, file.name);
    }
  };

  useEffect(() => {
    if (called || error) {
      onUpdate();
    }
  }, [called, error]);

  const isPreviewable = ["IMAGE", "VIDEO", "TEXT"].includes(file.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.04,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="group flex flex-col rounded-xl border border-border bg-card transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-foreground/4"
    >
      {/* Type accent bar */}
      <div
        className={cn(
          "h-[3px] w-full rounded-t-xl transition-colors duration-500",
          config.accentBar,
        )}
      />

      {/* Icon + identity */}
      <div className="flex items-start gap-3 px-4 pb-1 pt-3.5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            config.iconBg,
          )}
        >
          <IconComponent size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-sm font-bold leading-snug tracking-tight"
            title={file.name}
          >
            {file.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs opacity-40">
            <span>{t(file.type)}</span>
            <span className="opacity-40">&middot;</span>
            <span>{getReadableSize(file.size)}</span>
          </p>
        </div>
        {file.version && (
          <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide opacity-50">
            {file.version}
          </span>
        )}
      </div>

      {/* Notes */}
      {file.notes ? (
        <p
          className="truncate px-4 pb-2 pt-1 text-xs opacity-35"
          title={file.notes}
        >
          {file.notes}
        </p>
      ) : (
        <div className="pb-2" />
      )}

      {/* Actions */}
      <div className="mt-auto flex items-center gap-1.5 border-t border-border/40 px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 gap-1.5 text-xs opacity-60 transition-opacity hover:opacity-100"
          onClick={handleClickCancel}
        >
          <Trash2 size={13} />
          {t("Delete")}
        </Button>
        {file.type === "EXECUTABLE" && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 gap-1.5 text-xs opacity-60 transition-opacity hover:opacity-100"
            onClick={() =>
              open("binding", {
                fileId: file.id,
                fileName: file.name,
                fileVersion: file.version,
              })
            }
          >
            <LinkIcon size={13} />
            {t("Bindings")}
          </Button>
        )}
        <Button
          variant="default"
          size="sm"
          className="flex-1 gap-1.5 text-xs"
          onClick={handleCheck}
        >
          {isPreviewable ? <Eye size={13} /> : <Download size={13} />}
          {isPreviewable ? t("Preview") : t("Download")}
        </Button>
      </div>
    </motion.div>
  );
};

export default FileCard;
