import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Blog = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  image_url?: string | null;
};

const PAGE_SIZE = 5;

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  async function loadBlogs(currentPage: number) {
    setLoading(true);

    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from("posts")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      setBlogs(data as Blog[]);
      if (count) setTotalPages(Math.ceil(count / PAGE_SIZE));
    }

    setLoading(false);
  }

  useEffect(() => {
    loadBlogs(page);
  }, [page]);

  return (
    <div style={{ padding: 20, backgroundColor: "white", color: "black" }}>
      <h1>Blogs</h1>

      {loading && <p>Loading...</p>}

      {blogs.map((b) => (
        <div
          key={b.id}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 10,
          }}
        >
          <Link to={`/blog/${b.id}`} style={{ color: "blue" }}>
            <h3>{b.title}</h3>
          </Link>

          {b.image_url && (
            <img
              src={b.image_url}
              alt=""
              style={{ maxWidth: 200, display: "block" }}
            />
          )}

          <p>{b.content}</p>
          <small>
  {new Date(b.created_at).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}
</small>

        </div>
      ))}

      {/* Pagination Controls */}
      <div style={{ marginTop: 20 }}>
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
