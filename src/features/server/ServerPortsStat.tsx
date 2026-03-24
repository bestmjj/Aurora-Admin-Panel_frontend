interface ServerPortsStatProps {
  usedPorts: number;
  totalPorts: number;
  sshConnected: boolean | null;
}

const ServerPortsStat = ({ usedPorts, totalPorts }: ServerPortsStatProps) => {
  return (
    <div className="flex items-center">
      <div className="flex flex-row items-center space-x-1 text-md font-extrabold">
        <span className="text-secondary">{usedPorts}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-secondary/70">{totalPorts}</span>
      </div>
    </div>
  );
};

export default ServerPortsStat;
