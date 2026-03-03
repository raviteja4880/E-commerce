import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import { Loader2, Camera, User, Lock, LogOut } from "lucide-react";
import RequireLogin from "../components/RequireLogin";
import "../styles/profile.css";

/* ================= CLOUDINARY UPLOAD ================= */
const uploadToCloudinary = async (file, onProgress) => {
  const { data: sig } = await authAPI.getSignature();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.apiKey);
  formData.append("timestamp", sig.timestamp);
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`
    );

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => resolve(JSON.parse(xhr.responseText));
    xhr.onerror = reject;
    xhr.send(formData);
  });
};

/* ================= IMAGE CROP HELPERS ================= */
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
  });

const getCroppedImage = async (imageSrc, cropPixels) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
    }, "image/jpeg");
  });
};

  const ProfilePage = () => {
  const navigate = useNavigate();   

  const handleLogout = () => {
    // clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");

    // remove axios auth header
    if (authAPI?.defaults?.headers?.common) {
      delete authAPI.defaults.headers.common["Authorization"];
    }

    // notify app
    window.dispatchEvent(new Event("userUpdated"));

    // redirect
    navigate("/login", { replace: true });
  };
  
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  /* Cropper */
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwords, setPasswords] = useState({
    currentPass: "",
    newPass: "",
    confirm: "",
  });

  const getAvatarSrc = () =>
    avatarPreview ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      formData.name || "User"
    )}&background=0d6efd&color=ffffff&size=256`;

    const hasAvatar =
  Boolean(avatarPreview) &&
  !avatarPreview.includes("ui-avatars.com");

  /* FETCH PROFILE */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authAPI.getProfile();
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
        setAvatarPreview(data.avatar || "");
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.token) fetchProfile();
  }, []);

  /* UPDATE PROFILE */
  const updateProfile = async () => {
    setSaving(true);
    let toastId;

    try {
      const payload = {};

      if (activeTab === "edit") {
        payload.name = formData.name;
        payload.phone = formData.phone;
      }

      if (activeTab === "password") {
        if (!passwords.currentPass) {
          toast.error("Please enter your current password");
          return;
        }

        if (!passwords.newPass || !passwords.confirm) {
          toast.error("Please enter and confirm your new password");
          return;
        }

        if (passwords.newPass !== passwords.confirm) {
          toast.error("New password and confirm password do not match");
          return;
        }

        payload.currentPassword = passwords.currentPass;
        payload.password = passwords.newPass;
      }

      if (activeTab === "avatar" && avatarFile) {
        toastId = toast.loading("Uploading avatar...");
        const upload = await uploadToCloudinary(avatarFile, (p) =>
          toast.update(toastId, { render: `Uploading avatar... ${p}%` })
        );
        payload.avatarUrl = upload.secure_url;
        payload.avatarPublicId = upload.public_id;
      }

      const { data } = await authAPI.updateProfile(payload);

      localStorage.setItem(
        "userInfo",
        JSON.stringify({ ...userInfo, ...data.user, token: userInfo.token })
      );

      window.dispatchEvent(new Event("userUpdated"));

      toast.success("Profile updated");
      setActiveTab("profile");
      setPasswords({ currentPass: "", newPass: "", confirm: "" });
    }catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }finally {
      setSaving(false);
      if (toastId) toast.dismiss(toastId);
    }
  };

  if (!userInfo?.token) return <RequireLogin />;

  if (loading)
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <Loader2 className="animate-spin me-2" /> Loading...
      </div>
    );

  return (
    <div className="min-vh-100 py-5" style={{ background: "#eaf6ff" }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="card shadow border-0 rounded-4 position-relative">
          {saving && (
            <div className="save-overlay d-flex justify-content-center align-items-center">
              <Loader2 className="animate-spin" size={36} />
            </div>
          )}
          <div className="card-body p-4 position-relative">
            {/* ================= LOGOUT BUTTON ================= */}
            <div className="logout-btn-wrapper">
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={handleLogout}
              >
                <LogOut size={16} className="me-1" /> Logout
              </button>
            </div>

            {/* ================= FIXED PROFILE HEADER ================= */}
            <div className="profile-header-section">
              <div className="avatar-section">
                <img
                  src={getAvatarSrc()}
                  width={120}
                  height={120}
                  className="rounded-circle shadow"
                />
                <div
                  className="avatar-overlay"
                  onClick={() => setActiveTab("avatar")}
                >
                  <Camera size={20} />
                </div>
              </div>
              <h5 className="user-name">{formData.name}</h5>
              <p className="user-email text-muted">{formData.email}</p>
            </div>

            {/* ================= DIVIDER ================= */}
            <hr className="my-4" />

            {/* ================= TABS ================= */}
            <div className="profile-tabs mb-4">
              <button
                className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <User size={16} className="me-1" /> Profile
              </button>
              <button
                className={`tab-btn ${activeTab === "edit" ? "active" : ""}`}
                onClick={() => setActiveTab("edit")}
              >
                <User size={16} className="me-1" /> Edit
              </button>
              <button
                className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
                onClick={() => setActiveTab("password")}
              >
                <Lock size={16} className="me-1" /> Password
              </button>
              <button
                className={`tab-btn ${activeTab === "avatar" ? "active" : ""}`}
                onClick={() => setActiveTab("avatar")}
              >
                <Camera size={16} className="me-1" /> Avatar
              </button>
            </div>

            {/* ================= TAB CONTENT ================= */}
            {activeTab === "profile" && (
              <div className="profile-info-section">
                <div className="info-row">
                  <label>Name</label>
                  <span>{formData.name}</span>
                </div>
                <div className="info-row">
                  <label>Email</label>
                  <span>{formData.email}</span>
                </div>
                <div className="info-row">
                  <label>Phone</label>
                  <span>{formData.phone || "-"}</span>
                </div>
                <button
                  className="btn btn-primary w-100 mt-4"
                  onClick={() => setActiveTab("edit")}
                >
                  Edit Profile
                </button>
              </div>
            )}

            {activeTab === "edit" && (
              <div className="form-section">
                <input
                  className="form-control mb-3"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  className="form-control mb-4"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            )}

            {activeTab === "password" && (
              <div className="form-section">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Current Password"
                  value={passwords.currentPass}
                  onChange={(e) =>
                    setPasswords({ ...passwords, currentPass: e.target.value })
                  }
                />

                <input
                  type="password"
                  className="form-control"
                  placeholder="New Password"
                  value={passwords.newPass}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPass: e.target.value })
                  }
                />

                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm New Password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                />
              </div>
            )}

            {activeTab === "avatar" && (
              <div className="form-section text-center">
                <button
                  className="btn btn-primary w-100 mb-3"
                  onClick={() => document.getElementById("avatarInput").click()}
                >
                  <Camera size={18} className="me-2" /> Change Avatar
                </button>

                {hasAvatar && (
                  <button
                    className="btn btn-outline-danger w-100"
                    onClick={async () => {
                      try {
                        setSaving(true);

                        await authAPI.updateProfile({
                          avatarUrl: null,
                          avatarPublicId: null,
                        });

                        setAvatarPreview("");
                        setAvatarFile(null);

                        toast.success("Avatar removed");
                        setActiveTab("profile");
                      } catch (err) {
                        toast.error(
                          err?.response?.data?.message || "Failed to remove avatar"
                        );
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    Remove Avatar
                  </button>
                )}
              </div>
            )}

            {activeTab !== "profile" && (
              <button
                className="btn btn-primary w-100 mt-4"
                onClick={updateProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILE INPUT */}
      <input
        id="avatarInput"
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          setAvatarPreview(URL.createObjectURL(file));
          setAvatarFile(file);
          setShowCropModal(true);
        }}
      />

      {/* CROP MODAL */}
      {showCropModal &&
  ReactDOM.createPortal(
    <div className="modal-backdrop-custom">
      <div className="crop-modal">
        <div className="cropper-container">
          <Cropper
            image={avatarPreview}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, p) => setCroppedAreaPixels(p)}
          />
        </div>

        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(e.target.value)}
        />

        <div className="crop-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setShowCropModal(false)}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={async () => {
              const croppedFile = await getCroppedImage(
                avatarPreview,
                croppedAreaPixels
              );

              setAvatarFile(croppedFile);
              setAvatarPreview(URL.createObjectURL(croppedFile));
              setShowCropModal(false);
              setActiveTab("avatar");
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}
    </div>
  );
};

export default ProfilePage;
