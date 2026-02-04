import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
};

export default function ViewBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentImageUrl, setCommentImageUrl] = useState<string | null>(null);

  // ✅ Edit comment state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  async function loadComments(postId: string) {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!error && data) setComments(data as Comment[]);
  }

  useEffect(() => {
    async function loadEverything() {
      setLoading(true);
      setErrMsg(null);

      const { data: authData } = await supabase.auth.getUser();
      setUserId(authData.user?.id ?? null);

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

      setBlog(data as Blog | null);
      setLoading(false);

      if (data?.id) await loadComments(data.id);
    }

    if (id) loadEverything();
  }, [id]);

  async function handleDeletePost() {
    if (!blog) return;

    const ok = window.confirm("Delete this blog?");
    if (!ok) return;

    const { error } = await supabase.from("posts").delete().eq("id", blog.id);

    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }

    alert("Deleted ✅");
    navigate("/");
  }

  async function handleAddComment() {
    if (!blog) return;

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      alert("Please login to comment.");
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    const { error } = await supabase.from("comments").insert({
      post_id: blog.id,
      author_id: user.id,
      content: commentText.trim(),
      image_url: commentImageUrl,
    });

    if (error) {
      alert("Comment failed: " + error.message);
      return;
    }

    setCommentText("");
    setCommentImageUrl(null);
    await loadComments(blog.id);
  }

  async function handleDeleteComment(commentId: string) {
    const ok = window.confirm("Delete this comment?");
    if (!ok) return;

    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      alert("Delete comment failed: " + error.message);
      return;
    }
    if (blog) await loadComments(blog.id);
  }

  // ✅ Start editing a comment
  function startEdit(c: Comment) {
    setEditingCommentId(c.id);
    setEditText(c.content);
    setEditImageUrl(c.image_url ?? null);
  }

  function cancelEdit() {
    setEditingCommentId(null);
    setEditText("");
    setEditImageUrl(null);
  }

  // ✅ Save edited comment
  async function handleSaveEdit() {
    if (!editingCommentId) return;

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;

    if (!user) {
      alert("Please login again.");
      navigate("/login");
      return;
    }

    if (!editText.trim()) {
      alert("Comment cannot be empty.");
      return;
    }

    setSavingEdit(true);

    const { error } = await supabase
      .from("comments")
      .update({
        content: editText.trim(),
        image_url: editImageUrl,
      })
      .eq("id", editingCommentId);

    setSavingEdit(false);

    if (error) {
      alert("Update failed: " + error.message);
      return;
    }

    cancelEdit();
    if (blog) await loadComments(blog.id);
  }

  if (loading) return <p>Loading...</p>;
  if (errMsg) return <p style={{ color: "crimson" }}>Error: {errMsg}</p>;
  if (!blog) return <p>Blog not found.</p>;

  const isOwner = userId === blog.author_id;

  return (
    <div style={{ padding: 20, backgroundColor: "white", color: "black" }}>
      <Link to="/" style={{ color: "blue" }}>
        ← Back
      </Link>

      <div style={{ marginTop: 10, marginBottom: 10 }}>
        {isOwner && (
          <>
            <Link to={`/edit/${blog.id}`} style={{ color: "blue" }}>
              Edit
            </Link>
            <button onClick={handleDeletePost} style={{ marginLeft: 10 }}>
              Delete
            </button>
          </>
        )}
      </div>

      <h2>{blog.title}</h2>

      {blog.image_url && (
        <img
          src={blog.image_url}
          alt=""
          style={{ maxWidth: 400, display: "block", marginBottom: 10 }}
        />
      )}

      <p>{blog.content}</p>
      <small>{new Date(blog.created_at).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}</small>

      <hr />

      <h3>Comments</h3>

      {/* Add Comment */}
      <div style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
        <textarea
          rows={3}
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          style={{ width: "100%" }}
        />
        <br />
        <br />

        <p>
          <strong>Upload Comment Image (optional)</strong>
        </p>
        <ImageUpload onUploaded={(url: string) => setCommentImageUrl(url)} />

        {commentImageUrl && (
          <img
            src={commentImageUrl}
            alt=""
            style={{ maxWidth: 200, display: "block", marginTop: 10 }}
          />
        )}

        <br />
        <button onClick={handleAddComment}>Post Comment</button>
      </div>

      {comments.length === 0 && <p>No comments yet.</p>}

      {comments.map((c) => {
        const isCommentOwner = userId === c.author_id;
        const isEditing = editingCommentId === c.id;

        return (
          <div
            key={c.id}
            style={{ border: "1px solid #eee", padding: 10, marginBottom: 10 }}
          >
            {/* ✅ Edit Mode */}
            {isEditing ? (
              <>
                <textarea
                  rows={3}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{ width: "100%" }}
                />

                <br />
                <br />

                <p>
                  <strong>Replace Comment Image (optional)</strong>
                </p>
                <ImageUpload onUploaded={(url: string) => setEditImageUrl(url)} />

                {editImageUrl && (
                  <>
                    <img
                      src={editImageUrl}
                      alt=""
                      style={{ maxWidth: 200, display: "block", marginTop: 10 }}
                    />
                    <button
                      onClick={() => setEditImageUrl(null)}
                      style={{ marginTop: 8 }}
                    >
                      Remove Image
                    </button>
                  </>
                )}

                <br />
                <br />

                <button onClick={handleSaveEdit} disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save"}
                </button>
                <button onClick={cancelEdit} style={{ marginLeft: 8 }}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <p>{c.content}</p>

                {c.image_url && (
                  <img
                    src={c.image_url}
                    alt=""
                    style={{ maxWidth: 200, display: "block" }}
                  />
                )}

                <small>
                  {new Date(c.created_at).toLocaleString("en-PH", {
                    timeZone: "Asia/Manila",
                  })}
                </small>

                {isCommentOwner && (
                  <div style={{ marginTop: 8 }}>
                    <button onClick={() => startEdit(c)}>Edit</button>
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      style={{ marginLeft: 8 }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
