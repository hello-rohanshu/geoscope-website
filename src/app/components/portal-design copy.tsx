// components/PortalCard.tsx
import React from "react";
import { PortalConfig } from "./portal-config";

export type PortalCardProps = Omit<PortalConfig, "href"> & {
  onClick?: () => void;
};

const PortalCard: React.FC<PortalCardProps> = ({
  description,
  mainMetric,
  secondaryMetric,
  title,
  subtitle,
  icon: Icon,
  onClick,
  metricCard,
}) => {
  return (
    <div
      className="bg-white/5 backdrop-blur- border border-white/20 rounded-xl max-h-[21rem] max-w-[21rem] min-h-[21rem] min-w-[21rem] flex flex-col overflow-visible p-3"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center gap-2 bg-white/5 rounded-xl py-2 px-2 mb-3">
        {Icon && <Icon className="w-6 h-6 text-white" />}
        <h2 className="text-xl font-semibold text-white flex items-center">
          {title}
          {subtitle && (
            <span className="ml-2 text-sm font-base text-gray-500 flex items-center">
              • {subtitle}
            </span>
          )}
        </h2>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        {metricCard && (
          <div className="flex-1 w-full">
            {metricCard}
          </div>
        )}
      </div>
    </div>
  );

};

export default PortalCard;
