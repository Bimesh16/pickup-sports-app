import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  xp: number;
  level: number;
  levelCap?: number;
  next: {
    label: string;
    xpRemaining: number;
  };
  className?: string;
}

const VerticalXP: React.FC<Props> = ({ 
  xp, 
  level, 
  levelCap = 250, 
  next, 
  className = '' 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  const progress = Math.min((xp / levelCap) * 100, 100);
  
  // Everest SVG component
  const EverestIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      className="text-white drop-shadow-lg"
    >
      <path
        d="M12 2L8 8L12 14L16 8L12 2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M10 6L12 8L14 6L12 4L10 6Z"
        fill="currentColor"
        opacity="0.7"
      />
      <path
        d="M11 4L12 5L13 4L12 3L11 4Z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );

  return (
    <div className={`relative ${className}`} data-testid="vertical-xp">
      {/* Vertical Progress Track - Neutral dark glass */}
      <div className="relative h-[360px] w-3 sm:w-4 rounded-full bg-black/20 backdrop-blur-sm overflow-hidden">
        {/* Progress Fill - Nepal gradient */}
        <motion.div
          className="absolute bottom-0 left-0 w-full rounded-b-full bg-gradient-to-t from-nepal-crimson to-nepal-blue"
          initial={{ height: '0%' }}
          animate={{ height: `${progress}%` }}
          transition={{ 
            duration: shouldReduceMotion ? 0 : 1.5, 
            ease: "easeOut" 
          }}
        />
        
        {/* Everest Icon at fill tip with white halo */}
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ bottom: `${progress}%` }}
          animate={shouldReduceMotion ? {} : {
            y: [0, -2, 0],
            rotate: [0, 1, -1, 0]
          }}
          transition={shouldReduceMotion ? {} : {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative" data-testid="xp-mountain">
            {/* White halo */}
            <div className="absolute inset-0 bg-white/30 rounded-full blur-sm scale-110" />
            <EverestIcon />
          </div>
        </motion.div>
      </div>

      {/* Tick Labels */}
      <div className="absolute -left-8 top-0 h-full flex flex-col justify-between text-[10px] text-text-dark-contrast font-medium tick-labels">
        <span className="transform -translate-y-1">{levelCap}</span>
        <span className="transform -translate-y-1">{xp}</span>
        <span className="transform translate-y-1">0</span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          className="absolute -left-2 top-1/2 transform -translate-y-1/2 translate-x-full bg-black/90 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div className="font-semibold">
            {xp}/{levelCap} XP
          </div>
          <div className="text-gray-300">
            {next.label} in {next.xpRemaining} XP
          </div>
          {/* Tooltip arrow */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black/90 rotate-45" />
        </motion.div>
      )}

      {/* Invisible hover area for tooltip */}
      <div
        className="absolute inset-0 cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        tabIndex={0}
        role="progressbar"
        aria-label={`XP Progress: ${xp} out of ${levelCap} XP. ${next.label} in ${next.xpRemaining} XP`}
        aria-valuenow={xp}
        aria-valuemin={0}
        aria-valuemax={levelCap}
      />
    </div>
  );
};

export default VerticalXP;
