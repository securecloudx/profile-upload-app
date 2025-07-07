import { useState } from "react";

export default function ProfileCard() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/default-avatar.jpg"); // Default image
  const [uploadUrl, setUploadUrl] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image || !name) return alert("Please complete your profile.");

    const sasUrl = "<YOUR_SAS_URL>"; // Replace with real Azure Blob container SAS URL
    const blobName = `${Date.now()}-${image.name}`;
    const uploadEndpoint = `${sasUrl}/${blobName}`;

    const res = await fetch(uploadEndpoint, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": image.type,
      },
      body: image,
    });

    if (res.ok) {
      setUploadUrl(uploadEndpoint.split("?")[0]);
      alert("Profile saved successfully!");
    } else {
      alert("Upload failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-white text-center">
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Profile Preview"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 mx-auto"
          />
          <label className="block mt-2 text-sm text-blue-400 cursor-pointer hover:underline">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            Change photo
          </label>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            className="w-full p-2 rounded bg-gray-800 border border-gray-700 placeholder-gray-400"
            placeholder="Short Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 w-full py-2 rounded font-semibold"
          >
            Save Profile
          </button>
        </form>

        {uploadUrl && (
          <div className="mt-4">
            <p className="text-green-400 text-sm">Image uploaded:</p>
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
