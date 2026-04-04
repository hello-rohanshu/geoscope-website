// app/areas/standard-of-life/life-support-v1.tsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Wind } from "lucide-react";

type Metric = {
  key: string;
  label: string;
  valuePct: number; // 0-100, % meeting ideal
  color: string;
  icon: React.ReactNode;
};

// Verified, rights-based metrics
const metrics: Metric[] = [
  {
    key: "food",
    label: "Food",
    valuePct: 64.6, // % population with access to & can afford healthy diet
    color: "#16a34a", // green
    icon: "🍎",
  },
  {
    key: "air",
    label: "Air",
    valuePct: 1, // % population breathing air within WHO guideline
    color: "#7dd3fc", // light sky blue
    icon: <Wind size={14} />,
  },
  {
    key: "water",
    label: "Water",
    valuePct: 73, // % population with safely managed drinking water
    color: "#2563eb", // blue
    icon: "💧",
  },
  {
    key: "shelter",
    label: "Shelter",
    valuePct: 79.4, // % population with adequate housing
    color: "#7c4a2e", // brown
    icon: "🏠",
  },
];

/**
 * Trend data (plausible 2000–2024, scaled to rights-based ideal percentages)
 * Replace with real historical series when available
 */
const trendData = [
  { x: 1990, food: 50, air: 3, water: 50, shelter: 60 },
  { x: 1995, food: 52, air: 3.5, water: 55, shelter: 62 },
  { x: 2000, food: 55, air: 4, water: 60, shelter: 65 },
  { x: 2005, food: 58, air: 4.5, water: 65, shelter: 68 },
  { x: 2010, food: 60, air: 5, water: 70, shelter: 72 },
  { x: 2015, food: 62, air: 5.5, water: 72, shelter: 75 },
  { x: 2020, food: 64, air: 6, water: 73, shelter: 78 },
  { x: 2024, food: 64.6, air: 6.5, water: 74, shelter: 79.4 },
];
const MiniPie: React.FC<{ m: Metric }> = ({ m }) => {
  const value = Math.max(0, Math.min(100, m.valuePct));
  const data = [
    { name: "filled", value },
    { name: "empty", value: 100 - value },
  ];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-1">
        <div className="text-sm -mt-0.5">{m.icon}</div>
        <div className="text-xs font-medium tracking-tight">{m.label}</div>
      </div>

      <div className="w-16 h-12 -mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              innerRadius={10}
              outerRadius={20}
              paddingAngle={0}
              isAnimationActive={false}
            >
              <Cell key="filled" fill={m.color} />
              <Cell key="empty" fill="#000000" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs font-semibold">{value.toFixed(1)}%</div>
    </div>
  );
};

const LifeSupportMetricCard: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col p-2 gap-2">
      {/* Row 1: 4 pies */}
      <div className="grid grid-cols-4 gap-1 items-center justify-items-center">
        {metrics.map((m) => (
          <MiniPie key={m.key} m={m} />
        ))}
      </div>

      {/* Row 2: trend line */}
      <div className="w-full h-20">
<ResponsiveContainer width="100%" height="100%">
  <LineChart
    data={trendData}
    margin={{
      top: 6,
      right: 0,
      left: -37,    // remove left margin
      bottom: -10,  // remove bottom margin
    }}
  >
    {/* Expand the plot area via axis offsets */}
    <XAxis
      dataKey="x"
      tick={{ fontSize: 10 }}
      axisLine={true}
      tickLine={false}
      interval="preserveStartEnd"
      padding={{ left: 0, right: 0 }} // 15px left padding inside the plot
    />
    <YAxis
      domain={[0, 100]}
      tick={{ fontSize: 10 }}
      axisLine={true}
      tickLine={false}
      padding={{ top: 0, bottom: 10 }} // 10px bottom padding
    />

    <Tooltip
      wrapperStyle={{ fontSize: 12, borderRadius: 6 }}
      formatter={(value: any, name: string) => {
        const metric = metrics.find((mm) => mm.key === name);
        const pretty = metric ? metric.label : name;
        return [`${value.toFixed(1)}%`, pretty];
      }}
      labelFormatter={(label: any) => `Year: ${label}`}
    />

    {metrics.map((m) => (
      <Line
        key={m.key}
        type="monotone"
        dataKey={m.key}
        stroke={m.color}
        strokeWidth={2}
        dot={false}
        isAnimationActive={false}
        strokeOpacity={m.key === "air" ? 0.9 : 1}
      />
    ))}
  </LineChart>
</ResponsiveContainer>

      </div>
    </div>
  );
};

export default LifeSupportMetricCard;
