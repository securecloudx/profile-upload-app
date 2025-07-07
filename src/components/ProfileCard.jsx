import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import defaultAvatar from "../assets/default-avatar.jpg";

export default function ProfileCard() {
  // Helper functions for localStorage
  const loadFromStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error saving ${key} to localStorage:`, error);
    }
  };

  // Initialize state with localStorage values
  const [name, setName] = useState(() =>
    loadFromStorage("profileName", "Jane Doe")
  );
  const [bio, setBio] = useState(() =>
    loadFromStorage("profileBio", "Cloud Security learner on SecureCloudX")
  );
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(() =>
    loadFromStorage("profilePreview", defaultAvatar)
  );
  const [uploadUrl, setUploadUrl] = useState(() =>
    loadFromStorage("profileUploadUrl", "")
  );
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadStartTime, setUploadStartTime] = useState(null);
  const [uploadDuration, setUploadDuration] = useState(null);
  const [originalSize, setOriginalSize] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [darkTheme, setDarkTheme] = useState(() =>
    loadFromStorage("profileDarkTheme", true)
  );
  const [compressionEnabled, setCompressionEnabled] = useState(() =>
    loadFromStorage("profileCompressionEnabled", true)
  );
  const [isDragOver, setIsDragOver] = useState(false);

  // Save to localStorage whenever important state changes
  useEffect(() => {
    saveToStorage("profileName", name);
  }, [name]);

  useEffect(() => {
    saveToStorage("profileBio", bio);
  }, [bio]);

  useEffect(() => {
    saveToStorage("profilePreview", preview);
  }, [preview]);

  useEffect(() => {
    saveToStorage("profileUploadUrl", uploadUrl);
  }, [uploadUrl]);

  useEffect(() => {
    saveToStorage("profileDarkTheme", darkTheme);
  }, [darkTheme]);

  useEffect(() => {
    saveToStorage("profileCompressionEnabled", compressionEnabled);
  }, [compressionEnabled]);

  // Save upload stats to localStorage
  useEffect(() => {
    if (uploadDuration) {
      saveToStorage("profileUploadDuration", uploadDuration);
    }
  }, [uploadDuration]);

  useEffect(() => {
    if (originalSize) {
      saveToStorage("profileOriginalSize", originalSize);
    }
  }, [originalSize]);

  useEffect(() => {
    if (compressedSize) {
      saveToStorage("profileCompressedSize", compressedSize);
    }
  }, [compressedSize]);

  // Load upload stats on component mount
  useEffect(() => {
    const savedUploadDuration = loadFromStorage("profileUploadDuration", null);
    const savedOriginalSize = loadFromStorage("profileOriginalSize", null);
    const savedCompressedSize = loadFromStorage("profileCompressedSize", null);
    const savedSuccessMessage = loadFromStorage("profileSuccessMessage", null);

    if (savedUploadDuration) setUploadDuration(savedUploadDuration);
    if (savedOriginalSize) setOriginalSize(savedOriginalSize);
    if (savedCompressedSize) setCompressedSize(savedCompressedSize);

    // Show success message if it was saved recently (within last 5 minutes)
    if (savedSuccessMessage && savedSuccessMessage.timestamp) {
      const now = Date.now();
      const messageAge = now - savedSuccessMessage.timestamp;
      const fiveMinutes = 5 * 60 * 1000;

      if (messageAge < fiveMinutes) {
        setErrors({ success: savedSuccessMessage.message });
      } else {
        // Remove old success message
        localStorage.removeItem("profileSuccessMessage");
      }
    }
  }, []);

  // Function to clear all profile data
  const clearProfileData = () => {
    const keys = [
      "profileName",
      "profileBio",
      "profilePreview",
      "profileUploadUrl",
      "profileDarkTheme",
      "profileCompressionEnabled",
      "profileUploadDuration",
      "profileOriginalSize",
      "profileCompressedSize",
      "profileSuccessMessage",
    ];
    keys.forEach((key) => localStorage.removeItem(key));

    // Reset to defaults
    setName("Jane Doe");
    setBio("Cloud Security learner on SecureCloudX");
    setPreview(defaultAvatar);
    setUploadUrl("");
    setUploadDuration(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setErrors({});
  };

  // Helper function to clear success messages
  const clearSuccessMessage = () => {
    setErrors((prev) => ({ ...prev, success: null }));
    localStorage.removeItem("profileSuccessMessage");
  };

  const processImageFile = async (file) => {
    if (!file) return;

    // Clear any existing success messages when user uploads a new image
    clearSuccessMessage();

    // Clear the old uploadUrl when selecting a new image
    setUploadUrl("");

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrors({ image: "Only JPEG or PNG images are allowed." });
      setOriginalSize(null);
      setCompressedSize(null);
      return;
    }

    const maxSizeMB = 2;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrors({ image: "Image is too large. Max size is 2MB." });
      setOriginalSize(null);
      setCompressedSize(null);
      return;
    }

    try {
      // Set the original file size
      setOriginalSize((file.size / 1024).toFixed(1)); // in KB

      // Show immediate preview with original file
      setPreview(URL.createObjectURL(file));

      let finalFile = file;

      if (compressionEnabled) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 600,
          useWebWorker: true,
        };
        finalFile = await imageCompression(file, options);
        // Update preview with compressed file
        setPreview(URL.createObjectURL(finalFile));
      }

      setImage(finalFile);
      setCompressedSize((finalFile.size / 1024).toFixed(1)); // in KB

      setErrors((prev) => ({ ...prev, image: null }));
    } catch (err) {
      console.error("Image processing failed:", err);
      setErrors({
        image: compressionEnabled
          ? "Image compression failed."
          : "Image processing failed.",
      });
      setOriginalSize(null);
      setCompressedSize(null);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    await processImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (editing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if we're leaving the container, not moving between child elements
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (!editing) return; // Only allow drops when editing

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processImageFile(files[0]); // Only use the first file
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let validationErrors = {};
    if (!name.trim()) validationErrors.name = "Name is required.";
    if (!image && !uploadUrl)
      validationErrors.image = "Please upload an image.";
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setUploadDuration(null);
    setUploadStartTime(Date.now());

    setProgress(0);

    let finalImageUrl = uploadUrl;

    if (image) {
      const sasContainerUrl =
        "https://scxsa0425.blob.core.windows.net/profile-upload?sp=cw&st=2025-07-07T15:43:24Z&se=2025-07-07T23:43:24Z&spr=https&sv=2024-11-04&sr=c&sig=8oRo5gYLrcmRD8bvFXhoGcon2pImnTSXDb%2FCNQ%2BuSbI%3D";

      const blobName = `${Date.now()}-${image.name}`.replace(/\s+/g, "-");
      const containerUrl = new URL(sasContainerUrl);
      containerUrl.pathname += `/${blobName}`;
      const uploadUrlWithBlob = containerUrl.toString();

      try {
        await uploadWithProgress(uploadUrlWithBlob, image);
        finalImageUrl = uploadUrlWithBlob.split("?")[0];
        setUploadUrl(finalImageUrl);
        setErrors({});
      } catch (err) {
        console.error("Upload error:", err);
        setErrors({ submit: "Upload failed. Please try again." });
        setLoading(false);
        return;
      }
    }

    setEditing(false);
    setLoading(false);
    const successMessage = "Profile saved successfully!";
    setErrors({ success: successMessage });

    // Save success message with timestamp to localStorage
    saveToStorage("profileSuccessMessage", {
      message: successMessage,
      timestamp: Date.now(),
    });
  };

  const uploadWithProgress = (url, file) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("x-ms-blob-type", "BlockBlob");
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 201 || xhr.status === 200) {
          const endTime = Date.now();
          const duration = ((endTime - uploadStartTime) / 1000).toFixed(1);
          setUploadDuration(duration);
          resolve();
        } else {
          reject(new Error("Upload failed with status " + xhr.status));
        }
      };

      xhr.onerror = () => reject(new Error("Upload error"));
      xhr.send(file);
    });
  };

  return (
    <div
      className={`flex-1 flex items-center justify-center p-4 transition-colors duration-300 ${
        darkTheme ? "bg-gray-950" : "bg-gray-50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className={`rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transition-all duration-300 ${
          darkTheme
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        {/* Settings Panel */}
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-lg font-semibold ${
              darkTheme ? "text-white" : "text-gray-900"
            }`}
          >
            Profile Settings
          </h2>
          <div className="flex gap-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkTheme(!darkTheme)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkTheme
                  ? "bg-gray-800 hover:bg-gray-700 text-yellow-400"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
              title={
                darkTheme ? "Switch to Light Theme" : "Switch to Dark Theme"
              }
            >
              {darkTheme ? "☀️" : "🌙"}
            </button>

            {/* Compression Toggle */}
            <button
              onClick={() => setCompressionEnabled(!compressionEnabled)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                compressionEnabled
                  ? darkTheme
                    ? "bg-green-800 hover:bg-green-700 text-green-300"
                    : "bg-green-100 hover:bg-green-200 text-green-600"
                  : darkTheme
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-400"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-500"
              }`}
              title={
                compressionEnabled ? "Compression: ON" : "Compression: OFF"
              }
            >
              📦
            </button>

            {/* Reset Profile Button */}
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to reset all profile data? This action cannot be undone."
                  )
                ) {
                  clearProfileData();
                }
              }}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                darkTheme
                  ? "bg-red-800 hover:bg-red-700 text-red-300"
                  : "bg-red-100 hover:bg-red-200 text-red-600"
              }`}
              title="Reset Profile Data"
            >
              🗑️
            </button>
          </div>
        </div>
        {errors.success && (
          <div
            className={`text-sm text-center mb-4 rounded-lg py-3 px-3 ${
              darkTheme
                ? "text-green-400 bg-green-900/20 border border-green-800"
                : "text-green-700 bg-green-50 border border-green-200"
            }`}
          >
            <p className="font-medium">{errors.success}</p>
            {uploadDuration && (
              <div
                className={`mt-2 text-xs ${
                  darkTheme ? "text-green-300" : "text-green-600"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>⏱️ Upload: {uploadDuration}s</span>
                </div>
                {originalSize && compressedSize && (
                  <div className="mt-1 space-y-1">
                    {compressionEnabled && originalSize !== compressedSize ? (
                      <>
                        <div className="flex justify-between">
                          <span>📄 Original:</span>
                          <span>{originalSize} KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>📦 Compressed:</span>
                          <span>{compressedSize} KB</span>
                        </div>
                        <div className="flex justify-between font-medium">
                          <span>💾 Saved:</span>
                          <span>
                            {(originalSize - compressedSize).toFixed(1)} KB (
                            {Math.round(
                              ((originalSize - compressedSize) / originalSize) *
                                100
                            )}
                            %)
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between">
                        <span>📁 File size:</span>
                        <span>
                          {compressedSize} KB{" "}
                          {!compressionEnabled && "(uncompressed)"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div
          className={`relative inline-block transition-all duration-300 ${
            editing ? "cursor-pointer" : ""
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={`relative ${
              editing && isDragOver
                ? `ring-4 ring-offset-2 rounded-full ${
                    darkTheme
                      ? "ring-blue-400 ring-offset-gray-900"
                      : "ring-blue-500 ring-offset-white"
                  }`
                : ""
            }`}
          >
            <img
              src={uploadUrl || preview}
              alt="Profile"
              className={`w-32 h-32 rounded-full object-cover border-4 mx-auto transition-all duration-300 ${
                darkTheme ? "border-gray-700" : "border-gray-300"
              } ${editing && isDragOver ? "scale-105 opacity-80" : ""}`}
            />

            {/* Drag Overlay */}
            {editing && isDragOver && (
              <div
                className={`absolute inset-0 rounded-full flex items-center justify-center ${
                  darkTheme ? "bg-gray-900/80" : "bg-white/80"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">📁</div>
                  <div
                    className={`text-xs font-medium ${
                      darkTheme ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    Drop image
                  </div>
                </div>
              </div>
            )}

            {/* Edit Pencil Icon */}
            {editing && !isDragOver && (
              <label className="absolute bottom-2 right-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    darkTheme
                      ? "bg-blue-600 hover:bg-blue-700 border-2 border-gray-900"
                      : "bg-blue-500 hover:bg-blue-600 border-2 border-white"
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </div>
              </label>
            )}
          </div>

          {editing && (
            <>
              {/* Drag and Drop Help Text */}
              <p
                className={`text-xs mt-2 ${
                  darkTheme ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {isDragOver
                  ? "Drop to upload"
                  : "Click pencil or drag image here"}
              </p>

              {errors.image && (
                <p
                  className={`text-xs mt-1 ${
                    darkTheme ? "text-red-400" : "text-red-600"
                  }`}
                >
                  {errors.image}
                </p>
              )}
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <input
              className={`w-full p-2 rounded border transition-colors duration-200 ${
                errors.name
                  ? "border-red-500"
                  : darkTheme
                  ? "bg-gray-800 border-gray-700 placeholder-gray-400"
                  : "bg-gray-50 border-gray-300 placeholder-gray-500"
              }`}
              placeholder="Full Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                if (errors.success) clearSuccessMessage();
              }}
              disabled={!editing}
            />
            {errors.name && (
              <p
                className={`text-xs mt-1 ${
                  darkTheme ? "text-red-400" : "text-red-600"
                }`}
              >
                {errors.name}
              </p>
            )}
          </div>

          <textarea
            className={`w-full p-2 rounded border transition-colors duration-200 ${
              darkTheme
                ? "bg-gray-800 border-gray-700 placeholder-gray-400"
                : "bg-gray-50 border-gray-300 placeholder-gray-500"
            }`}
            placeholder="Short Bio"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              if (errors.success) clearSuccessMessage();
            }}
            disabled={!editing}
          />

          {/* Compression Info */}
          {editing && (
            <div
              className={`text-xs p-2 rounded ${
                darkTheme
                  ? "bg-gray-800 text-gray-400"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              📦 Compression:{" "}
              {compressionEnabled
                ? "ON (max 1MB, 600px)"
                : "OFF (original size)"}
            </div>
          )}

          {editing ? (
            <>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded font-semibold transition-all duration-200 ${
                  loading
                    ? darkTheme
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gray-400 cursor-not-allowed"
                    : darkTheme
                    ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    : "bg-blue-500 hover:bg-blue-600 cursor-pointer text-white"
                }`}
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
              {loading && (
                <div className="space-y-2">
                  <div
                    className={`flex justify-between text-xs ${
                      darkTheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    <span>Saving...</span>
                    <span>{progress}%</span>
                  </div>
                  <div
                    className={`w-full h-3 rounded-full overflow-hidden ${
                      darkTheme ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  >
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  {compressedSize && (
                    <div
                      className={`text-xs ${
                        darkTheme ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      File size: {compressedSize} KB{" "}
                      {!compressionEnabled && "(uncompressed)"}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                // Clear success message and reset upload state when entering edit mode
                setErrors({});
                setUploadDuration(null);
                setProgress(0);
                setOriginalSize(null);
                setCompressedSize(null);
              }}
              className={`w-full py-2 rounded font-semibold cursor-pointer transition-all duration-200 ${
                darkTheme
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Edit Profile
            </button>
          )}
        </form>

        {errors.submit && (
          <p
            className={`text-sm text-center mt-2 ${
              darkTheme ? "text-red-400" : "text-red-600"
            }`}
          >
            {errors.submit}
          </p>
        )}

        {uploadUrl && !editing && (
          <div className="mt-4 text-sm">
            <p className={darkTheme ? "text-green-400" : "text-green-600"}>
              ✅ Image URL:
            </p>
            <a
              href={uploadUrl}
              target="_blank"
              rel="noreferrer"
              className={`underline break-all transition-colors duration-200 ${
                darkTheme
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-700"
              }`}
            >
              {uploadUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
