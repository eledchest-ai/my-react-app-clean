import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  onUploaded: (url: string) => void;
};

export default function ImageUpload({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [lastFileName, setLastFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setLastFileName(file.name);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? "guest";

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

    // Reset input so selecting the same image again still triggers change
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
      <p style={{ marginTop: 0, marginBottom: 10 }}>
        <strong>Upload image</strong>
      </p>

      {/* Big tap target for mobile */}
      <label
        style={{
          display: "inline-block",
          padding: "10px 12px",
          border: "1px solid #999",
          borderRadius: 8,
          cursor: uploading ? "not-allowed" : "pointer",
          opacity: uploading ? 0.6 : 1,
          userSelect: "none",
        }}
      >
        {uploading ? "Uploading..." : "Choose Image"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      <div style={{ marginTop: 10, fontSize: 14 }}>
        {lastFileName ? (
          <span>Selected: {lastFileName}</span>
        ) : (
          <span>No file selected yet.</span>
        )}
      </div>
    </div>
  );
}
