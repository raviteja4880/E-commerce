import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { productAPI, recommendationAPI } from "../services/api";
import { useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import "../scrollMessage.css";
import SkeletonProductCard from "../components/SkeletonProductCard";

const ProductCard = React.lazy(() =>
  import("../components/products/ProductCard")
);
const Loader = React.lazy(() => import("../pages/Loader"));

// ================= HASH & SEED FUNCTIONS =================
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function mulberry32(a) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function seededShuffle(array, seed) {
  let result = [...array];
  let rand = mulberry32(hashCode(seed));

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function Home() {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [filteredProducts, setFilteredProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  const [homeRecommendations, setHomeRecommendations] = useState([]);
  const [loadingHomeRecs, setLoadingHomeRecs] = useState(false);
  const [recsInitialized, setRecsInitialized] = useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get("category");
  const isCategorySelected = Boolean(selectedCategory);

  const userInfo = localStorage.getItem("userInfo");

  // ================= FETCH PRODUCTS =================
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

      const userSeed = getStableUserKey();

      const grouped = filtered.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
      }, {});

      Object.keys(grouped).forEach((cat) => {
        let items = grouped[cat];

        // Shuffle uniquely per user
        items = seededShuffle(items, userSeed + cat);

        // ALWAYS limit to 2 rows
        grouped[cat] = items.slice(0, 8);
      });

      setGroupedProducts(grouped);
      setFilteredProducts(grouped);
    } catch (err) {
      console.error("Products fetch error:", err.response?.data || err.message);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
      if (!userInfo) setTimeout(() => setShowBanner(false));
    }
  }, [selectedCategory, userInfo]);

  function getStableUserKey() {
  const userInfo = localStorage.getItem("userInfo");

  if (userInfo) {
    try {
      const user = JSON.parse(userInfo);
      return (
        user._id ||
        user.userId ||
        user.email ||
        `token-${user.token?.slice(0, 10)}`
      );
    } catch {
      return "guest";
    }
  }

  let guestId = localStorage.getItem("guestId");
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guestId", guestId);
  }
  return guestId;
}
  // ================= SCROLL POSITION =================
  useEffect(() => {
    if (loading) return; 

    const savedScroll = sessionStorage.getItem("homeScroll");

    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo({
          top: Number(savedScroll),
          behavior: "instant",
        });
      }, 50);
    }
  }, [loading]);

  // ================= HOME RECOMMENDATIONS =================
  useEffect(() => {
    if (recsInitialized) return;

    let cancelled = false;

    const fetchRecommendations = async () => {
  setLoadingHomeRecs(true);

  try {
    const userKey = getStableUserKey();

    // Try cart-based ML first
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const cartExternalIds = cart
      .map((item) => item.product?.externalId)
      .filter(Boolean);

    if (cartExternalIds.length > 0) {
      const res = await recommendationAPI.getByCart(cartExternalIds);
      if (!cancelled && res.data?.length) {
        setHomeRecommendations(res.data);
        return;
      }
    }

    // Fallback → HOME recommendations (Node + ML)
    const res = await recommendationAPI.getHome(userKey);
    if (!cancelled) {
      setHomeRecommendations(res.data || []);
    }
  } catch (err) {
    console.error("Home recommendation error:", err.message);
  } finally {
    if (!cancelled) {
      setLoadingHomeRecs(false);
      setRecsInitialized(true);
    }
  }
};

    fetchRecommendations();
    return () => (cancelled = true);
  }, [recsInitialized]);

  // ================= SEARCH =================
  const handleSearch = useCallback(
    (e) => {
      const query = e.target.value.toLowerCase();
      setSearchQuery(query);

      // Reset when empty search
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

      // Store flat list instead of grouped
      setFilteredProducts({ __searchResults: matches });
    },
    [groupedProducts]
  );

  useEffect(() => {
    fetchProducts();
    if (userInfo) document.body.style.overflowX = "hidden";
    return () => (document.body.style.overflowX = "auto");
  }, [fetchProducts]);

  // ================= MEMOIZED GROUPS =================
  const renderedProducts = useMemo(() => {
    if (filteredProducts.__searchResults) {
      return (
        <div className="mb-5">
          <h4 className="mb-3 fw-semibold">
            Search Results ({filteredProducts.__searchResults.length})
          </h4>

          <div className="row">
            {filteredProducts.__searchResults.map((product) => (
              <div key={product._id} className="col-6 col-md-3 mb-4">
                <MemoizedProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // NORMAL MODE → grouped by category
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

  const isSearching = searchQuery.trim().length > 0;
    useEffect(() => {
  if (isSearching || isCategorySelected) {
    setHomeRecommendations([]);
  }
}, [isSearching, isCategorySelected]);
  return (
    <div className="container mt-4 position-relative">

      {/* ================= SEARCH BAR (NOW AT TOP) ================= */}
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

     {/* ================= RECOMMENDATIONS ================= */}
      {!isSearching &&
        !isCategorySelected &&
        (loadingHomeRecs || homeRecommendations.length > 0) && (
          <div className="mb-5">
            <h3 className="mb-4 fw-bold text-primary">
              Recommended for You
            </h3>

            <div className="row">
              {loadingHomeRecs
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="col-6 col-md-3 mb-4">
                      <SkeletonProductCard />
                    </div>
                  ))
                : homeRecommendations.map((product) => (
                    <div key={product._id} className="col-6 col-md-3 mb-4">
                      <MemoizedProductCard product={product} />
                    </div>
                  ))}
            </div>
          </div>
      )}

      {/* ================= EXISTING UI ================= */}
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

      {loading && (
        <div className="d-flex justify-content-center align-items-center mt-5">
          <Suspense fallback={<div>Loading...</div>}>
            <Loader />
          </Suspense>
        </div>
      )}

      {!error && !loading && (
        <Suspense fallback={<div>Loading products...</div>}>
          {renderedProducts}
        </Suspense>
      )}
    </div>
  );
}

// ================= MEMOIZED CARD =================
const MemoizedProductCard = React.memo(function ProductCardWrapper({ product }) {
  return <ProductCard product={product} />;
});

export default React.memo(Home);
