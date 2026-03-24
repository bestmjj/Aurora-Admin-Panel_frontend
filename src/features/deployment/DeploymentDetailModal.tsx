import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DataLoading from "../DataLoading";
import DeploymentStatusBadge from "./DeploymentStatusBadge";
import {
  GET_SERVER_DEPLOYMENT,
  REDEPLOY_EXECUTABLE,
  STOP_DEPLOYMENT,
  START_DEPLOYMENT,
  REMOVE_DEPLOYMENT,
  TASK_STREAM_SUBSCRIPTION,
} from "../../queries/deployment";
import { useModal } from "../../atoms/modal";
import ModalShell from "../ui/ModalShell";
import { ChevronDown } from "lucide-react";

interface Port {
  num: number;
  externalNum?: number | null;
}

interface DeploymentLog {
  id: number;
  action: string;
  status: string;
  output?: string | null;
  createdAt?: string | null;
  taskId?: string | null;
}

interface Deployment {
  id: number;
  serverId: number;
  serviceBindingId?: number | null;
  status: string;
  port?: Port | null;
  updatedAt?: string | null;
  valuesJson?: Record<string, unknown> | null;
  logs?: DeploymentLog[];
}

interface DeploymentDetailModalProps {
  modalProps: {
    deploymentId: number;
    [key: string]: unknown;
  };
  close: () => void;
  resolve?: (value: unknown) => void;
}

const DeploymentDetailModal = ({ modalProps, close, resolve }: DeploymentDetailModalProps) => {
  const { t } = useTranslation();
  const { confirm } = useModal();
  const client = useApolloClient();
  const { deploymentId } = modalProps;

  const { data, loading, refetch } = useQuery(GET_SERVER_DEPLOYMENT, {
    variables: { id: deploymentId },
    fetchPolicy: "network-only",
  });

  const [redeployMutation, { loading: redeploying }] = useMutation(REDEPLOY_EXECUTABLE);
  const [stopMutation, { loading: stopping }] = useMutation(STOP_DEPLOYMENT);
  const [startMutation, { loading: starting }] = useMutation(START_DEPLOYMENT);
  const [removeMutation, { loading: removing }] = useMutation(REMOVE_DEPLOYMENT);

  // Streaming output
  const [streamingTaskId, setStreamingTaskId] = useState<string | null>(null);
  const [streamOutput, setStreamOutput] = useState<string[]>([]);
  const outputRef = useRef<HTMLDivElement>(null);

  // Collapsible values panel
  const [valuesOpen, setValuesOpen] = useState(false);

  const deployment: Deployment | undefined = data?.serverDeployment;
  const logs: DeploymentLog[] = deployment?.logs ?? [];

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [streamOutput]);

  // Subscribe to task stream
  useEffect(() => {
    if (!streamingTaskId) return;
    setStreamOutput([]);

    const subscription = client
      .subscribe({
        query: TASK_STREAM_SUBSCRIPTION,
        variables: { taskId: streamingTaskId },
      })
      .subscribe({
        next: ({ data }: { data?: { taskStream?: unknown } }) => {
          if (data?.taskStream) {
            const msg = data.taskStream;
            if (typeof msg === "object" && msg !== null && "data" in msg) {
              setStreamOutput((prev) => [...prev, (msg as { data: string }).data]);
            } else if (typeof msg === "string") {
              setStreamOutput((prev) => [...prev, msg]);
            } else if (typeof msg === "object" && msg !== null && "text" in msg) {
              setStreamOutput((prev) => [...prev, (msg as { text: string }).text]);
            }
          }
        },
        error: () => {
          setStreamingTaskId(null);
        },
        complete: () => {
          setStreamingTaskId(null);
          refetch();
        },
      });

    return () => subscription.unsubscribe();
  }, [streamingTaskId, client]);

  const handleRedeploy = async () => {
    const confirmed = await confirm({
      title: t("Redeploy"),
      message: t("Are you sure you want to redeploy?"),
    });
    if (!confirmed) return;
    const { data } = await redeployMutation({
      variables: { deploymentId },
    });
    if (data?.redeployExecutable?.taskId) {
      setStreamingTaskId(data.redeployExecutable.taskId);
    }
    refetch();
  };

  const handleStop = async () => {
    const confirmed = await confirm({
      title: t("Stop"),
      message: t("Are you sure you want to stop this deployment?"),
    });
    if (!confirmed) return;
    const { data } = await stopMutation({
      variables: { deploymentId },
    });
    if (data?.stopDeployment?.taskId) {
      setStreamingTaskId(data.stopDeployment.taskId);
    }
    refetch();
  };

  const handleStart = async () => {
    const { data } = await startMutation({
      variables: { deploymentId },
    });
    if (data?.startDeployment?.taskId) {
      setStreamingTaskId(data.startDeployment.taskId);
    }
    refetch();
  };

  const handleRemove = async () => {
    const confirmed = await confirm({
      title: t("Remove"),
      message: t("Are you sure you want to remove this deployment? This will stop the service and delete files."),
    });
    if (!confirmed) return;
    const { data } = await removeMutation({
      variables: { deploymentId },
    });
    if (data?.removeDeployment?.taskId) {
      setStreamingTaskId(data.removeDeployment.taskId);
    }
    refetch();
  };

  const handleViewLog = useCallback((log: DeploymentLog) => {
    if (log.taskId) {
      setStreamingTaskId(log.taskId);
    }
  }, []);

  const handleClose = () => {
    if (resolve) resolve(true);
    close();
  };

  const isActionLoading = redeploying || stopping || starting || removing;

  return (
    <ModalShell
      title={`${t("Deployment")} #${deploymentId}`}
      onClose={handleClose}
      footer={
        <Button variant="outline" onClick={handleClose}>
          {t("Close")}
        </Button>
      }
    >
      {loading ? (
        <div className="py-8">
          <DataLoading />
        </div>
      ) : !deployment ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          {t("Deployment not found")}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status overview */}
          <div className="flex flex-wrap items-center gap-3">
            <DeploymentStatusBadge status={deployment.status} />
            <span className="text-xs text-muted-foreground">
              {t("Server")}: #{deployment.serverId}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("Binding")}: #{deployment.serviceBindingId}
            </span>
            {deployment.port && (
              <Badge variant="outline" className="text-xs">
                {t("Port")} {deployment.port.num}
                {deployment.port.externalNum && deployment.port.externalNum !== deployment.port.num
                  ? ` (ext: ${deployment.port.externalNum})`
                  : ""}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {t("Updated")}:{" "}
              {deployment.updatedAt
                ? new Date(deployment.updatedAt).toLocaleString()
                : "-"}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleRedeploy}
              disabled={isActionLoading}
            >
              {redeploying ? t("Redeploying...") : t("Redeploy")}
            </Button>
            {deployment.status === "deployed" && (
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-500/40 text-yellow-600 hover:bg-yellow-500/10 dark:text-yellow-400"
                onClick={handleStop}
                disabled={isActionLoading}
              >
                {stopping ? t("Stopping...") : t("Stop")}
              </Button>
            )}
            {deployment.status === "stopped" && (
              <Button
                variant="outline"
                size="sm"
                className="border-green-500/40 text-green-600 hover:bg-green-500/10 dark:text-green-400"
                onClick={handleStart}
                disabled={isActionLoading}
              >
                {starting ? t("Starting...") : t("Start")}
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isActionLoading}
            >
              {removing ? t("Removing...") : t("Remove")}
            </Button>
          </div>

          {/* Current values — collapsible */}
          {deployment.valuesJson &&
            Object.keys(deployment.valuesJson).length > 0 && (
              <div className="rounded-xl border border-border bg-muted/30">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
                  onClick={() => setValuesOpen((v) => !v)}
                >
                  {t("Current Values")}
                  <ChevronDown
                    size={16}
                    className={cn(
                      "text-muted-foreground transition-transform",
                      valuesOpen && "rotate-180",
                    )}
                  />
                </button>
                {valuesOpen && (
                  <div className="border-t border-border px-4 pb-3 pt-2">
                    <pre className="max-h-40 overflow-auto rounded-lg bg-card p-2 text-xs">
                      {JSON.stringify(deployment.valuesJson, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

          {/* Streaming output */}
          {streamOutput.length > 0 && (
            <div>
              <h4 className="mb-1 text-sm font-semibold">{t("Live Output")}</h4>
              <div
                ref={outputRef}
                className="max-h-48 overflow-auto rounded-xl bg-foreground/5 p-3 font-mono text-xs text-foreground dark:bg-foreground/10"
              >
                {streamOutput.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
                {streamingTaskId && (
                  <div className="animate-pulse text-muted-foreground">&#9608;</div>
                )}
              </div>
            </div>
          )}

          {/* Logs history */}
          <div>
            <h4 className="mb-1 text-sm font-semibold">{t("Log History")}</h4>
            {logs.length === 0 ? (
              <div className="text-xs text-muted-foreground">{t("No logs yet")}</div>
            ) : (
              <div className="max-h-48 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("Action")}</TableHead>
                      <TableHead>{t("Status")}</TableHead>
                      <TableHead>{t("Output")}</TableHead>
                      <TableHead>{t("Time")}</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DeploymentStatusBadge status={log.status} />
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs">
                          {log.output || "-"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {log.taskId && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleViewLog(log)}
                              type="button"
                            >
                              {t("View")}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  );
};

export default DeploymentDetailModal;
