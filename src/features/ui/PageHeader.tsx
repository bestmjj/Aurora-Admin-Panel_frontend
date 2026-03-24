import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: ReactNode;
  onAdd?: () => void;
  children?: ReactNode;
}

const PageHeader = ({ title, onAdd, children }: PageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className="container flex h-16 w-full shrink-0 grow basis-16 flex-row items-center justify-between px-4 sm:px-8">
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center justify-start gap-2">
          {typeof title === "string" ? (
            <h1 className="text-2xl font-extrabold">{t(title)}</h1>
          ) : (
            title
          )}
          {onAdd && (
            <Button
              variant="default"
              size="icon-xs"
              className="ml-2 rounded-full"
              onClick={onAdd}
            >
              <Plus />
            </Button>
          )}
        </div>
        {children && (
          <div className="flex flex-row items-center gap-2">{children}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
