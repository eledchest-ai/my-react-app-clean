import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";



export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlog() {
      const { data, error } = await supabase
        .from("posts")
        .select("id,title,content,author_id")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        alert("Load failed: " + error.message);
        navigate("/");
        return;
      }

      if (!data) {
        alert("Blog not found.");
        navigate("/");
        return;
      }

      setTitle(data.title ?? "");
      setContent(data.content ?? "");
      setLoading(false);
    }

    if (id) loadBlog();
  }, [id, navigate]);

  async function handleUpdate() {
    if (!id) return;

    const { error } = await supabase
      .from("posts")
      .update({ title: title.trim(), content: content.trim() })
      .eq("id", id);

    if (error) {
      alert("Update failed: " + error.message);
      return;
    }

    alert("Updated ✅");
    navigate(`/blog/${id}`);
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20, backgroundColor: "white", color: "black" }}>
      <h2>Edit Blog</h2>

      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <br /><br />

      <textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
      <br /><br />

      <button onClick={handleUpdate}>Update</button>
    </div>
  );
}
