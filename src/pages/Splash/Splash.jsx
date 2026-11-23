import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import logo from "../../assets/logo.png";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 1600);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-green-950">
      <div className="absolute h-96 w-96 rounded-full bg-green-600/20 blur-3xl" />
      <div className="absolute bottom-0 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center"
      >
        <img
          src={logo}
          alt="CheckMaster"
          className="h-36 w-36 rounded-[2rem] shadow-2xl shadow-green-900/40"
        />

        <h1 className="mt-8 text-5xl font-extrabold text-white">CheckMaster</h1>

        <p className="mt-3 tracking-widest text-slate-300">
          SMART CHEQUE MANAGER
        </p>

        <div className="mt-14 flex gap-2">
          {[0, 0.2, 0.4].map((delay) => (
            <motion.div
              key={delay}
              animate={{ scale: [1, 1.6, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, delay }}
              className="h-3 w-3 rounded-full bg-green-400"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
