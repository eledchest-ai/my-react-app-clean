import { Routes, Route, Link } from "react-router-dom";

import BlogList from "./pages/BlogList";
import CreateBlog from "./pages/CreateBlog";
import ViewBlog from "./pages/ViewBlog";
import EditBlog from "./pages/EditBlog";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";

export default function App() {
  return (
    <div>
      <nav
        style={{
       padding: 10,
       backgroundColor: "white",
       color: "black",
       borderBottom: "1px solid #ccc",
        }}
>

       <Link to="/" style={{ color: "blue" }}>Home</Link> |{" "}
       <Link to="/create" style={{ color: "blue" }}>Create Blog</Link> |{" "}
       <Link to="/login" style={{ color: "blue" }}>Login</Link> |{" "}
       <Link to="/register" style={{ color: "blue" }}>Register</Link> |{" "}
       <Link to="/logout" style={{ color: "blue" }}>Logout</Link>

      </nav>

      <Routes>
        <Route path="/" element={<BlogList />} />
        <Route path="/create" element={<CreateBlog />} />
        <Route path="/blog/:id" element={<ViewBlog />} />
        <Route path="/edit/:id" element={<EditBlog />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </div>
  );
}
<strong style={{ marginLeft: 10 }}>[NAV TEST]</strong>
