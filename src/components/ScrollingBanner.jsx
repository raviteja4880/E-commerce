import { motion } from "framer-motion";
import "../styles/scrollMessage.css";

export default function ScrollingBanner({ show = true }) {
  if (!show) return null;

  return (
    <motion.div
      className="scrolling-banner-container"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="scrolling-banner text-center fw-semibold">
        <div className="scrolling-text">
          <span>
            ⏳ Our servers are waking up... Please be patient while we load the products for you. Thank you for your patience! &nbsp;&nbsp;&nbsp;
          </span>
          <span>
            ⏳ Our servers are waking up... Please be patient while we load the products for you. Thank you for your patience! &nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>
    </motion.div>
  );
}
