import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import { Loader2, LogOut, Settings, Camera, User, Lock } from "lucide-react";
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

    toast.info("Logged out successfully");
  };
  
  const dropdownRef = useRef(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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

  /* CLOSE DROPDOWN */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
        <div className="card shadow border-0 rounded-4">
          <div className="card-body p-4">

            {/* ================= HEADER ================= */}
            <div className="d-flex justify-content-between mb-3">
              <h4 className="text-primary">My Profile</h4>

              <div ref={dropdownRef}>
                <button
                  className="btn btn-light rounded-circle"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <Settings size={20} />
                </button>

                {showDropdown && (
                  <div className="dropdown-menu show end-0 mt-2 shadow rounded-4">
                    <button className="dropdown-item" onClick={() => setActiveTab("edit")}>
                      <User size={16} /> Edit Profile
                    </button>
                    <button className="dropdown-item" onClick={() => setActiveTab("avatar")}>
                      <Camera size={16} /> Change Avatar
                    </button>
                    <button className="dropdown-item" onClick={() => setActiveTab("password")}>
                      <Lock size={16} /> Change Password
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ================= FIXED PROFILE HEADER ================= */}
            <div className="text-center mb-4">
              <img
                src={getAvatarSrc()}
                width={120}
                height={120}
                className="rounded-circle shadow"
              />
              <h5 className="mt-3">{formData.name}</h5>
              <p className="text-muted">{formData.email}</p>
            </div>

            {/* ================= TAB CONTENT ================= */}
            {activeTab === "edit" && (
              <>
                <input
                  className="form-control mb-3"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
                <input
                  className="form-control"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </>
            )}

            {activeTab === "password" && (
              <>
                <input
                  type="password"
                  className="form-control mb-3"
                  placeholder="Current Password"
                  value={passwords.currentPass}
                  onChange={(e) =>
                    setPasswords({ ...passwords, currentPass: e.target.value })
                  }
                />

                <input
                  type="password"
                  className="form-control mb-3"
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
              </>
            )}

            {activeTab === "avatar" && (
              <div className="text-center">
                <button
                  className="btn btn-outline-primary mb-2"
                  onClick={() => document.getElementById("avatarInput").click()}
                >
                  Change Avatar
                </button>

                {hasAvatar && (
                  <button
                    className="btn btn-outline-danger d-block mx-auto"
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
