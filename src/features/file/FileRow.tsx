import { useEffect, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useMutation } from "@apollo/client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
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
  iconBg: string;
  label: string;
}

const fileTypeConfig: Record<string, FileTypeConfigEntry> = {
  IMAGE: {
    icon: Image,
    iconBg: "bg-amber-500/10 text-amber-600",
    label: "IMAGE",
  },
  VIDEO: {
    icon: Video,
    iconBg: "bg-primary/10 text-primary",
    label: "VIDEO",
  },
  TEXT: {
    icon: FileText,
    iconBg: "bg-muted text-muted-foreground",
    label: "TEXT",
  },
  EXECUTABLE: {
    icon: Terminal,
    iconBg: "bg-blue-500/10 text-blue-500",
    label: "EXECUTABLE",
  },
  SECRET: {
    icon: Key,
    iconBg: "bg-destructive/10 text-destructive",
    label: "SECRET",
  },
};

const fallbackConfig: FileTypeConfigEntry = {
  icon: FileIcon,
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

interface FileRowProps {
  file: FileItem;
  onUpdate: () => void;
  index?: number;
}

const FileRow = ({ file, onUpdate, index = 0 }: FileRowProps) => {
  const { t } = useTranslation();
  const [deleteFile, { called, error }] = useMutation(DELETE_FILE_MUTATION);
  const { open, confirm } = useModal();

  const config = fileTypeConfig[file.type] || fallbackConfig;
  const IconComponent = config.icon;

  const openInModal = () => {
    open("filePreview", { file });
  };

  const handleClickCancel = async (e: MouseEvent) => {
    e.stopPropagation();
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
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.25,
        delay: index * 0.03,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className="cursor-pointer hover:bg-muted/50"
      onClick={handleCheck}
    >
      {/* Name with icon */}
      <TableCell className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              config.iconBg,
            )}
          >
            <IconComponent size={16} />
          </div>
          <div>
            <span className="text-sm font-semibold">{file.name}</span>
            {file.notes && (
              <div className="max-w-xs truncate text-xs text-muted-foreground">
                {file.notes}
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Type */}
      <TableCell>
        <span className={cn(
          "inline-flex px-2 py-0.5 rounded text-[10px] font-bold border",
          file.type === "SECRET"
            ? "bg-destructive/10 text-destructive border-destructive/20"
            : "bg-muted text-muted-foreground border-border"
        )}>
          {t(file.type)}
        </span>
      </TableCell>

      {/* Size */}
      <TableCell className="text-sm text-muted-foreground tabular-nums">
        {getReadableSize(file.size)}
      </TableCell>

      {/* Version */}
      <TableCell>
        {file.version ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border">
            v{file.version}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )}
      </TableCell>

      {/* Updated */}
      <TableCell className="text-sm text-muted-foreground">
        {file.updatedAt
          ? new Date(file.updatedAt).toLocaleString()
          : file.createdAt
            ? new Date(file.createdAt).toLocaleString()
            : "-"}
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          {file.type === "EXECUTABLE" && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                open("binding", { fileId: file.id });
              }}
            >
              <LinkIcon size={14} />
              {t("Bindings")}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              handleCheck();
            }}
          >
            {isPreviewable ? <Eye size={14} /> : <Download size={14} />}
            {isPreviewable ? t("Preview") : t("Download")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleClickCancel}
            title={t("Delete")}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </TableCell>
    </motion.tr>
  );
};

export default FileRow;
