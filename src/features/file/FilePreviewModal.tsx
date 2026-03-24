import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DataLoading from "../DataLoading";
import { downloadFile } from "../../utils/download";
import ModalShell from "../ui/ModalShell";
import { Button } from "@/components/ui/button";

interface FileData {
  name: string;
  path: string;
  type: string;
  [key: string]: unknown;
}

interface FilePreviewModalProps {
  modalProps?: {
    file?: FileData;
    [key: string]: unknown;
  };
  close: () => void;
}

const FilePreviewModal = ({ modalProps = {}, close }: FilePreviewModalProps) => {
  const { t } = useTranslation();
  const file = modalProps?.file;

  const [textContent, setTextContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchText = async () => {
      if (!file || file.type !== "TEXT") return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(file.path);
        if (!res.ok) throw new Error(`Failed to load file: ${res.status}`);
        const txt = await res.text();
        setTextContent(txt);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchText();
  }, [file]);

  if (!file) return null;

  const renderContent = () => {
    switch (file.type) {
      case "IMAGE":
        return (
          <div className="flex items-center justify-center">
            <img
              src={file.path}
              alt={file.name}
              className="max-h-[70vh] w-auto rounded-md object-contain"
            />
          </div>
        );
      case "VIDEO":
        return (
          <div className="flex items-center justify-center">
            <video
              src={file.path}
              controls
              className="max-h-[70vh] w-full rounded-md"
            />
          </div>
        );
      case "TEXT":
        return (
          <div className="max-h-[70vh] overflow-auto rounded-md border border-border bg-muted p-3">
            {loading ? (
              <DataLoading />
            ) : error ? (
              <div className="text-sm text-destructive">{String(error)}</div>
            ) : (
              <pre className="whitespace-pre-wrap break-words text-xs">
                {textContent}
              </pre>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ModalShell
      title={file.name}
      onClose={close}
      footer={
        <>
          <Button variant="outline" onClick={close}>
            {t("Close")}
          </Button>
          <Button
            variant="default"
            onClick={(e) => {
              e.preventDefault();
              downloadFile(file.path, file.name);
            }}
          >
            {t("Download")}
          </Button>
        </>
      }
    >
      {renderContent()}
    </ModalShell>
  );
};

export default FilePreviewModal;
