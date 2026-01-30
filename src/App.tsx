import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

import BlogList from "./pages/BlogList";
import CreateBlog from "./pages/CreateBlog";
import ViewBlog from "./pages/ViewBlog";
import EditBlog from "./pages/EditBlog";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";

type ProtectedRouteProps = {
  userId: string | null;
  children: React.ReactNode;
};

function ProtectedRoute({ userId, children }: ProtectedRouteProps) {
  if (!userId) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user.id ?? null);
      setChecking(false);
    }

    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (checking) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div>
      <nav style={{ padding: 10 }}>
        <Link to="/">Home</Link>

        {userId ? (
          <>
            {" "} | <Link to="/create">Create Blog</Link>
            {" "} | <Link to="/logout">Logout</Link>
          </>
        ) : (
          <>
            {" "} | <Link to="/login">Login</Link>
            {" "} | <Link to="/register">Register</Link>
          </>
        )}
      </nav>

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<BlogList />} />
        <Route path="/blog/:id" element={<ViewBlog />} />

        {/* Protected routes */}
        <Route
          path="/create"
          element={
            <ProtectedRoute userId={userId}>
              <CreateBlog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute userId={userId}>
              <EditBlog />
            </ProtectedRoute>
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </div>
  );
}
