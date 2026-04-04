import React, { useState } from "react";
import { Info } from "lucide-react";
import PortalCardBack from "./portal-back-design";
import { PortalConfig } from "./portal-config";
import Link from "next/link";

export type PortalCardProps = PortalConfig & {
  onClick?: () => void;
  metadataKey?: PortalConfig["metadataKey"];
};

const PortalCard: React.FC<PortalCardProps> = ({
  title,
  subtitle,
  description,
  icon: Icon,
  onClick,
  metricCard,
  href,
  metadataKey,
}) => {
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const handleFlip = () => setRotationDegrees(prev => prev + 180);
  const showBack = Math.floor(rotationDegrees / 180) % 2 === 1;

  return (
    <div className="flex flex-col w-fit">
      {subtitle && (
        <Link
          href={href}
          className="flex items-center mb-0.5 ml-1 text-gray-400 hover:text-white transition-colors"
        >
          <span className="text-sm font-normal tracking-wide ml-1">{subtitle}</span>
        </Link>
      )}

      <div className="relative [perspective:1200px] max-h-[21rem] max-w-[21rem] min-h-[21rem] min-w-[21rem]">
        <div
          className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: `rotateY(${rotationDegrees}deg)` }}
        >
          {/* FRONT */}
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <div
              className="bg-white/5 backdrop-blur border border-white/20 rounded-xl flex flex-col overflow-visible p-3 font-manrope h-full w-full"
              onClick={onClick}
            >
              <div className="flex items-center gap-2 bg-white/5 rounded-xl py-2 px-2 mb-3">
                {Icon && <Icon className="w-6 h-6 text-white shrink-0" />}
                <h2 className="text-lg font-semibold text-white truncate flex-1">{title}</h2>
                <button
                  className="text-white/30 hover:text-white/70 hover:bg-white/5 bg-white/0 rounded-full w-6 h-6 flex items-center justify-center shrink-0  transition-all duration-200"
                  onClick={(e) => { e.stopPropagation(); handleFlip(); }}
                >
                  <Info className="w-7 h-7" />
                </button>
              </div>

              <div className="flex flex-col flex-1 mt-2">
                {metricCard && <div className="flex-1 w-full">{metricCard}</div>}
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 rotate-y-180 [backface-visibility:hidden]">
            <div className="h-full w-full">
              <PortalCardBack
                title={title}
                metadataKey={metadataKey}
                onFlipBack={handleFlip} // pass flip callback
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalCard;
