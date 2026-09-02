import React from 'react';

interface ToggleButtonProps {
  toggled: boolean;
  onToggle: () => void;
}

export default function ToggleButton({ toggled, onToggle }: ToggleButtonProps) {
  const buttonWidth = 64; // px
  const buttonHeight = 32; // px
  const knobSize = 16; // px
  const slideDistance = buttonWidth - knobSize -16; // 40px

  return (
    <button
      onClick={onToggle}
      aria-label="Toggle mode"
      className="
        relative
        w-16 h-8
        bg-gray-900
        rounded-none
        cursor-pointer
        select-none
        focus:outline-none
      "
      style={{ width: `${buttonWidth}px`, height: `${buttonHeight}px` }}
    >
      {/* Sliding knob */}
      <div
        className={`absolute top-2 left-2 bg-gray-300 rounded-none transition-transform duration-150`}
        style={{
          width: `${knobSize}px`,
          height: `${knobSize}px`,
          transform: toggled ? `translateX(${slideDistance}px)` : 'translateX(0)',
        }}
      />
    </button>
  );
}
