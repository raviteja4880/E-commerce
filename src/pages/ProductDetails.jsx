import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI, recommendationAPI  } from "../services/api";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

// Lazy-load heavy components
const ProductCard = React.lazy(() => import("../components/products/ProductCard"));
const Loader = React.lazy(() => import("./Loader"));

// Rupee formatter (memoized)
const Rupee = React.memo(({ value, size = "1.1rem", bold = false, color = "#28a745" }) => (
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
));

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product and recommendations (memoized)
  const fetchProductAndOthers = useCallback(async () => {
    try {
      const { data: mainProduct } = await productAPI.getById(id);
      setProduct(mainProduct);

      // CALL ML RECOMMENDATION API
      const { data: recommended } =
        await recommendationAPI.getByProduct(mainProduct.externalId);

      if (recommended && recommended.length > 0) {
        setOtherProducts(recommended);
      } else {
        // Fallback (your old logic)
        const { data: allProducts } = await productAPI.getAll();
        const remaining = allProducts.filter((p) => p._id !== id);
        setOtherProducts(remaining);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError("Failed to load product.");
      console.error("Product fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductAndOthers();
  }, [fetchProductAndOthers]);

  const handleQtyChange = useCallback((val) => {
    if (val < 1) return;
    setQty(val);
  }, []);

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

      const productImage = document.getElementById("product-main-image");
      const cartIcon = document.getElementById("cart-icon");

      if (!cartIcon || !productImage) {
        await addToCart(product._id, qty);
        toast.success(`${product.name} added to cart`);
        return;
      }

      // Fly-to-cart animation
      const clone = productImage.cloneNode(true);
      const imgRect = productImage.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      Object.assign(clone.style, {
        position: "fixed",
        left: imgRect.left + "px",
        top: imgRect.top + "px",
        width: imgRect.width + "px",
        height: imgRect.height + "px",
        borderRadius: "10px",
        transition: "all 0.9s cubic-bezier(0.4, 0.7, 0.2, 1.1), opacity 0.9s",
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
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 600);

        addToCart(product._id, qty)
          .then(() => {
            sessionStorage.setItem("cartAnimation", product.name);
            navigate("/cart");
          })
          .catch(() => toast.error("Failed to add to cart"));
      }, 850);
    },
    [addToCart, navigate, product, qty]
  );

  const handleRecommendedClick = useCallback(
    (pid) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => navigate(`/product/${pid}`), 300);
    },
    [navigate]
  );

  const recommendedList = useMemo(
    () =>
      otherProducts.map((p) => (
        <div
          key={p._id}
          className="col-6 col-md-3 mb-4"
          style={{ cursor: "pointer" }}
          onClick={() => handleRecommendedClick(p._id)}
        >
          <Suspense fallback={<div>Loading...</div>}>
            <ProductCard product={p} />
          </Suspense>
        </div>
      )),
    [otherProducts, handleRecommendedClick]
  );

  if (loading)
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <Loader />
      </Suspense>
    );

  if (error)
    return <p className="text-center mt-5 text-danger fw-semibold">{error}</p>;

  if (!product)
    return <p className="text-center mt-5 text-muted">Product not found.</p>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        className="container mt-4 mb-5"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Main Product Section */}
        <div className="row align-items-start mb-5">
          <motion.div
            className="col-md-6 mb-3 mb-md-0 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
          <div
            style={{
              height: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              border: "1px solid #eee",
              marginBottom: "20px",
            }}
          >
            <img
              id="product-main-image"
              src={product.image}
              alt={product.name}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "cover", 
                borderRadius: "8px",
              }}
            />
          </div>
          </motion.div>

          <motion.div
            className="col-md-6"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="fw-bold mb-2">{product.name}</h2>
            <p className="text-muted mb-3">{product.brand}</p>

            <h4 className="text-success mb-3">
              <Rupee value={product.price} bold size="1.4rem" />
            </h4>

            <p className="mb-4">{product.description}</p>

            <div className="d-flex align-items-center mb-4">
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => handleQtyChange(qty - 1)}
                disabled={qty <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={qty}
                min="1"
                className="form-control text-center"
                style={{ width: "70px" }}
                onChange={(e) => handleQtyChange(Number(e.target.value))}
              />
              <button
                className="btn btn-outline-secondary ms-2"
                onClick={() => handleQtyChange(qty + 1)}
              >
                +
              </button>
            </div>

            <motion.button
              className="btn btn-primary fw-semibold px-4 py-2"
              onClick={handleAddToCart}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Add to Cart
            </motion.button>
          </motion.div>
        </div>

        {/* Recommended Products */}
        {otherProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="fw-bold mb-4 text-primary">
              Other Products You May Like
            </h3>
            <div className="row">{recommendedList}</div>
          </motion.div>
        )}

        {/* Bounce Animation */}
        <style>{`
          .cart-bounce {
            animation: cartBounce 0.5s ease;
          }
          @keyframes cartBounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}

export default React.memo(ProductDetails);
