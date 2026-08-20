/* These component structures are the official shadcn charts:
 * https://ui.shadcn.com/r/styles/new-york-v4/chart-area-gradient.json
 * https://ui.shadcn.com/r/styles/new-york-v4/chart-area-default.json
 * https://ui.shadcn.com/r/styles/new-york-v4/chart-radar-default.json
 *
 * Dungeon supplies different data and tokens, but keeps the shadcn/Recharts chart
 * themselves: ChartContainer/ResponsiveContainer, accessible Recharts primitives,
 * horizontal grids, shadcn tooltip content, natural curves and gradient areas.
 * This file is bundled as one isolated browser component; the rest of the app
 * remains framework-free. */
import React, { useMemo } from "react";
import { createRoot } from "react-dom/client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Diamond, DoorOpen, Flag, PersonStanding } from "lucide-react";

const ROOTS = new WeakMap();
const ROUTE = [
  { progress: 0, route: 4 },
  { progress: 20, route: 14 },
  { progress: 40, route: 29 },
  { progress: 60, route: 49 },
  { progress: 80, route: 72 },
  { progress: 100, route: 100 }
];

function routeValue(progress) {
  const bounded = Math.max(0, Math.min(100, progress));
  const rightIndex = ROUTE.findIndex((point) => point.progress >= bounded);
  if (rightIndex <= 0) return ROUTE[0].route;
  const left = ROUTE[rightIndex - 1];
  const right = ROUTE[rightIndex];
  const ratio = (bounded - left.progress) / (right.progress - left.progress);
  return left.route + (right.route - left.route) * ratio;
}

function chartData(progress) {
  const bounded = Math.max(0, Math.min(100, Number(progress) || 0));
  const points = ROUTE.concat([{ progress: bounded, route: routeValue(bounded) }])
    .sort((a, b) => a.progress - b.progress)
    .filter((point, index, all) => index === 0 || point.progress !== all[index - 1].progress);
  return points.map((point) => ({
    progress: point.progress,
    route: point.route,
    earned: point.progress <= bounded ? point.route : null
  }));
}

/* The core of shadcn's ChartContainer: one responsive owner for chart geometry.
 * Dungeon uses external CSS instead of Tailwind-generated selectors, but keeps the
 * component boundary and data-slot contract. */
function ChartContainer({ children, className, chart, initialDimension }) {
  return (
    <div className={className} data-slot="chart" data-chart={chart}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={initialDimension}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

const ChartTooltip = Tooltip;

function MomentumTooltipContent({ active, payload, label, progress }) {
  if (!active || !payload?.length) return null;
  const threshold = Math.round(Number(label) || 0);
  return (
    <div className="momentum-chart-tooltip">
      <b>{threshold}% of the route</b>
      <span>{threshold <= progress ? "Supported by current evidence" : "Still ahead"}</span>
    </div>
  );
}

function ChartIcon({ cx, cy, icon: Icon, className = "", shiftX = 0, shiftY = 0 }) {
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  return (
    <Icon
      x={cx - 11 + shiftX}
      y={cy - 22 + shiftY}
      width={22}
      height={22}
      strokeWidth={2.1}
      className={`chart-route-icon ${className}`.trim()}
      aria-hidden="true"
    />
  );
}

function MomentumAreaChart({ progress, label, reducedMotion }) {
  const bounded = Math.max(0, Math.min(100, Number(progress) || 0));
  const data = useMemo(() => chartData(bounded), [bounded]);
  const currentY = routeValue(bounded);
  const currentShift = bounded < 8 ? 13 : bounded > 92 ? -13 : 0;

  return (
    <ChartContainer className="momentum-chart" chart="momentum" initialDimension={{ width: 560, height: 168 }}>
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 24, right: 22, bottom: 3, left: 22 }}
        >
          <title>{label}</title>
          <desc>Evidence rises from the start to every concept Strong. The person icon marks the current position.</desc>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="progress" type="number" domain={[0, 100]} hide />
          <YAxis type="number" domain={[0, 108]} hide />
          <ChartTooltip cursor={false} content={<MomentumTooltipContent progress={bounded} />} />
          <defs>
            <linearGradient id="momentum-route-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--blue-on-deep)" stopOpacity={0.34} />
              <stop offset="95%" stopColor="var(--blue-on-deep)" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="momentum-earned-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--saffron)" stopOpacity={0.72} />
              <stop offset="95%" stopColor="var(--saffron)" stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <Area
            dataKey="route"
            type="natural"
            fill="url(#momentum-route-fill)"
            fillOpacity={0.4}
            stroke="var(--blue-on-deep)"
            strokeOpacity={0.55}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={!reducedMotion}
          />
          <Area
            dataKey="earned"
            type="natural"
            fill="url(#momentum-earned-fill)"
            fillOpacity={0.52}
            stroke="var(--saffron)"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
            isAnimationActive={!reducedMotion}
          />
          <ReferenceDot
            x={0}
            y={ROUTE[0].route}
            isFront
            shape={(props) => <ChartIcon {...props} icon={Flag} shiftX={-3} />}
          />
          <ReferenceDot
            x={bounded}
            y={currentY}
            isFront
            shape={(props) => <ChartIcon {...props} icon={PersonStanding} className="current" shiftX={currentShift} shiftY={-3} />}
          />
          <ReferenceDot
            x={100}
            y={ROUTE[ROUTE.length - 1].route}
            isFront
            shape={(props) => <ChartIcon {...props} icon={DoorOpen} className="goal" shiftX={3} />}
          />
        </AreaChart>
    </ChartContainer>
  );
}

function TrendTooltipContent({ active, payload, label }) {
  if (!active || !payload?.length || payload[0]?.value == null) return null;
  return (
    <div className="dungeon-chart-tooltip">
      <b>Practice block {label}</b>
      <span>{Math.round(Number(payload[0].value) || 0)}% demonstrated evidence</span>
    </div>
  );
}

function EvidenceTrendChart({ points, label, reducedMotion }) {
  const hasPoints = points.length > 0;
  const data = hasPoints ? points : [{ block: 1, value: null }, { block: 2, value: null }];
  const lastBlock = hasPoints ? points[points.length - 1].block : 2;
  return (
    <>
      {!hasPoints && <p className="trend-empty-copy">Your first practice block will start the chart</p>}
      <ChartContainer className="dungeon-chart trend-chart" chart="evidence-trend" initialDimension={{ width: 620, height: 220 }}>
        <AreaChart accessibilityLayer data={data} margin={{ top: 12, right: 12, bottom: 2, left: 0 }}>
          <title>{label}</title>
          <desc>Demonstrated evidence after each completed practice block.</desc>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="block"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            interval="preserveStartEnd"
            tickFormatter={(value) => value === 1 ? "First" : value === lastBlock ? "Latest" : `B${value}`}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <ChartTooltip cursor={false} content={<TrendTooltipContent />} />
          <defs>
            <linearGradient id="evidence-trend-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--green)" stopOpacity={0.55} />
              <stop offset="95%" stopColor="var(--green)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <Area
            dataKey="value"
            type="natural"
            fill="url(#evidence-trend-fill)"
            fillOpacity={0.45}
            stroke="var(--green)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={!reducedMotion}
          />
          {points.length === 1 && (
            <ReferenceDot
              x={points[0].block}
              y={points[0].value}
              isFront
              shape={(props) => <ChartIcon {...props} icon={Diamond} className="trend-single-point" shiftY={6} />}
            />
          )}
        </AreaChart>
      </ChartContainer>
    </>
  );
}

function RadarTooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="dungeon-chart-tooltip">
      <b>{row.label}</b>
      <span>{Math.round(row.value)}% demonstrated evidence</span>
    </div>
  );
}

function MasteryRadarChart({ axes, label, reducedMotion }) {
  return (
    <ChartContainer className="dungeon-chart radar-chart" chart="mastery-radar" initialDimension={{ width: 320, height: 320 }}>
      <RadarChart accessibilityLayer data={axes} outerRadius="62%" margin={{ top: 24, right: 28, bottom: 24, left: 28 }}>
        <title>{label}</title>
        <desc>Four subject evidence values and one cross-course connections value.</desc>
        <ChartTooltip cursor={false} content={<RadarTooltipContent />} />
        <PolarGrid gridType="polygon" />
        <PolarAngleAxis dataKey="label" tickLine={false} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          fill="var(--blue)"
          fillOpacity={0.32}
          stroke="var(--blue)"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={!reducedMotion}
        />
      </RadarChart>
    </ChartContainer>
  );
}

function renderChart(node, Component, props) {
  let root = ROOTS.get(node);
  if (!root) {
    root = createRoot(node);
    ROOTS.set(node, root);
  }
  root.render(<Component {...props} />);
}

window.DungeonCharts = {
  renderMomentum(node, props) { renderChart(node, MomentumAreaChart, props); },
  renderTrend(node, props) { renderChart(node, EvidenceTrendChart, props); },
  renderRadar(node, props) { renderChart(node, MasteryRadarChart, props); }
};
