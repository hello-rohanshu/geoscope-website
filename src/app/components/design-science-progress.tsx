import React from "react";

export default function DesignScienceProgress(): React.ReactElement {
  const checkpoints = [
    { id: "cp1", label: "pilot education", completed: true },
    { id: "cp2", label: "world energy grid", completed: false },
    { id: "cp3", label: "level flight", completed: false },
  ];

  const completedCount = checkpoints.filter((c) => c.completed).length;
  const percent = Math.round((completedCount / checkpoints.length) * 100);

  return (
    <div className="bg-black pt-200">
    <div className="max-w-3xl mx-auto p-6 space-y-8 w-full">
      <h1 className="text-5xl font-bold text-gray-500">
        Design Science Revolution
      </h1>

      <div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-4 rounded-full transition-all duration-500"
            style={{ width: `${percent}%`, background: "linear-gradient(90deg,#10b981,#06b6d4)" }}
          />
        </div>

        <div className="flex justify-between mt-4 text-sm text-gray-700">
          {checkpoints.map((cp) => (
            <div key={cp.id} className="flex flex-col items-center w-1/3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center border ${cp.completed ? "bg-green-500 border-green-600" : "bg-white border-gray-300"}`}
              >
                <span className={`w-2 h-2 rounded-full ${cp.completed ? "bg-white" : "bg-gray-300"}`} />
              </div>
              <div className="mt-2 text-center uppercase tracking-wide font-medium">
                {cp.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 text-sm text-gray-600">{percent}% complete</div>
      </div>
    </div>
    </div>
  );
}