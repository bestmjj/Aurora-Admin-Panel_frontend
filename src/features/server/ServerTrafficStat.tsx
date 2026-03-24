import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import { getReadableSize } from "../../utils/formatter";

interface ServerTrafficStatProps {
  uploadTotal: number;
  downloadTotal: number;
  sshConnected: boolean | null;
}

const ServerTrafficStat = ({
  uploadTotal,
  downloadTotal,
  sshConnected,
}: ServerTrafficStatProps) => {
  return (
    <div className="flex flex-col items-center text-md font-bold text-accent-foreground">
      <span
        className={cn(
          "flex flex-row items-center",
          sshConnected ? "text-accent-foreground" : "text-accent-foreground/50"
        )}
      >
        <ArrowUp size={16} />
        {getReadableSize(downloadTotal)}
      </span>
      <span
        className={cn(
          "flex flex-row items-center",
          sshConnected ? "text-accent-foreground" : "text-accent-foreground/50"
        )}
      >
        <ArrowDown size={16} />
        {getReadableSize(uploadTotal)}
      </span>
    </div>
  );
};

export default ServerTrafficStat;
