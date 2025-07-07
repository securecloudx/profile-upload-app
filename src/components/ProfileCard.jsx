import { useState } from "react";
import imageCompression from "browser-image-compression";
import defaultAvatar from "../assets/default-avatar.jpg";

export default function ProfileCard() {
  const [name, setName] = useState("Jane Doe");
  const [bio, setBio] = useState("Cloud Security learner on SecureCloudX");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(defaultAvatar);
  const [uploadUrl, setUploadUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadStartTime, setUploadStartTime] = useState(null);
  const [uploadDuration, setUploadDuration] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setErrors({ image: "Only JPEG or PNG images are allowed." });
      return;
    }

    const maxSizeMB = 2;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrors({ image: "Image is too large. Max size is 2MB." });
      return;
    }

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 600,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      setImage(compressedFile);
      setCompressedSize((compressedFile.size / 1024).toFixed(1)); // in KB

      setPreview(URL.createObjectURL(compressedFile));
      setErrors((prev) => ({ ...prev, image: null }));
    } catch (err) {
      console.error("Image compression failed:", err);
      setErrors({ image: "Image compression failed." });
    }
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
    setErrors({ success: "Profile saved successfully!" });
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
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-white text-center">
        {errors.success && (
          <div className="text-green-400 text-sm text-center mb-4 bg-green-900/20 border border-green-800 rounded-lg py-3 px-3">
            <p className="font-medium">{errors.success}</p>
            {uploadDuration && compressedSize && (
              <div className="flex justify-between mt-2 text-xs text-green-300">
                <span>📁 {compressedSize} KB</span>
                <span>⏱️ {uploadDuration}s</span>
              </div>
            )}
          </div>
        )}

        <div className="relative inline-block">
          <img
            src={uploadUrl || preview}
            alt="Profile Preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 mx-auto"
          />
          {editing && (
            <>
              <label className="block mt-2 text-sm text-blue-400 cursor-pointer hover:underline">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                Change photo
              </label>
              {errors.image && (
                <p className="text-red-400 text-xs mt-1">{errors.image}</p>
              )}
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
          <div>
            <input
              className={`w-full p-2 rounded bg-gray-800 border ${
                errors.name ? "border-red-500" : "border-gray-700"
              } placeholder-gray-400`}
              placeholder="Full Name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              disabled={!editing}
            />
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          <textarea
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400"
            placeholder="Short Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={!editing}
          />

          {editing ? (
            <>
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                } w-full py-2 rounded font-semibold`}
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>
              {loading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  {compressedSize && (
                    <div className="text-xs text-gray-400">
                      File size: {compressedSize} KB
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="bg-gray-700 hover:bg-gray-600 w-full py-2 rounded font-semibold cursor-pointer"
            >
              Edit Profile
            </button>
          )}
        </form>

        {errors.submit && (
          <p className="text-red-400 text-sm text-center mt-2">
            {errors.submit}
          </p>
        )}

        {uploadUrl && !editing && (
          <div className="mt-4 text-sm">
            <p className="text-green-400">✅ Image URL:</p>
            <a
              href={uploadUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 underline break-all"
            >
              {uploadUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
