import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useNotificationsReducer } from "../../atoms/notification";
import { copyToClipboard } from "../../utils/clipboard";
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

interface ServerRowProps {
  server: Server;
  refetch: () => void;
  metric?: ServerMetric | null;
  index?: number;
}

const ServerRow = ({ server, refetch, metric, index = 0 }: ServerRowProps) => {
  const { addNotification } = useNotificationsReducer();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { sshConnected, setSSHConnected, registerSSHRefetch, handleEdit } = useServerItem(server, refetch, metric);

  const handleCopy = (address: string) => {
    copyToClipboard(address);
    addNotification({
      title: address,
      body: t("Server address copied to clipboard"),
      type: "success",
    });
  };

  return (
    <tr
      className={cn(
        "h-20 w-full rounded-xl ring-1 transition-all duration-200",
        sshConnected === false
          ? "ring-destructive/15 bg-muted/40"
          : "ring-border hover:ring-foreground/12 hover:shadow-md"
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <td className="rounded-l-xl p-4 sticky top-0 left-0 z-10 bg-card">
        <div className="flex flex-col">
          <h1 className="break-words text-sm font-bold tracking-tight">{server.name}</h1>
          <span className="font-mono text-[10px] opacity-20">{server.address}</span>
        </div>
      </td>
      <td className="text-center p-2">
        <ServerSSHStat
          server={server}
          sshConnected={sshConnected}
          setSSHConnected={setSSHConnected}
          registerSSHRefetch={registerSSHRefetch}
        />
      </td>
      <td className="text-center p-2">
        <ServerPortsStat
          usedPorts={server.portUsed}
          totalPorts={server.portTotal}
          sshConnected={sshConnected}
        />
      </td>
      <td className="text-center p-2">
        <ServerTrafficStat
          uploadTotal={server.uploadTotal}
          downloadTotal={server.downloadTotal}
          sshConnected={sshConnected}
        />
      </td>
      <td className="text-center p-2">
        <Badge
          variant="outline"
          className="cursor-pointer font-mono text-[10px] transition-transform hover:scale-105 active:scale-95"
          onClick={() => handleCopy(server.address)}
        >
          {server.address}
        </Badge>
      </td>
      <ServerStat
        serverId={server.id}
        sshConnected={sshConnected}
        metric={metric}
      />
      <td className="sticky right-0 z-10 rounded-r-xl bg-card">
        <div className="flex flex-col justify-center items-center space-y-2">
          <Button
            variant="ghost"
            size="xs"
            className="w-12 text-xs"
            onClick={handleEdit}
          >
            {t("Edit")}
          </Button>
          <Button
            variant="default"
            size="xs"
            className="w-12 text-xs"
            onClick={() => navigate(`/app/servers/${server.id}`)}
          >
            {t("Check")}
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(ServerRow);
