import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  onUploaded: (url: string) => void;
};

export default function ImageUpload({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? "guest";

    // Safe unique file name
    const ext = file.name.split(".").pop() || "png";
    const fileName = `${userId}-${Date.now()}.${ext}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      alert("Upload failed: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("images").getPublicUrl(filePath);
    const url = data.publicUrl;

    onUploaded(url);
    setUploading(false);

    // Allow selecting the same file again
    e.target.value = "";
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 10, borderRadius: 6 }}>
      <label style={{ display: "block", marginBottom: 8 }}>
        <strong>Select an image</strong>
      </label>

      {/* IMPORTANT for mobile: keep this visible and not hidden */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ width: "100%" }}
      />

      <p style={{ marginTop: 8, marginBottom: 0 }}>
        {uploading ? "Uploading..." : "Choose a file to upload"}
      </p>
    </div>
  );
}
