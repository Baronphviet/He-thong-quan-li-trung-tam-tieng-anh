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

        {role === "ADMIN" && (
          <div className="nav-group">
            <NavLink to="/admin">Quản trị</NavLink>
            <div className="nav-submenu">
              <NavLink to="/admin/accounts">Tài khoản</NavLink>
              <NavLink to="/admin/classes">Lớp học</NavLink>
              <NavLink to="/admin/students">Học sinh</NavLink>
              <NavLink to="/admin/payments">Thanh toán</NavLink>
              <NavLink to="/admin/statistics">Thống kê</NavLink>
              <NavLink to="/admin/announcements">Thông báo</NavLink>
              <NavLink to="/admin/parent-notifications">Thông báo phụ huynh</NavLink>
            </div>
          </div>
        )}

        {role === "TEACHER" && (
          <div className="nav-group">
            <NavLink to="/teacher">Giáo viên</NavLink>
            <div className="nav-submenu">
              <NavLink to="/teacher/attendance">Điểm danh</NavLink>
            </div>
          </div>
        )}

        {role === "STUDENT" && <NavLink to="/student">Học sinh</NavLink>}
        {role === "PARENT" && <NavLink to="/parent">Phụ huynh</NavLink>}

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
