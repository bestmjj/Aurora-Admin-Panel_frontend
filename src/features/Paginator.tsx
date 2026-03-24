import { useRef, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import DataLoading from "./DataLoading";

const LIMIT_OPTIONS = [1, 2, 5, 10, 20, 30, 50];

interface PaginatorProps {
  isLoading?: boolean;
  count?: number;
  limit: number;
  offset: number;
  setLimit: (limit: number) => void;
  setOffset: (offset: number) => void;
  limitOptions?: number[] | null;
}

const Paginator = ({
  isLoading,
  count,
  limit,
  offset,
  setLimit,
  setOffset,
  limitOptions = null,
}: PaginatorProps) => {
  const countRef = useRef(limit);
  if (count !== undefined) {
    countRef.current = count;
  } else if (!isLoading) {
    countRef.current = limit;
  }

  const currentPage = useMemo(() => Math.floor(offset / limit), [offset, limit]);
  const totalPages = Math.ceil(countRef.current / limit);
  const { t } = useTranslation();

  return (
    <div className="mx-auto mt-2 mb-8 flex w-full flex-row justify-end space-x-2 px-4">
      <div className="flex flex-row items-center justify-center space-x-2">
        <span className="text-nowrap text-xs text-muted-foreground md:text-sm">
          {t("total", { count: countRef.current })}
        </span>
        <select
          className={cn(
            "cursor-pointer rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground md:text-sm"
          )}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          {(limitOptions ?? LIMIT_OPTIONS).map((i) => (
            <option key={i} value={i}>
              {t("items per page", { limit: i })}
            </option>
          ))}
        </select>
      </div>
      <div className="flex shrink-0 grow-0 flex-row items-center space-x-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          disabled={currentPage === 0}
          onClick={() =>
            currentPage > 0 &&
            setOffset(offset - limit >= 0 ? offset - limit : 0)
          }
        >
          <ChevronsLeft />
        </Button>
        <select
          className="cursor-pointer rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground md:text-sm"
          value={currentPage}
          onChange={(e) => setOffset(Number(e.target.value) * limit)}
        >
          {Array.from(Array(totalPages).keys()).map((i) => (
            <option key={i} value={i}>
              {i + 1}
            </option>
          ))}
        </select>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          disabled={currentPage === totalPages - 1}
          onClick={() =>
            currentPage < totalPages - 1 && setOffset(offset + limit)
          }
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
};

interface PaginatedListProps {
  children: ReactNode;
  isLoading: boolean;
  count?: number;
  limit: number;
  offset: number;
  setLimit: (limit: number) => void;
  setOffset: (offset: number) => void;
}

const PaginatedList = ({
  children,
  isLoading,
  count,
  limit,
  offset,
  setLimit,
  setOffset,
}: PaginatedListProps) => {
  const countRef = useRef(limit);
  if (count !== undefined) {
    countRef.current = count;
  } else {
    countRef.current = limit;
  }

  return (
    <>
      {isLoading ? <DataLoading /> : children}
      <Paginator
        count={countRef.current}
        limit={limit}
        offset={offset}
        setLimit={setLimit}
        setOffset={setOffset}
      />
    </>
  );
};

export { PaginatedList };
export default Paginator;
