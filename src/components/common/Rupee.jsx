import React from "react";

/**
 * Consistent Rupee formatter component
 * @param {number} value - The amount to display
 * @param {string} size - Font size
 * @param {boolean} bold - Whether to bold the text
 * @param {string} color - Text color
 */
const Rupee = ({ value, size = "1rem", bold = false, color = "#000" }) => (
  <span
    style={{
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: size,
      fontWeight: bold ? 600 : 500,
      color,
      display: "inline-flex",
      alignItems: "baseline",
      gap: "2px",
    }}
  >
    <span
      style={{
        fontFamily: "sans-serif",
        fontWeight: 600,
        transform: "translateY(-0.5px)",
      }}
    >
      ₹
    </span>
    <span>{value?.toLocaleString("en-IN")}</span>
  </span>
);

export default Rupee;
