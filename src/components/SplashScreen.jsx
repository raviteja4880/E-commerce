import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import "../styles/Splash.css";

export default function SplashScreen() {
  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
    >
      <ShoppingBag size={64} className="brand-icon" />
      <h1 className="brand-title">MyStorX</h1>
      <p className="brand-sub">Shop Smart. Live Better.</p>
    </motion.div>
  );
}
