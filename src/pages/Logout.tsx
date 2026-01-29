import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    async function doLogout() {
      await supabase.auth.signOut();
      alert("Logged out!");
      navigate("/Login");
    }

    doLogout();
  }, [navigate]);

  return (
    <div style={{ padding: 20, backgroundColor: "white", color: "black" }}>
      <p>Logging out...</p>
    </div>
  );
}
