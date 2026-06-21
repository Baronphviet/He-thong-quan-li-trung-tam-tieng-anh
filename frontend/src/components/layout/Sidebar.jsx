import { NavLink } from "react-router-dom";
import { useAuth } from "../../store";

const ICONS = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  cap: "M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5",
  wallet: "M21 12V7H5a2 2 0 0 1 0-4h14v4M3 5v14a2 2 0 0 0 2 2h16v-5M18 12a2 2 0 0 0 0 4h4v-4z",
  chart: "M3 3v18h18M18 17V9M13 17V5M8 17v-4",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  check: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2 8 6 8-6",
  salary: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  database: "M12 2C7 2 3 3.79 3 6v12c0 2.21 4 4 9 4s9-1.79 9-4V6c0-2.21-4-4-9-4zm0 2c4.42 0 7 .99 7 2s-2.58 2-7 2-7-.99-7-2 2.58-2 7-2zm0 6c5 0 9-1.79 9-4v4c0 2.21-4 4-9 4s-9-1.79-9-4V6c0 2.21 4 4 9 4zm0 6c5 0 9-1.79 9-4v4c0 2.21-4 4-9 4s-9-1.79-9-4v-4c0 2.21 4 4 9 4z"
};

const MENU = {
  ADMIN: {
    title: "Quản trị viên",
    items: [
      { to: "/admin", label: "Tổng quan", icon: "grid", end: true },
      { to: "/admin/accounts", label: "Tài khoản", icon: "users" },
      { to: "/admin/classes", label: "Lớp học", icon: "book" },
      { to: "/admin/students", label: "Học sinh", icon: "cap" },
      { to: "/admin/master-data", label: "Dữ liệu", icon: "database"},
      { to: "/admin/payments", label: "Thanh toán", icon: "wallet" },
      { to: "/admin/statistics", label: "Thống kê", icon: "chart" },
      { to: "/admin/teacher-salary", label: "Lương giáo viên", icon:"salary"},
      { to: "/admin/announcements", label: "Quảng cáo", icon: "bell" },
      { to: "/admin/parent-notifications", label: "Thông báo", icon: "mail"},

    ]
  },
  TEACHER: {
    title: "Giáo viên",
    items: [
      { to: "/teacher", label: "Tổng quan", icon: "grid", end: true },
      { to: "/teacher/attendance", label: "Điểm danh", icon: "check" }
    ]
  },
  STUDENT: {
    title: "Học sinh",
    items: [
      { to: "/student", label: "Tổng quan", icon: "grid", end: true },
      { to: "/student/attendance", label: "Điểm danh", icon: "check" }
    ]
  },
  PARENT: {
    title: "Phụ huynh",
    items: [
      { to: "/parent", label: "Tổng quan", icon: "grid", end: true },
      { to: "/parent/attendance", label: "Điểm danh", icon: "check" }
    ]
  }
};

function Icon({ name }) {
  return (
    <svg
      className="side-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

export default function Sidebar() {
  const { role, user } = useAuth();
  const menu = MENU[role];

  if (!menu) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <span className="sidebar-eyebrow">{menu.title}</span>
        <span className="sidebar-user">{user?.fullName || user?.username}</span>
      </div>

      <nav className="sidebar-nav">
        {menu.items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className="sidebar-link">
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <NavLink to="/profile" className="sidebar-link">
          <Icon name="user" />
          <span>Hồ sơ cá nhân</span>
        </NavLink>
      </div>
    </aside>
  );
}
