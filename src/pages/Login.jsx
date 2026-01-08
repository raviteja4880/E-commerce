import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import "../styles/AuthLanding.css";

const OTP_DURATION = 120; // 2 minutes

export default function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    otp: "",
    newPassword: "",
  });

  /* ================= OTP TIMER ================= */
  useEffect(() => {
    if (otpTimer <= 0) return;

    const interval = setInterval(() => {
      setOtpTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    if (mode === "otp" || mode === "reset") {
      setOtpTimer(OTP_DURATION);
    }
  }, [mode]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* ---------- LOGIN ---------- */
      if (mode === "login") {
        const { data } = await authAPI.login({
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("userInfo", JSON.stringify(data));
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("userUpdated"));

        toast.success("Welcome back!");
        navigate("/");
      }

      /* ---------- REGISTER ---------- */
      if (mode === "register") {
        await authAPI.register({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
        });

        toast.success("OTP sent to your email");
        setMode("otp");
      }

      /* ---------- VERIFY OTP ---------- */
      if (mode === "otp") {
        await authAPI.verifyOtp({
          email: form.email,
          otp: form.otp,
        });

        toast.success("Email verified. Please login.");

        setForm({
          name: "",
          email: form.email,
          password: "",
          phone: "",
          otp: "",
          newPassword: "",
        });

        setMode("login");
      }

      /* ---------- FORGOT PASSWORD ---------- */
      if (mode === "forgot") {
        await authAPI.forgotPassword(form.email);
        toast.success("Reset OTP sent to your email");
        setMode("reset");
      }

      /* ---------- RESET PASSWORD ---------- */
      if (mode === "reset") {
        await authAPI.resetPassword({
          email: form.email,
          otp: form.otp,
          newPassword: form.newPassword,
        });

        toast.success("Password reset successful");
        setMode("login");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESEND OTP ================= */
  const handleResendOtp = async () => {
    if (!form.email || otpTimer > 0) return;

    const purpose = mode === "otp" ? "register" : "reset_password";

    try {
      setLoading(true);
      await authAPI.resendOtp({ email: form.email, purpose });
      toast.success("OTP resent");
      setOtpTimer(OTP_DURATION);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="auth-title">
          {mode === "login"
            ? "Welcome Back"
            : mode === "register"
            ? "Create Account"
            : mode === "otp"
            ? "Verify Email"
            : mode === "forgot"
            ? "Forgot Password"
            : "Reset Password"}
        </h2>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <input
                placeholder="Full Name"
                required
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
              <input
                placeholder="Phone Number"
                required
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
              />
            </>
          )}

          {(mode === "login" ||
            mode === "register" ||
            mode === "forgot" ||
            mode === "reset") && (
            <input
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          )}

          {(mode === "login" || mode === "register") && (
            <input
              type="password"
              placeholder="Password"
              required
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          )}

          {(mode === "otp" || mode === "reset") && (
            <input
              placeholder="Enter OTP"
              required
              onChange={(e) =>
                setForm({ ...form, otp: e.target.value })
              }
            />
          )}

          {mode === "reset" && (
            <input
              type="password"
              placeholder="New Password"
              required
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
            />
          )}

          <button disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : mode === "register"
              ? "Register"
              : mode === "otp"
              ? "Verify OTP"
              : mode === "forgot"
              ? "Send OTP"
              : "Reset Password"}
          </button>
        </form>

        {(mode === "otp" || mode === "reset") && (
          <p className="toggle-text">
            OTP expires in <strong>{formatTime(otpTimer)}</strong>
            {" · "}
            {otpTimer > 0 ? (
              <span style={{ opacity: 0.5 }}>Resend</span>
            ) : (
              <span
                onClick={handleResendOtp}
                style={{ cursor: "pointer" }}
              >
                Resend
              </span>
            )}
          </p>
        )}

        {mode === "login" && (
          <p className="toggle-text">
            <span onClick={() => setMode("forgot")}>
              Forgot password?
            </span>
          </p>
        )}

        {(mode === "login" || mode === "register") && (
          <p className="toggle-text">
            {mode === "login" ? (
              <>
                New here?{" "}
                <span onClick={() => setMode("register")}>
                  Create account
                </span>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <span onClick={() => setMode("login")}>
                  Login
                </span>
              </>
            )}
          </p>
        )}
      </motion.div>
    </div>
  );
}
