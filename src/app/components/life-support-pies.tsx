// app/areas/standard-of-life/life-support-pies.tsx
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { metrics, Metric } from "./life-support-data";

type MiniPieProps = {
    m: Metric;
};

const MiniPie: React.FC<MiniPieProps> = ({ m }) => {
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
                            innerRadius={13}
                            outerRadius={20}
                            paddingAngle={0}
                            cornerRadius={0}
                            isAnimationActive={false}
                            stroke="#000000ff" // Tailwind gray-400
                            strokeWidth={0}  // optional, adjust thickness
                        >
                            <Cell key="filled" fill={m.color} />
                            <Cell key="empty" fill="#a0aec047" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="text-xs font-semibold">{value.toFixed(1)}%</div>
        </div>
    );
};

export const LifeSupportPies: React.FC = () => {
    return (
        <div className="grid grid-cols-4 gap-1 items-center justify-items-center">
            {metrics.map((m) => (
                <MiniPie key={m.key} m={m} />
            ))}
        </div>
    );
};
