import { Link } from "react-router-dom";
import AppRouter from "./router";

export default function App() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "24px" }}>
      <h1>English Center Management</h1>
      <nav style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <Link to="/">Home</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/teacher">Teacher</Link>
        <Link to="/student">Student</Link>
        <Link to="/parent">Parent</Link>
      </nav>
      <AppRouter />
    </div>
  );
}
