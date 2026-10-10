import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  icon,
  gradient,
}) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.98,
      }}
      className={`
        relative
        overflow-hidden
        rounded-3xl
        p-6
        text-slate-900 dark:text-white
        shadow-xl
        ${gradient}
      `}
    >
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 flex justify-between items-start">

        <div>

          <p className="text-white/80 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-extrabold mt-3">
            {value}
          </h2>

        </div>

        <div className="text-4xl">
          {icon}
        </div>

      </div>
    </motion.div>
  );
}