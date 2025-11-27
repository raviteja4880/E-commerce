import React, { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import { Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RequireLogin from "../components/RequireLogin"; // ✅ added

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const userInfo = JSON.parse(localStorage.getItem("userInfo")); // ✅ check login

  // ================= FETCH PROFILE =================
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo?.token) {
        setLoading(false);
        return; // ✅ skip fetch if not logged in
      }

      try {
        const { data } = await authAPI.getProfile();
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          password: "",
        });
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ================= UPDATE PROFILE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile({
        name: formData.name,
        phone: formData.phone,
        password: formData.password || undefined,
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      localStorage.setItem("token", data.token);

      toast.success("Profile updated successfully!");
      setFormData((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(
        err.response?.data?.message || "Failed to update profile. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= LOGOUT (Mobile only) =================
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    toast.info("Logged out successfully.");
    navigate("/login");
  };

  // ✅ Show RequireLogin if user not logged in
  if (!userInfo?.token) {
    return (
      <RequireLogin>
        <div className="text-center mt-5">
          <p className="text-muted fs-5">
            Please log in to view and edit your profile.
          </p>
        </div>
      </RequireLogin>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-secondary">
        <Loader2 className="me-2 animate-spin" size={24} />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <h3 className="mb-3 fw-semibold text-center text-primary">
            Edit Profile
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-3">
              <label className="form-label fw-medium">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div className="mb-3">
              <label className="form-label fw-medium">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                disabled
                readOnly
              />
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="form-label fw-medium">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter your 10-digit mobile number"
                required
                pattern="[6-9][0-9]{9}"
                title="Enter a valid 10-digit number starting with 6–9"
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="form-label fw-medium">
                New Password (optional)
              </label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter new password (leave blank to keep current)"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 mb-3"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="me-2 animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>

          {/* Logout Button - visible only on mobile */}
          <button
            className="btn btn-danger w-100 d-md-none d-block d-flex align-items-center justify-content-center gap-2 mt-2"
            onClick={handleLogout}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
