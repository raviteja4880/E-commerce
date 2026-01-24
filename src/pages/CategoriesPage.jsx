import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaGem,
  FaTshirt,
  FaLaptop,
  FaShoePrints,
  FaPalette,
} from "react-icons/fa";

const categories = [
  {
    name: "Men's Clothing",
    slug: "men's clothing",
    icon: <FaTshirt size={28} />,
  },
  {
    name: "Women's Clothing",
    slug: "women's clothing",
    icon: <FaTshirt size={28} />,
  },
  {
    name: "Electronics",
    slug: "electronics",
    icon: <FaLaptop size={28} />,
  },
  {
    name: "Jewelery",
    slug: "jewelery",
    icon: <FaGem size={28} />,
  },
  {
    name: "Footwear",
    slug: "footwear",
    icon: <FaShoePrints size={28} />,
  },
  {
    name: "Accessories",
    slug: "accessories",
    icon: <FaPalette size={28} />,
  },
];

export default function CategoriesPage() {
  const navigate = useNavigate();

  const handleCategoryClick = (slug) => {
    navigate(`/?category=${slug}`);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Categories</h3>

      <div style={styles.grid}>
        {categories.map((cat) => (
          <div
            key={cat.slug}
            style={styles.card}
            onClick={() => handleCategoryClick(cat.slug)}
          >
            <div style={styles.icon}>{cat.icon}</div>
            <span style={styles.name}>{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px" },
  title: {
    marginBottom: "20px",
    fontSize: "22px",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
  },
  card: {
    background: "#fff",
    padding: "18px 10px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    cursor: "pointer",
    transition: "0.3s",
  },
  icon: { marginBottom: "8px", color: "#007bff" },
  name: {
    fontSize: "14px",
    fontWeight: "500",
  },
};
