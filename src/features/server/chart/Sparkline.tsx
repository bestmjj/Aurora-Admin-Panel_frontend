import { useId, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";

interface DataPoint {
  x: number;
  a: number;
  b?: number;
}

// Build data points for one or two series.
const toSeries = (arrA: number[] = [], arrB: number[] | null = null): DataPoint[] => {
  if (Array.isArray(arrB) && arrB.length) {
    const len = Math.min(arrA.length, arrB.length);
    const out = new Array<DataPoint>(len);
    for (let i = 0; i < len; i++) out[i] = { x: i, a: arrA[i], b: arrB[i] };
    return out;
  }
  return arrA.map((v, i) => ({ x: i, a: v }));
};

const defaultFormat = (n: number) => `${Math.round(n)}`;

interface SparklineProps {
  data?: number[];
  data2?: number[] | null;
  area?: boolean;
  strokeWidth?: number;
  className?: string;
  showLatest?: boolean;
  formatValue?: (n: number) => string;
  labelA?: string;
  labelB?: string;
  colorA?: string;
  colorB?: string;
  unit?: string | null;
}

const Sparkline = ({
  data = [],
  data2 = null,
  area = true,
  strokeWidth = 2,
  className = "",
  showLatest = true,
  formatValue = defaultFormat,
  labelA = "Up",
  labelB = "Down",
  colorA = "currentColor",
  colorB = "hsl(var(--su))",
  unit = null,
}: SparklineProps) => {
  const uid = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const series = useMemo(() => toSeries(data, data2), [data, data2]);
  const latestA = data?.length ? data[data.length - 1] : null;
  const latestB = data2?.length ? data2[data2.length - 1] : null;

  const hasB = Array.isArray(data2) && data2.length > 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SparkPortalTooltip = (props: any) => {
    const { active, payload, coordinate } = props || {};
    if (!active || !payload || payload.length === 0) return null;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !coordinate) return null;

    const gap = 10;
    const pageX = rect.left + (coordinate.x ?? 0) + window.scrollX + gap;
    const pageY = rect.top + (coordinate.y ?? 0) + window.scrollY - gap;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = payload.filter((p: any) => p && p.value != null);

    const node = (
      <div
        style={{
          position: "fixed",
          left: pageX,
          top: pageY,
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        <div className="rounded-xl bg-card text-card-foreground shadow-lg ring-1 ring-border px-2 py-1 text-xs">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {items.map((it: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 leading-none py-0.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: it.color }}
              />
              <span className="opacity-70">
                {it.dataKey === "a" ? labelA : labelB}
              </span>
              <span className="font-medium tabular-nums">{formatValue(it.value)}</span>
            </div>
          ))}
        </div>
      </div>
    );
    return createPortal(node, document.body);
  };

  const topPadClass = showLatest ? (hasB ? "pt-8" : "pt-4") : "";

  return (
    <div className={`relative ${className} ${topPadClass}`}>
      {showLatest && (
        <div className={`absolute left-0 top-0 ${hasB ? "flex flex-col gap-1" : "flex flex-row gap-2"} items-start ${hasB ? "text-[9.5px]" : "text-xs"} leading-none opacity-90`}>
          {latestA !== null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 py-0.5">
              {
                !hasB && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: colorA }} />
                )
              }
              <span className="tabular-nums">{formatValue(latestA)}</span>
            </span>
          )}
          {hasB && latestB !== null && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 py-0.5">
              <span className="tabular-nums">{formatValue(latestB)}</span>
            </span>
          )}
        </div>
      )}
      <div ref={containerRef} className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          {area ? (
            <AreaChart data={series} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              {unit === "%" && (
                <YAxis hide domain={[0, 100]} />
              )}
              <defs>
                <linearGradient id={`grad-a-${uid}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={colorA} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={colorA} stopOpacity={0} />
                </linearGradient>
                {hasB && (
                  <linearGradient id={`grad-b-${uid}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={colorB} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={colorB} stopOpacity={0} />
                  </linearGradient>
                )}
              </defs>
              <Tooltip
                cursor={{ stroke: "currentColor", strokeDasharray: "3 3", opacity: 0.2 }}
                isAnimationActive={false}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ outline: "none", display: "none" }}
                content={<SparkPortalTooltip />}
              />
              <Area
                type="monotone"
                dataKey="a"
                stroke={colorA}
                strokeWidth={strokeWidth}
                fill={`url(#grad-a-${uid})`}
                isAnimationActive={false}
                dot={{ r: 2, strokeWidth: 0 }}
                activeDot={{ r: 3 }}
              />
              {hasB && (
                <Area
                  type="monotone"
                  dataKey="b"
                  stroke={colorB}
                  strokeWidth={strokeWidth}
                  fill={`url(#grad-b-${uid})`}
                  isAnimationActive={false}
                  dot={{ r: 2, strokeWidth: 0 }}
                  activeDot={{ r: 3 }}
                />
              )}
            </AreaChart>
          ) : (
            <LineChart data={series} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              {unit === "%" && (
                <YAxis hide domain={[0, 100]} />
              )}
              <Tooltip
                cursor={{ stroke: "currentColor", strokeDasharray: "3 3", opacity: 0.2 }}
                isAnimationActive={false}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ outline: "none", display: "none" }}
                content={<SparkPortalTooltip />}
              />
              <Line
                type="monotone"
                dataKey="a"
                stroke={colorA}
                strokeWidth={strokeWidth}
                isAnimationActive={false}
                dot={{ r: 2, strokeWidth: 0 }}
                activeDot={{ r: 3 }}
              />
              {hasB && (
                <Line
                  type="monotone"
                  dataKey="b"
                  stroke={colorB}
                  strokeWidth={strokeWidth}
                  isAnimationActive={false}
                  dot={{ r: 2, strokeWidth: 0 }}
                  activeDot={{ r: 3 }}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Sparkline;
