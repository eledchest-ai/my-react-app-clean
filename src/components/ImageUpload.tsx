import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  onUploaded: (url: string) => void;
};

export default function ImageUpload({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? "guest";

    const ext = file.name.split(".").pop() || "png";
    const fileName = `${userId}-${Date.now()}.${ext}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images") // ✅ FIXED BUCKET NAME
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      alert("Upload failed: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage
      .from("images") // ✅ SAME BUCKET
      .getPublicUrl(filePath);

    const url = data.publicUrl;

    onUploaded(url);
    setUploading(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: 12 }}>
      <p><strong>Upload Image</strong></p>

      <label
        style={{
          display: "inline-block",
          padding: "10px",
          border: "1px solid black",
          cursor: "pointer",
        }}
      >
        Choose Image
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={uploading}
        />
      </label>

      <p>{uploading ? "Uploading..." : ""}</p>
    </div>
  );
}
