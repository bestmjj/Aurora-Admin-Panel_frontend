import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Server as ServerIcon, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

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
}

const ServerRow = ({ server, refetch, metric }: ServerRowProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { sshConnected, setSSHConnected, registerSSHRefetch, handleEdit } = useServerItem(server, refetch, metric);

  return (
    <TableRow className="cursor-pointer" onClick={() => navigate(`/app/servers/${server.id}`)}>
      {/* Server name + address */}
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ServerIcon size={16} />
          </div>
          <div>
            <span className="text-sm font-semibold">{server.name || server.address}</span>
            <div
              className="cursor-copy font-mono text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(server.address);
                toast.success(t("Copied"), { description: server.address });
              }}
            >
              {server.address}
            </div>
          </div>
        </div>
      </TableCell>

      {/* SSH */}
      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
        <ServerSSHStat
          server={server}
          sshConnected={sshConnected}
          setSSHConnected={setSSHConnected}
          registerSSHRefetch={registerSSHRefetch}
        />
      </TableCell>

      {/* Ports */}
      <TableCell className="text-center">
        <ServerPortsStat
          usedPorts={server.portUsed}
          totalPorts={server.portTotal}
          sshConnected={sshConnected}
        />
      </TableCell>

      {/* Traffic */}
      <TableCell className="text-center">
        <ServerTrafficStat
          uploadTotal={server.uploadTotal}
          downloadTotal={server.downloadTotal}
          sshConnected={sshConnected}
        />
      </TableCell>

      {/* CPU / Mem / Disk (3 cells rendered by ServerStat) */}
      <ServerStat
        serverId={server.id}
        sshConnected={sshConnected}
        metric={metric}
        as={TableCell}
      />

      {/* Actions */}
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleEdit}
          >
            {t("Edit")}
          </Button>
          <Button
            variant="secondary"
            size="xs"
            onClick={() => navigate(`/app/servers/${server.id}`)}
          >
            {t("Open")}
            <ArrowUpRight size={14} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default React.memo(ServerRow);
