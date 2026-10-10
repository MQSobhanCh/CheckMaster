import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">

      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center justify-center w-36 h-36 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
        >
          <span className="text-7xl">💳</span>
        </motion.div>

        <h1 className="mt-8 text-5xl font-extrabold text-white">
          CheckMaster
        </h1>

        <p className="mt-3 tracking-widest text-slate-300">
          SMART CHEQUE MANAGER
        </p>

        <div className="flex gap-2 mt-16">
          <motion.div
            animate={{ scale: [1, 1.6, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-3 h-3 bg-blue-400 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.6, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
            className="w-3 h-3 bg-cyan-400 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.6, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
            className="w-3 h-3 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </div>
  );
}