import { motion } from "framer-motion";

export default function NeonButton({ children, onClick, color = "neonPink" }) {
  const colorMap = {
    neonPink: "from-neonPink to-neonPurple",
    neonBlue: "from-neonBlue to-neonPurple",
    neonGreen: "from-neonGreen to-neonBlue",
  };

  return (
    <motion.button
      whileHover={{
        scale: 1.07,
        boxShadow: `0 0 20px var(--tw-${color})`,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`py-3 px-6 bg-gradient-to-r ${colorMap[color]} text-darkBg font-bold rounded-xl transition-transform`}
    >
      {children}
    </motion.button>
  );
}
