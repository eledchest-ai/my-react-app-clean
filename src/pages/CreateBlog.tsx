import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ImageUpload from "../components/ImageUpload";

export default function CreateBlog() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      alert("Please fill in Title and Content.");
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: title.trim(),
        content: content.trim(),
        author_id: user.id,
        image_url: imageUrl, // ✅ store image url
      })
      .select("id")
      .maybeSingle();

    setSaving(false);

    if (error) {
      alert("Save failed: " + error.message);
      return;
    }

    alert("Saved ✅");
    if (data?.id) navigate(`/blog/${data.id}`);
    else navigate("/");
  }

  return (
    <div style={{ padding: 20, backgroundColor: "white", color: "black" }}>
      <h2>Create Blog</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Content"
        rows={6}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <br /><br />

      <p><strong>Upload Image (optional)</strong></p>
      <ImageUpload onUploaded={(url) => setImageUrl(url)} />

      {imageUrl && (
        <>
          <p>Preview:</p>
          <img src={imageUrl} alt="preview" style={{ maxWidth: 300 }} />
        </>
      )}

      <br /><br />

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
