import { motion } from "framer-motion";

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  start: boolean;
}

const CircularProgress = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  start,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const targetOffset =
    circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size}>
        {/* Cercle background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Cercle animé */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f2cc6a"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: start ? targetOffset : circumference,
          }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </svg>

      {/* Pourcentage */}
      <span className="absolute text-lg font-semibold text-white/90">
        {percentage}%
      </span>
    </div>
  );
};

export default CircularProgress;
