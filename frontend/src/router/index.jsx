import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import ProfilePage from "../pages/ProfilePage";
import AdminDashboard from "../features/dashboard/AdminDashboard";
import StatisticsPage from "../features/statistics/StatisticsPage";
import AnnouncementsPage from "../features/announcements/AnnouncementsPage";
import ClassesPage from "../features/classes/ClassesPage";
import StudentsPage from "../features/students/StudentsPage";
import PaymentsPage from "../features/payments/PaymentsPage";
import AccountsPage from "../features/accounts/AccountsPage";
import TeacherSalaryPage from "../features/accounts/TeacherSalaryPage";
import MasterDataPage from "../features/master/MasterDataPage";

// IMPORT THÊM: Trang quản lý thông báo phụ huynh mới tạo
import ParentNotificationPage from "../features/announcements/ParentNotificationPage";

import TeacherDashboardPage from "../pages/TeacherDashboardPage";
import TeacherAttendancePage from "../pages/TeacherAttendancePage";
import StudentDashboardPage from "../pages/StudentDashboardPage";
import ParentDashboardPage from "../pages/ParentDashboardPage";
import { useAuth } from "../store";
import { getRoleHome } from "../utils/auth";

function RequireAuth({ roles, children }) {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(role)) {
    return <Navigate to={getRoleHome(role)} replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<RequireAuth roles={["ADMIN", "TEACHER", "STUDENT", "PARENT"]}><ProfilePage /></RequireAuth>} />

      <Route path="/admin" element={<RequireAuth roles={["ADMIN"]}><AdminDashboard /></RequireAuth>} />
      <Route path="/admin/accounts" element={<RequireAuth roles={["ADMIN"]}><AccountsPage /></RequireAuth>} />
      <Route path="/classes" element={<RequireAuth roles={["ADMIN", "TEACHER", "STUDENT", "PARENT"]}><ClassesPage /></RequireAuth>} />
      <Route path="/admin/students" element={<RequireAuth roles={["ADMIN"]}><StudentsPage /></RequireAuth>} />
      <Route path="/admin/payments" element={<RequireAuth roles={["ADMIN"]}><PaymentsPage /></RequireAuth>} />
      <Route path="/admin/teacher-salary" element={<RequireAuth roles={["ADMIN"]}><TeacherSalaryPage /></RequireAuth>} />
      <Route path="/admin/statistics" element={<RequireAuth roles={["ADMIN"]}><StatisticsPage /></RequireAuth>} />
      <Route path="/admin/announcements" element={<RequireAuth roles={["ADMIN"]}><AnnouncementsPage /></RequireAuth>} />
      
      {/* ROUTE MỚI: Đăng ký đường dẫn cho trang Thông báo phụ huynh độc lập */}
      <Route path="/admin/parent-notifications" element={<RequireAuth roles={["ADMIN"]}><ParentNotificationPage /></RequireAuth>} />
      
      <Route path="/admin/master-data" element={<RequireAuth roles={["ADMIN"]}><MasterDataPage /></RequireAuth>} />

      <Route path="/teacher" element={<RequireAuth roles={["TEACHER"]}><TeacherDashboardPage /></RequireAuth>} />
      <Route path="/teacher/attendance" element={<RequireAuth roles={["TEACHER"]}><TeacherAttendancePage /></RequireAuth>} />
      <Route path="/student" element={<RequireAuth roles={["STUDENT"]}><StudentDashboardPage /></RequireAuth>} />
      <Route path="/parent" element={<RequireAuth roles={["PARENT"]}><ParentDashboardPage /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}