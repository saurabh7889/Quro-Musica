import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gradient-to-br from-gray-950 via-black to-gray-900">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="text-[#1DB954]"
      >
        <Loader2 className="w-12 h-12" />
      </motion.div>
    </div>
  );
}
