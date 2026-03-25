import { useQuery } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Paginator from "../Paginator";
import FileRow from "./FileRow";
import useQueryParams from "../../hooks/useQueryParams";
import DataLoading from "../DataLoading";
import { useModal } from "../../atoms/modal";
import { GET_FILES_QUERY } from "../../queries/file";
import PageHeader from "../ui/PageHeader";

interface FileEmptyStateProps {
  onAdd: () => void;
}

const FileEmptyState = ({ onAdd }: FileEmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center justify-center py-24"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8">
        <Upload size={28} className="text-primary/50" />
      </div>
      <h2 className="mt-5 text-lg font-bold tracking-tight">
        {t("No files yet")}
      </h2>
      <p className="mt-1.5 max-w-xs text-center text-sm opacity-40">
        {t(
          "Upload configuration files, binaries, certificates, and secrets to deploy across your servers.",
        )}
      </p>
      <Button
        variant="default"
        size="sm"
        className="mt-6 gap-2"
        onClick={onAdd}
      >
        <Upload size={15} />
        {t("Upload File")}
      </Button>
    </motion.div>
  );
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

const FileCenter = () => {
  const { t } = useTranslation();
  const { open } = useModal();
  const [limit, offset, setLimit, setOffset] = useQueryParams([
    {
      name: "limit",
      defaultValue: 20,
      isNumeric: true,
      replace: false,
    },
    {
      name: "offset",
      defaultValue: 0,
      isNumeric: true,
      replace: false,
    },
  ]);
  const { loading, data, refetch } = useQuery(GET_FILES_QUERY, {
    variables: { limit, offset },
  });

  const handleAdd = async () => {
    const result = await open("file");
    if (result) refetch();
  };

  const files: FileItem[] = data?.paginatedFiles?.items ?? [];
  const count: number = data?.paginatedFiles?.count ?? 0;
  const isEmpty = !loading && files.length === 0;

  return (
    <>
      <PageHeader title="Files" onAdd={handleAdd} />

      <div className="flex w-full flex-col px-4">
        {loading ? (
          <DataLoading />
        ) : isEmpty ? (
          <FileEmptyState onAdd={handleAdd} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/50 bg-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={`page-${offset}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("Name")}</TableHead>
                      <TableHead>{t("Type")}</TableHead>
                      <TableHead>{t("Size")}</TableHead>
                      <TableHead>{t("Version")}</TableHead>
                      <TableHead>{t("Updated")}</TableHead>
                      <TableHead className="text-right">
                        {t("Actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {files.map((file, i) => (
                      <FileRow
                        key={file.id}
                        file={file}
                        onUpdate={refetch}
                        index={i}
                      />
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        {!isEmpty && (
          <Paginator
            isLoading={loading}
            count={count}
            limit={limit}
            offset={offset}
            setLimit={setLimit}
            setOffset={setOffset}
          />
        )}
      </div>
    </>
  );
};

export default FileCenter;
