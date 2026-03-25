import { useTranslation } from "react-i18next";
import { CircleAlert, CircleHelp } from "lucide-react";
import { Chart } from "./chart/Chart";
import useServerMetrics from "@/hooks/useServerMetrics";
import { formatGraphQLError } from "@/utils/error";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ServerMetricSnapshot {
  serverId?: number;
  time?: string;
  cpuUtilPct?: number | null;
  memUsedPct?: number | null;
  netRxBps?: number | null;
  netTxBps?: number | null;
  isOnline?: boolean;
}

interface ServerStatProps {
  serverId: number;
  sshConnected: boolean | null;
  metric?: ServerMetricSnapshot | null;
  as?: React.ElementType;
}

const ServerStat = ({ serverId, sshConnected, metric, as: Cell = "td" }: ServerStatProps) => {
  const { t } = useTranslation();
  const { cpuSeries, memSeries, rxSeries, txSeries, loading, error } = useServerMetrics(serverId, metric);

  const isEmptyCPU = !loading && !error && cpuSeries.length === 0;
  const isEmptyMEM = !loading && !error && memSeries.length === 0;
  const isEmptyNET = !loading && !error && rxSeries.length === 0 && txSeries.length === 0;

  // Dynamic accent by usage for CPU
  const colorByPct = (pct: number | null) => {
    if (pct == null || Number.isNaN(pct)) return "text-muted-foreground";
    if (pct >= 80) return "text-destructive";
    if (pct >= 35) return "text-amber-500";
    return "text-emerald-500";
  };
  // Distinct palette for Memory
  const memColorByPct = (pct: number | null) => {
    if (pct == null || Number.isNaN(pct)) return "text-muted-foreground";
    if (pct >= 85) return "text-destructive";
    if (pct >= 65) return "text-amber-500";
    return "text-sky-500";
  };
  const cpuLatest = cpuSeries.length ? cpuSeries[cpuSeries.length - 1] : null;
  const memLatest = memSeries.length ? memSeries[memSeries.length - 1] : null;
  const cpuAccent = colorByPct(cpuLatest);
  const memAccent = memColorByPct(memLatest);

  return (
    <>
      <Cell className="text-center">
        {error ? (
          <div className="w-full h-20 flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span><CircleAlert className="text-destructive" size={20} /></span>
              </TooltipTrigger>
              <TooltipContent side="bottom">{formatGraphQLError(error)}</TooltipContent>
            </Tooltip>
          </div>
        ) : loading ? (
          <Skeleton className="w-full h-20 rounded-xl" />
        ) : isEmptyCPU ? (
          <div className="w-full h-20 flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span><CircleHelp className="text-muted-foreground" size={18} /></span>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t("No data available")}</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <Chart
            value={Math.round(cpuSeries[cpuSeries.length - 1] ?? 0)}
            unit={"%"}
            data={cpuSeries}
            labelA={t("CPU")}
            accent={cpuAccent}
          />
        )}
      </Cell>
      <Cell className="text-center">
        {error ? (
          <div className="w-full h-20 flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span><CircleAlert className="text-destructive" size={20} /></span>
              </TooltipTrigger>
              <TooltipContent side="bottom">{formatGraphQLError(error)}</TooltipContent>
            </Tooltip>
          </div>
        ) : loading ? (
          <Skeleton className="w-full h-20 rounded-xl" />
        ) : isEmptyMEM ? (
          <div className="w-full h-20 flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span><CircleHelp className="text-muted-foreground" size={18} /></span>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t("No data available")}</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <Chart
            value={Math.round(memSeries[memSeries.length - 1] ?? 0)}
            unit={"%"}
            labelA={t("Mem")}
            data={memSeries}
            accent={memAccent}
          />
        )}
      </Cell>
      <Cell className="text-center">
        {error ? (
          <div className="w-full h-20 flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span><CircleAlert className="text-destructive" size={20} /></span>
              </TooltipTrigger>
              <TooltipContent side="bottom">{formatGraphQLError(error)}</TooltipContent>
            </Tooltip>
          </div>
        ) : loading ? (
          <Skeleton className="w-full h-20 rounded-xl" />
        ) : isEmptyNET ? (
          <div className="w-full h-20 flex items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span><CircleHelp className="text-muted-foreground" size={18} /></span>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t("No data available")}</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <Chart
            value={0}
            unit={"bps"}
            data={rxSeries}
            data2={txSeries}
            labelA={t("Down(Net)")}
            labelB={t("Up(Net)")}
            colorA="var(--color-primary)"
            colorB="var(--color-secondary)"
            accent="text-destructive"
          />
        )}
      </Cell>
    </>
  );
};

export default ServerStat;
