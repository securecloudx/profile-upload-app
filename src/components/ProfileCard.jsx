import { useState } from "react";

export default function ProfileCard() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("/default-avatar.jpg"); // Default image in /public
  const [uploadUrl, setUploadUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!image || !name) {
  //     alert("Please complete your profile.");
  //     return;
  //   }

  //   setLoading(true);

  //   const sasContainerUrl =
  //     "https://scxsa0425.blob.core.windows.net/profile-upload?sp=cw&st=2025-07-07T15:43:24Z&se=2025-07-07T23:43:24Z&spr=https&sv=2024-11-04&sr=c&sig=8oRo5gYLrcmRD8bvFXhoGcon2pImnTSXDb%2FCNQ%2BuSbI%3D";

  //   const blobName = `${Date.now()}-${image.name}`;
  //   const uploadUrlWithBlob = `${sasContainerUrl.split("?")[0]}/${blobName}?${sasContainerUrl.split("?")[1]}`;

  //   try {
  //     const res = await fetch(uploadUrlWithBlob, {
  //       method: "PUT",
  //       headers: {
  //         "x-ms-blob-type": "BlockBlob",
  //         "Content-Type": image.type,
  //       },
  //       body: image,
  //     });

  //     if (res.ok) {
  //       setUploadUrl(uploadUrlWithBlob.split("?")[0]); // Remove SAS from final link
  //       alert("Profile saved successfully!");
  //     } else {
  //       alert("Upload failed.");
  //     }
  //   } catch (err) {
  //     console.error("Upload error:", err);
  //     alert("An error occurred during upload.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!image || !name) {
    alert("Please complete your profile.");
    return;
  }

  setLoading(true);

  const sasContainerUrl =
    "https://scxsa0425.blob.core.windows.net/profile-upload?sp=cw&st=2025-07-07T15:43:24Z&se=2025-07-07T23:43:24Z&spr=https&sv=2024-11-04&sr=c&sig=8oRo5gYLrcmRD8bvFXhoGcon2pImnTSXDb%2FCNQ%2BuSbI%3D";

  // const blobName = `${Date.now()}-${image.name}`;
  // const containerUrl = new URL(sasContainerUrl);
  // containerUrl.pathname += `/${blobName}`;
    // const uploadUrlWithBlob = containerUrl.toString();
    
    const blobName = `${Date.now()}-${image.name}`.replace(/\s+/g, "-"); // replace spaces
    const containerUrl = new URL(sasContainerUrl);
    containerUrl.pathname += `/${blobName}`;
    const uploadUrlWithBlob = containerUrl.toString();

  try {
    const res = await fetch(uploadUrlWithBlob, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": image.type,
      },
      body: image,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Azure Blob response:", errorText);
      alert("Upload failed:\n" + errorText);
      return;
    }

    setUploadUrl(uploadUrlWithBlob.split("?")[0]);
    alert("Profile saved successfully!");
  } catch (err) {
    console.error("Upload error:", err);
    alert(`Upload failed: ${err.message}`);
  } finally {
    setLoading(false);
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
            disabled={loading}
            className={`${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            } w-full py-2 rounded font-semibold`}
          >
            {loading ? "Saving..." : "Save Profile"}
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
            <img src={uploadUrl} alt="Uploaded" className="mt-2 h-24 rounded-lg mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
// Note: Ensure you have the necessary CORS settings on your Azure Blob Storage to allow uploads from your domain.