import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DeploymentStatus =
  | "pending"
  | "deploying"
  | "deployed"
  | "failed"
  | "stopped"
  | "removing";

const statusStyles: Record<
  DeploymentStatus,
  { variant: "default" | "secondary" | "destructive" | "outline" | "ghost"; className?: string }
> = {
  pending: { variant: "outline", className: "border-yellow-500/40 text-yellow-600 dark:text-yellow-400" },
  deploying: { variant: "outline", className: "border-blue-500/40 text-blue-600 dark:text-blue-400" },
  deployed: { variant: "outline", className: "border-green-500/40 text-green-600 dark:text-green-400" },
  failed: { variant: "destructive" },
  stopped: { variant: "ghost" },
  removing: { variant: "outline", className: "border-yellow-500/40 text-yellow-600 dark:text-yellow-400" },
};

interface DeploymentStatusBadgeProps {
  status?: string;
}

const DeploymentStatusBadge = ({ status }: DeploymentStatusBadgeProps) => {
  const { t } = useTranslation();
  const style = statusStyles[(status as DeploymentStatus)] ?? { variant: "ghost" as const };
  return (
    <Badge variant={style.variant} className={cn("text-xs", style.className)}>
      {t(status || "unknown")}
    </Badge>
  );
};

export default DeploymentStatusBadge;
