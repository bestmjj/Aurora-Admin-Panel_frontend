import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  className?: string;
}

const EmptyState = ({ message, className = "" }: EmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <div className={cn("text-sm text-muted-foreground", className)}>
      {t(message)}
    </div>
  );
};

export default EmptyState;
