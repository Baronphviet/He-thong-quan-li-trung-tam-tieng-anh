import { NavLink } from "react-router-dom";
import AppRouter from "./router";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand-mark">
          <span className="brand-logo">EC</span>
          <span>English Center Ops</span>
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/admin">Admin</NavLink>
          <NavLink to="/teacher">Teacher</NavLink>
          <NavLink to="/student">Student</NavLink>
          <NavLink to="/parent">Parent</NavLink>
        </nav>
      </header>
      <AppRouter />
    </div>
  );
}
