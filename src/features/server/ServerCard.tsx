import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ServerPortsStat from "./ServerPortsStat";
import ServerSSHStat from "./ServerSSHStat";
import ServerStat from "./ServerStat";
import ServerTrafficStat from "./ServerTrafficStat";
import useServerItem from "@/hooks/useServerItem";

interface Server {
  id: number;
  name: string;
  address: string;
  portUsed: number;
  portTotal: number;
  uploadTotal: number;
  downloadTotal: number;
  lastSeen?: string | null;
  [key: string]: unknown;
}

interface ServerMetric {
  serverId?: number;
  isOnline?: boolean;
  [key: string]: unknown;
}

interface ServerCardProps {
  server: Server;
  refetch: () => void;
  metric?: ServerMetric | null;
}

const ServerCard = ({ server, refetch, metric }: ServerCardProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { sshConnected, setSSHConnected, registerSSHRefetch, handleEdit } =
    useServerItem(server, refetch, metric);

  const isDown = sshConnected === false;
  const isConnecting = sshConnected === null;

  return (
    <div
      className={cn(
        "group flex flex-col rounded-xl border transition-all duration-300 ease-out",
        isDown
          ? "border-destructive/15 bg-muted/60"
          : "border-border bg-card hover:-translate-y-0.5 hover:shadow-xl hover:shadow-foreground/4"
      )}
    >
      {/* Status accent -- communicates health at a glance */}
      <div
        className={cn(
          "h-[3px] w-full rounded-t-xl transition-colors duration-500",
          isConnecting && "bg-amber-500/70",
          isDown && "bg-destructive/40",
          sshConnected === true && "bg-primary/70"
        )}
      />

      {/* Identity zone */}
      <div className="flex items-start gap-3 px-4 pt-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold leading-snug tracking-tight">
            {server.name}
          </h3>
          <p className="mt-0.5 truncate font-mono text-[10px] tracking-wide opacity-20">
            {server.address}
          </p>
        </div>
        <div className="flex-shrink-0">
          <ServerSSHStat
            server={server}
            sshConnected={sshConnected}
            setSSHConnected={setSSHConnected}
            registerSSHRefetch={registerSSHRefetch}
          />
        </div>
      </div>

      {/* Metrics strip */}
      <div className="flex items-center gap-3 px-4 py-2">
        <ServerPortsStat
          usedPorts={server.portUsed}
          totalPorts={server.portTotal}
          sshConnected={sshConnected}
        />
        <div className="h-3 w-px bg-border" />
        <ServerTrafficStat
          uploadTotal={server.uploadTotal}
          downloadTotal={server.downloadTotal}
          sshConnected={sshConnected}
        />
      </div>

      {/* Sparkline charts -- horizontal, the visual anchor */}
      <div className="flex flex-row border-t border-border/40 [&>div]:flex-1">
        <ServerStat
          serverId={server.id}
          sshConnected={sshConnected}
          metric={metric}
          as="div"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-border/40 px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 text-xs"
          onClick={handleEdit}
        >
          {t("Edit")}
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => navigate(`/app/servers/${server.id}`)}
        >
          {t("Check")}
        </Button>
      </div>
    </div>
  );
};

export default React.memo(ServerCard);
