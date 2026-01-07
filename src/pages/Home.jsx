import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { productAPI } from "../services/api";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import "../scrollMessage.css";

// Lazy load heavy components
const ProductCard = React.lazy(() => import("../components/products/ProductCard"));
const Loader = React.lazy(() => import("../pages/Loader"));

function Home() {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [filteredProducts, setFilteredProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get("category");

  const userInfo = localStorage.getItem("userInfo");

  // Memoized fetchProducts to prevent re-creation
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    if (!userInfo) setShowBanner(true);
    else setShowBanner(false);

    try {
      const { data } = await productAPI.getAll();

      let filtered = data;
      if (selectedCategory) {
        filtered = data.filter(
          (product) => product.category === selectedCategory
        );
      }

      const grouped = filtered.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
      }, {});

      Object.keys(grouped).forEach((cat) => {
        grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
      });

      setGroupedProducts(grouped);
      setFilteredProducts(grouped);
    } catch (err) {
      console.error("Products fetch error:", err.response?.data || err.message);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
      if (!userInfo) {
        setTimeout(() => setShowBanner(false));
      }
    }
  }, [selectedCategory, userInfo]);

  // Memoized search function
  const handleSearch = useCallback(
    (e) => {
      const query = e.target.value.toLowerCase();
      setSearchQuery(query);

      if (!query.trim()) {
        setFilteredProducts(groupedProducts);
        return;
      }

      const allProducts = Object.values(groupedProducts).flat();

      const matches = allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );

      let finalResults = matches;
      if (matches.length === 0) {
        finalResults = allProducts
          .filter((p) =>
            p.name
              .toLowerCase()
              .split(" ")
              .some(
                (word) => query.includes(word) || word.includes(query.slice(0, 3))
              )
          )
          .slice(0, 8);
      }

      const grouped = finalResults.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
      }, {});

      setFilteredProducts(grouped);
    },
    [groupedProducts]
  );

  useEffect(() => {
    fetchProducts();
    if (userInfo) document.body.style.overflowX = "hidden";
    return () => (document.body.style.overflowX = "auto");
  }, [fetchProducts]);

  // Memoize rendered product groups for performance
  const renderedProducts = useMemo(() => {
    return Object.keys(filteredProducts).map((category) => (
      <div key={category} className="mb-5">
        <h3 className="mb-4 text-capitalize fw-semibold">{category}</h3>
        <div className="row">
          {filteredProducts[category].map((product) => (
            <div key={product._id} className="col-6 col-md-3 mb-4">
              <MemoizedProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    ));
  }, [filteredProducts]);

  return (
    <div className="container mt-4 position-relative">
      {/* Floating Scrolling Banner */}
      {!userInfo && showBanner && (
        <div className="scrolling-banner-container">
          <div className="scrolling-banner text-center fw-semibold">
            <div className="scrolling-text">
              <span>
                Backend is waking up... Please wait a few seconds while we load
                the products. Thank you for your patience. &nbsp;&nbsp;&nbsp;
              </span>
              <span>
                Backend is waking up... Please wait a few seconds while we load
                the products. Thank you for your patience. &nbsp;&nbsp;&nbsp;
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div
        className="d-flex justify-content-center mb-4 position-relative"
        style={{ maxWidth: "350px", margin: "0 auto" }}
      >
        <Search
          size={25}
          className="position-absolute ms-3"
          style={{
            top: "50%",
            left: "0px",
            transform: "translateY(-50%)",
            color: "#6c757d",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          className="form-control ps-5"
          placeholder="Search products, brands or categories..."
          value={searchQuery}
          onChange={handleSearch}
          style={{
            borderRadius: "30px",
            padding: "10px 20px",
            boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
          }}
        />
      </div>

      {/* Loader */}
      {loading && (
        <div className="d-flex justify-content-center align-items-center mt-5">
          <Suspense fallback={<div>Loading...</div>}>
            <Loader />
          </Suspense>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center mt-5 text-danger">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchProducts}>
            Retry
          </button>
        </div>
      )}

      {/* No Products */}
      {!error && !loading && Object.keys(filteredProducts).length === 0 && (
        <p className="text-center mt-5">No products available.</p>
      )}

      {/* Products */}
      {!error && !loading && (
        <Suspense fallback={<div>Loading products...</div>}>
          {renderedProducts}
        </Suspense>
      )}
    </div>
  );
}

// Memoized ProductCard (prevents re-rendering)
const MemoizedProductCard = React.memo(function ProductCardWrapper({ product }) {
  return <ProductCard product={product} />;
});

export default React.memo(Home);
