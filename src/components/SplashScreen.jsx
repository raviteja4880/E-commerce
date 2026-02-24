import { motion } from "framer-motion";
import "../styles/Splash.css";

export default function SplashScreen() {
  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Glow Background */}
      <motion.div
        className="glow-circle"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Logo */}
      <motion.img
        src="/favicon.ico"
        alt="MyStorX"
        className="brand-logo"
        initial={{ rotate: -15, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 120,
          damping: 10,
        }}
      />

      {/* Title */}
      <motion.h1
        className="brand-title"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring" }}
      >
        MyStorX
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="brand-sub"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Shop Smart. Live Better.
      </motion.p>
    </motion.div>
  );
}
