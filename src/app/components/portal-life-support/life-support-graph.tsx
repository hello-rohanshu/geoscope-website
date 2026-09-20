// app/areas/standard-of-life/life-support-graph.tsx
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { metrics, trendData } from "./life-support-data";

export const LifeSupportGraph: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trendData} margin={{ top:0, right:10, left: -30, bottom: 0 }}>
        <XAxis
          dataKey="x"
          tick={{ fontSize: 10 }}
          axisLine={true}
          tickLine={false}
          interval="preserveStartEnd"
          padding={{ left: 0, right: 0 }} // expand left
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 10 }}
          axisLine={true}
          tickLine={false}
          padding={{ top: 0, bottom: 10 }} // expand bottom
        />
        <Tooltip
          wrapperStyle={{ fontSize: 12, borderRadius: 6 }}
          formatter={(value: any, name: string) => {
            const metric = metrics.find((m) => m.key === name);
            const label = metric ? metric.label : name;
            return [`${Number(value).toFixed(1)}%`, label];
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
  );
};
