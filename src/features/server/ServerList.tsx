import { useCallback, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import ServerCard from "./ServerCard";
import ServerRow from "./ServerRow";
import { List, LayoutGrid } from "lucide-react";
import { gql, useQuery, useApolloClient } from "@apollo/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { GET_SERVERS_QUERY } from "../../queries/server";
import Error from "../layout/Error";
import Paginator from "../Paginator";
import useQueryParams from "../../hooks/useQueryParams";
import { useAtom } from "jotai";
import serverLimitAtom from "../../atoms/server/limit";
import { useModal } from "../../atoms/modal";
import PageHeader from "../ui/PageHeader";

const SERVER_METRIC_SUBSCRIPTION = gql`
subscription ServerMetric {
  serverMetric {
    cpuUtilPct
    fsRootUsedPct
    load15m
    load1m
    load5m
    memUsedPct
    netRxBps
    netTxBps
    serverId
    swapUsedPct
    time
    isOnline
  }
}
`;

interface MetricData {
  serverId: number;
  cpuUtilPct?: number;
  memUsedPct?: number;
  netRxBps?: number;
  netTxBps?: number;
  isOnline?: boolean;
  time?: string;
  [key: string]: unknown;
}

const ServerList = () => {
  const { t } = useTranslation();
  const { open } = useModal();
  const [atomLimit, setAtomLimit] = useAtom(serverLimitAtom);
  const [limit, offset, setQueryLimit, setOffset] = useQueryParams([
    {
      name: "limit",
      defaultValue: atomLimit,
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
  const client = useApolloClient();
  const [metricsMap, setMetricsMap] = useState<Record<number, MetricData>>({});
  useEffect(() => {
    const observable = client.subscribe({ query: SERVER_METRIC_SUBSCRIPTION });
    const sub = observable.subscribe({
      next({ data }: { data?: { serverMetric?: MetricData } }) {
        if (data?.serverMetric) {
          const m = data.serverMetric;
          setMetricsMap((prev) => {
            if (prev[m.serverId] === m) return prev;
            return { ...prev, [m.serverId]: m };
          });
        }
      },
    });
    return () => sub.unsubscribe();
  }, [client]);
  const { data, loading, error, refetch } = useQuery(
    GET_SERVERS_QUERY,
    { variables: { limit, offset } }
  );
  const [listStyle, setListStyle] = useState("List view");

  const setLimit = useCallback((value: number) => {
    setAtomLimit(value);
    setQueryLimit(value);
  }, [setAtomLimit, setQueryLimit]);

  if (error) return <Error error={error} />;
  return (
    <>
      <PageHeader
        title="Servers"
        onAdd={async () => {
          const result = await open("serverInfo");
          if (result) refetch();
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setListStyle(listStyle === "Cards view" ? "List view" : "Cards view")}
            >
              {listStyle === "Cards view" ? <List size={20} /> : <LayoutGrid size={20} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{t(listStyle)}</TooltipContent>
        </Tooltip>
      </PageHeader>

      {listStyle === "Cards view" ? (
        <>
          <div className="grid grid-cols-1 gap-5 px-4 pb-6 pt-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {(data?.paginatedServers?.items ?? []).map((server: { id: number; [key: string]: unknown }, i: number) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.05,
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <ServerCard server={server as any} refetch={refetch} metric={metricsMap[server.id]} />
              </motion.div>
            ))}
          </div>
          <Paginator
            isLoading={loading}
            count={data?.paginatedServers?.count}
            limit={limit}
            offset={offset}
            setLimit={setLimit}
            setOffset={setOffset}
          />
        </>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-3 table-fixed max-w-screen-lg px-1 mx-auto text-sm">
              <thead className="text-center">
                <tr>
                  <th className="w-32 sticky left-0 z-10 bg-background font-medium text-muted-foreground">
                    {t("Name")}
                  </th>
                  <th className="w-16 font-medium text-muted-foreground">{t("SSH")}</th>
                  <th className="w-16 font-medium text-muted-foreground">{t("Ports")}</th>
                  <th className="w-16 font-medium text-muted-foreground">{t("Traffic")}</th>
                  <th className="w-28 font-medium text-muted-foreground">{t("Address")}</th>
                  <th className="w-12 font-medium text-muted-foreground">{t("CPU")}</th>
                  <th className="w-12 font-medium text-muted-foreground">{t("Mem")}</th>
                  <th className="w-16 font-medium text-muted-foreground">{t("Disk")}</th>
                  <th className="w-16 sticky right-0 z-10 bg-background font-medium text-muted-foreground">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {loading ? (
                  Array.from(Array(limit as number)).map((_, i) => (
                    <tr key={i} className="w-full">
                      <td colSpan={9}>
                        <Skeleton className="h-20 w-full rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : (
                  (data?.paginatedServers?.items ?? []).map((server: { id: number; [key: string]: unknown }, i: number) => (
                    <ServerRow
                      key={server.id}
                      server={server as any}
                      refetch={refetch}
                      metric={metricsMap[server.id]}
                      index={i}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex w-full flex-row justify-end mx-auto max-w-screen-lg">
            <Paginator
              isLoading={loading}
              count={data?.paginatedServers?.count}
              limit={limit}
              offset={offset}
              setLimit={setLimit}
              setOffset={setOffset}
            />
          </div>
        </>
      )}
    </>
  );
};

export default ServerList;
