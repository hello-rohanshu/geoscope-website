import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";
import { energyData, energyTicks } from "./fuel-data";

const MinimalIndependentEnergyWithPrediction = () => {
  return (
    <div style={{ height: "100%", width: "100%", marginBottom: -10 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={energyData}
          margin={{ top: 0, right: 10, bottom: 0, left: -30 }}
        >
          <XAxis
            dataKey="year"
            ticks={energyTicks}
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
            tickLine={false}
            axisLine={false}
          />

          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={true} />

          <Line
            dataKey="fossil"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            dataKey="renewable"
            stroke="#16a34a"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MinimalIndependentEnergyWithPrediction;
