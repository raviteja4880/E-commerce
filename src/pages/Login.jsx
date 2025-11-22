import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { Truck, ShieldCheck, Gift, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import "../AuthLanding.css";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setError("");
    setIsLogin(!isLogin);
    setFormData({ name: "", email: "", password: "", phone: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem("userInfo", JSON.stringify(data.user || data));
        localStorage.setItem("token", data.token);
        navigate("/");
      } else {
        await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: "user",
        });
        toast.success("Registration successful! Please login to continue.");
        setTimeout(() => setIsLogin(true), 600);
      }
    } catch (err) {
      // Log full error for debugging and show a more detailed message if available
      console.error("Auth error:", err);
      const message =
        err?.response?.data?.message || err?.message || "Something went wrong!";
      setError(message);
      try {
        toast.error(typeof message === "string" ? message : JSON.stringify(message));
      } catch (e) {
        // ignore toast errors
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-landing">
      {/* ===== Hero Section ===== */}
      <motion.section
        className="hero-section text-center text-light"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <ShoppingBag size={48} className="mb-3" />
        <h1 className="display-5 fw-bold mb-2">MyStore</h1>
        <p className="fs-5 mb-4 text-light opacity-75">
          Your one-stop destination for quality and convenience.
        </p>
      </motion.section>

      {/* ===== Auth Card ===== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "register"}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="auth-card card shadow-lg border-0 p-4 mx-auto"
        >
          <h2 className="text-center fw-bold mb-3">
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </h2>
          <p className="text-muted text-center mb-4">
            {isLogin
              ? "Login to access your account and start shopping."
              : "Join us and enjoy exclusive offers and fast delivery."}
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter your phone number"
                    pattern="[0-9]{10}"
                    title="Enter a valid 10-digit phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading
                ? isLogin
                  ? "Logging in..."
                  : "Creating account..."
                : isLogin
                ? "Login"
                : "Register"}
            </button>
          </form>

          <div className="text-center mt-3">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button className="btn btn-link p-0" onClick={toggleMode}>
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button className="btn btn-link p-0" onClick={toggleMode}>
                  Login
                </button>
              </>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ===== Info Section ===== */}
      <section className="info-section text-center mt-5 px-3">
        <h3 className="fw-bold mb-4">Why Choose MyStore</h3>
        <div className="row justify-content-center">
          <div className="col-md-3 col-10 mb-4">
            <div className="info-card p-4 shadow-sm rounded-4">
              <Truck size={36} className="text-primary mb-3" />
              <h5 className="fw-semibold">Fast Delivery</h5>
              <p className="text-muted small">
                Get your orders delivered quickly with real-time tracking.
              </p>
            </div>
          </div>
          <div className="col-md-3 col-10 mb-4">
            <div className="info-card p-4 shadow-sm rounded-4">
              <ShieldCheck size={36} className="text-success mb-3" />
              <h5 className="fw-semibold">Secure Payments</h5>
              <p className="text-muted small">
                Multiple payment options with advanced encryption.
              </p>
            </div>
          </div>
          <div className="col-md-3 col-10 mb-4">
            <div className="info-card p-4 shadow-sm rounded-4">
              <Gift size={36} className="text-warning mb-3" />
              <h5 className="fw-semibold">Exclusive Offers</h5>
              <p className="text-muted small">
                Unlock member-only discounts and seasonal deals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="text-center mt-5 mb-3 text-light opacity-75">
        © {new Date().getFullYear()} MyStore | All Rights Reserved.
      </footer>
    </div>
  );
}

export default Login;
