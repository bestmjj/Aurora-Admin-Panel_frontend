import { cn } from "@/lib/utils";
import Sparkline from "./Sparkline";

const formatPct = (n: number) => `${Math.round(n)}%`;
const formatBps = (n: number) => {
  if (n > 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} GB/s`;
  if (n > 1_000_000) return `${(n / 1_000_000).toFixed(1)} MB/s`;
  if (n > 1_000) return `${(n / 1_000).toFixed(1)} KB/s`;
  return `${Math.round(n)} B/s`;
};

interface ChartProps {
  value?: number;
  unit: string;
  data: number[];
  data2?: number[] | null;
  accent?: string;
  className?: string;
  area?: boolean;
  labelA?: string;
  labelB?: string;
  colorA?: string;
  colorB?: string;
  formatValue?: (n: number) => string;
}

export const Chart = ({
  unit,
  data,
  data2 = null,
  accent = "text-emerald-500",
  className = "",
  area = true,
  labelA = "Up",
  labelB = "Down",
  colorA = "currentColor",
  colorB = "hsl(var(--su))",
  formatValue: fmtOverride,
}: ChartProps) => {
  const fmt = fmtOverride || (unit === "%" ? formatPct : formatBps);
  return (
    <div className={cn("w-full h-full bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60", className)}>
      <div className="w-full h-20">
        <Sparkline
          data={data}
          data2={data2}
          className={cn("w-full h-full", accent)}
          formatValue={fmt}
          unit={unit}
          area={area}
          labelA={labelA}
          labelB={labelB}
          colorA={colorA}
          colorB={colorB}
        />
      </div>
    </div>
  );
};
