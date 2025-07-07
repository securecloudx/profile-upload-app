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

  // const handleImageChange = async (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   try {
  //     const options = {
  //       maxSizeMB: 1,
  //       maxWidthOrHeight: 600,
  //       useWebWorker: true,
  //     };
  //     const compressedFile = await imageCompression(file, options);
  //     setImage(compressedFile);
  //     setPreview(URL.createObjectURL(compressedFile));
  //   } catch (err) {
  //     console.error("Image compression failed:", err);
  //     alert("Image compression failed.");
  //   }
  // };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ File type validation
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Only JPEG or PNG images are allowed.");
      return;
    }

    // ✅ File size validation (limit: 2MB)
    const maxSizeMB = 2;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert("Image is too large. Max size is 2MB.");
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
      setPreview(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error("Image compression failed:", err);
      alert("Image compression failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image && !uploadUrl) return alert("Please upload a profile image.");
    if (!name) return alert("Please enter your name.");

    setLoading(true);
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
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed.");
        setLoading(false);
        return;
      }
    }

    setEditing(false);
    setLoading(false);
    alert("Profile saved successfully!");
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
        <div className="relative inline-block">
          <img
            src={uploadUrl || preview}
            alt="Profile Preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 mx-auto"
          />
          {editing && (
            <label className="block mt-2 text-sm text-blue-400 cursor-pointer hover:underline">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              Change photo
            </label>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!editing}
          />
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
                <div className="w-full bg-gray-700 h-3 rounded mt-2">
                  <div
                    className="bg-green-500 h-3 rounded"
                    style={{ width: `${progress}%` }}
                  ></div>
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

        {uploadUrl && !editing && (
          <div className="mt-4">
            <p className="text-green-400 text-sm">Image URL:</p>
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
