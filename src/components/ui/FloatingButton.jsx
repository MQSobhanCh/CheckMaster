import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function FloatingButton() {
  const navigate = useNavigate();

  return (
    <motion.button
      whileHover={{
        scale: 1.1,
        rotate: 90,
      }}
      whileTap={{
        scale: 0.9,
      }}
      onClick={() => navigate("/add-cheque")}
      className="
      fixed
      bottom-24
      right-6
      w-16
      h-16
      rounded-full
      bg-gradient-to-r
      from-green-600
      to-emerald-500
      text-slate-900 dark:text-white
      shadow-2xl
      flex
      items-center
      justify-center
      text-2xl
      z-50
      "
    >
      <FaPlus />
    </motion.button>
  );
}