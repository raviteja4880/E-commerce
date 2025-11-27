import React, { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";
import "../../styles/ProductCard.css";

const ProductCard = React.memo(({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  /** Memoized handler — stable between renders */
  const handleAddToCart = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo?.token) {
        toast.warning("You need to log in to access the cart");
        navigate("/login");
        return;
      }

      const productImage = e.currentTarget.closest("div").querySelector("img");
      const cartIcon = document.getElementById("cart-icon");
      if (!cartIcon || !productImage) return;

      // Create flying clone
      const clone = productImage.cloneNode(true);
      const imgRect = productImage.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      Object.assign(clone.style, {
        position: "fixed",
        left: imgRect.left + "px",
        top: imgRect.top + "px",
        width: imgRect.width + "px",
        height: imgRect.height + "px",
        borderRadius: "8px",
        transition:
          "all 0.8s cubic-bezier(0.4, 0.7, 0.2, 1.1), opacity 0.8s",
        zIndex: 9999,
        pointerEvents: "none",
        opacity: 1,
      });
      document.body.appendChild(clone);

      requestAnimationFrame(() => {
        clone.style.transform = `translate3d(
          ${cartRect.left - imgRect.left}px,
          ${cartRect.top - imgRect.top}px,
          0
        ) scale(0.2) rotate(25deg)`;
        clone.style.opacity = 0.1;
      });

      setTimeout(() => {
        clone.remove();

        // Bounce animation on cart icon
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 600);

        addToCart(product._id, 1)
          .then(() => {
            sessionStorage.setItem("cartAnimation", product.name);
          })
          .catch(() => toast.error("Failed to add to cart"));
      }, 850);
    },
    [addToCart, navigate, product]
  );

  return (
    <div style={styles.card}>
      <Link
        to={`/product/${product._id}`}
        style={{ textDecoration: "none", color: "inherit", flex: 1 }}
      >
        <div style={styles.imageWrapper}>
          {/* Lazy-loaded image */}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            style={styles.image}
          />
        </div>
        <h3 style={styles.title}>{product.name}</h3>
        <p style={styles.brand}>{product.brand}</p>
        <p style={styles.price}>
          <span style={{ fontFamily: "sans-serif", marginRight: "2px" }}>₹</span>
          {product.price.toLocaleString("en-IN")}
        </p>
      </Link>

      <button style={styles.button} onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
});

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    height: "420px",
    textAlign: "center",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  imageWrapper: {
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "cover",
    borderRadius: "8px",
  },
  title: {
    fontSize: "16px",
    fontWeight: 600,
    margin: "5px 0",
    height: "40px",
    overflow: "hidden",
  },
  brand: {
    color: "gray",
    fontSize: "14px",
    margin: "3px 0",
  },
  price: {
    color: "green",
    fontWeight: "bold",
    fontSize: "18px",
    margin: "5px 0",
  },
  button: {
    marginTop: "10px",
    padding: "8px 12px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ProductCard;
