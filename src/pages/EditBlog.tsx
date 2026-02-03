import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ImageUpload from "../components/ImageUpload";

type Blog = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  image_url?: string | null;
};

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [blog, setBlog] = useState<Blog | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadBlog() {
      setLoading(true);
      setErrMsg(null);

      if (!id) {
        setErrMsg("Missing blog id.");
        setLoading(false);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;

      if (!user) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        setErrMsg(error.message);
        setBlog(null);
        setLoading(false);
        return;
      }

      const loaded = data as Blog | null;

      if (!loaded) {
        setErrMsg("Blog not found.");
        setBlog(null);
        setLoading(false);
        return;
      }

      // Extra safety: block non-owner even if they reach this page
      if (loaded.author_id !== user.id) {
        alert("You are not allowed to edit this post.");
        navigate(`/blog/${id}`);
        return;
      }

      setBlog(loaded);
      setTitle(loaded.title ?? "");
      setContent(loaded.content ?? "");
      setImageUrl(loaded.image_url ?? null);

      setLoading(false);
    }

    loadBlog();
  }, [id, navigate]);

  async function handleSave() {
    if (!blog) return;

    if (!title.trim() || !content.trim()) {
      alert("Please fill in Title and Content.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        content: content.trim(),
        image_url: imageUrl, // ✅ image editing happens here
      })
      .eq("id", blog.id);

    setSaving(false);

    if (error) {
      alert("Update failed: " + error.message);
      return;
    }

    alert("Updated ✅");
    navigate(`/blog/${blog.id}`);
  }

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;
  if (errMsg) return <p style={{ padding: 20, color: "crimson" }}>Error: {errMsg}</p>;
  if (!blog) return <p style={{ padding: 20 }}>Blog not found.</p>;

  return (
    <div style={{ padding: 20, backgroundColor: "white", color: "black" }}>
      <Link to={`/blog/${blog.id}`} style={{ color: "blue" }}>
        ← Back
      </Link>

      <h2 style={{ marginTop: 10 }}>Edit Blog</h2>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      />

      <br />
      <br />

      <textarea
        placeholder="Content"
        rows={8}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      />

      <br />
      <br />

      <p>
        <strong>Edit / Replace Image (optional)</strong>
      </p>

      <ImageUpload onUploaded={(url: string) => setImageUrl(url)} />

      {imageUrl && (
        <>
          <p style={{ marginTop: 10 }}>Current / New Image Preview:</p>
          <img
            src={imageUrl}
            alt="preview"
            style={{ maxWidth: 350, display: "block", marginBottom: 10 }}
          />

          <button onClick={() => setImageUrl(null)} style={{ marginBottom: 20 }}>
            Remove Image
          </button>
        </>
      )}

      <br />

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
