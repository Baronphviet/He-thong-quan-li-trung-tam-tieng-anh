import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../store";
import { getRoleHome } from "../../utils/auth";

export default function Header() {
  const { isAuthenticated, role, user, logout } = useAuth();

  return (
    <header className="topbar">
      <NavLink to="/" className="brand-mark">
        <span className="brand-logo">EC</span>
        <span>Trung tâm Tiếng Anh</span>
      </NavLink>
      <nav className="nav-links">
        <NavLink to="/">Trang chủ</NavLink>

        {isAuthenticated && role && (
          <NavLink to={getRoleHome(role)}>Tổng quan</NavLink>
        )}

        {isAuthenticated ? (
          <>
            <NavLink to="/profile" className="nav-user">{user?.fullName || user?.username}</NavLink>
            <button className="nav-button" type="button" onClick={logout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <NavLink to="/login">Đăng nhập</NavLink>
        )}
      </nav>
    </header>
  );
}
