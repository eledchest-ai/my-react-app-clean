import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister() {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert("Register failed: " + error.message);
      return;
    }

    alert("Registered! Please login.");
    navigate("/login");
  }

  return (
    <div style={{ padding: 20, backgroundColor: "white", color: "black" }}>
      <h2>Register</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
