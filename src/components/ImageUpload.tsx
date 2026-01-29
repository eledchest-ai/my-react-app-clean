import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  onUploaded: (publicUrl: string) => void;
};

export default function ImageUpload({ onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file);

    if (uploadError) {
      alert("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    onUploaded(publicUrl);
    setUploading(false);
    alert("Image uploaded ✅");
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
