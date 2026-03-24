import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { gql } from "@apollo/client";
import { cn } from "@/lib/utils";
import useSubscribe from "@/hooks/useSubscribe";
import { CircleAlert, CircleCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CONNECT_SERVER_SUBSCRIPTION = gql`
  subscription ConnectServer($serverId: Int!) {
    connectServer(serverId: $serverId)
  }
`;

interface ConnectServerData {
  connectServer: {
    success?: boolean;
    error?: string;
  };
}

interface ServerSSHStatProps {
  server: { id: number; [key: string]: unknown };
  sshConnected: boolean | null;
  setSSHConnected: React.Dispatch<React.SetStateAction<boolean | null>>;
  registerSSHRefetch: (func: (() => void) | null) => void;
}

const ServerSSHStat = ({ server, sshConnected, setSSHConnected, registerSSHRefetch }: ServerSSHStatProps) => {
  const { t } = useTranslation();
  const { data, loading, error, subscribe } = useSubscribe<ConnectServerData>(
    CONNECT_SERVER_SUBSCRIPTION,
    { serverId: server.id }
  );
  useEffect(() => {
    if (loading) setSSHConnected(null);
    else if (data && data.connectServer.success) {
      setSSHConnected(true);
    } else {
      setSSHConnected(false);
    }
  }, [data, loading]);
  useEffect(() => {
    registerSSHRefetch(() => {
      return subscribe;
    });
  }, [registerSSHRefetch]);

  return (
    <div className={cn("overflow-x-visible")}>
      <div className="place-items-center">
        <div className="group relative">
          {loading ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="cursor-not-allowed" type="button">
                  <div className="size-6 animate-spin rounded-full border-3 border-muted border-t-primary" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{t("Connecting")}</TooltipContent>
            </Tooltip>
          ) : error || (data && data.connectServer.error) ? (
            <>
              <div className="absolute left-1/2 z-50 hidden w-96 max-w-screen-sm -translate-x-1/2 -translate-y-full rounded-xl bg-card text-card-foreground shadow-2xl ring-1 ring-foreground/10 transition duration-200 group-hover:block">
                <div className="p-3 text-sm">
                  <span>
                    {error ? JSON.stringify(error) : data?.connectServer.error}
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => subscribe()}>
                <CircleAlert className="text-destructive" />
              </button>
            </>
          ) : data && data.connectServer.success ? (
            <button type="button" onClick={() => subscribe()}>
              <CircleCheck className="text-emerald-500" />
            </button>
          ) : sshConnected ? (
            <button type="button" onClick={() => subscribe()}>
              <CircleCheck className="text-emerald-500" />
            </button>
          ) : sshConnected === false ? (
            <button type="button" onClick={() => subscribe()}>
              <CircleAlert className="text-destructive" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ServerSSHStat;
