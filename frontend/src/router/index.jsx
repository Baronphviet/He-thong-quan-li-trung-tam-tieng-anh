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
import AttendanceHistoryPage from "../pages/AttendanceHistoryPage";
import { DashboardLayout } from "../components/layout";
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
      <Route path="/profile" element={<RequireAuth roles={["ADMIN", "TEACHER", "STUDENT", "PARENT"]}><DashboardLayout><ProfilePage /></DashboardLayout></RequireAuth>} />

        <Route
            path="/admin"
            element={
                <RequireAuth roles={["ADMIN"]}>
                    <DashboardLayout />
                </RequireAuth>
            }
        >
            <Route index element={<AdminDashboard />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="teacher-salary" element={<TeacherSalaryPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="parent-notifications" element={<ParentNotificationPage />} />
            <Route path="master-data" element={<RequireAuth roles={["ADMIN"]}><MasterDataPage /></RequireAuth>} />
        </Route>

      <Route path="/teacher" element={<RequireAuth roles={["TEACHER"]}><DashboardLayout><TeacherDashboardPage /></DashboardLayout></RequireAuth>} />
      <Route path="/teacher/attendance" element={<RequireAuth roles={["TEACHER"]}><DashboardLayout><TeacherAttendancePage /></DashboardLayout></RequireAuth>} />
      <Route path="/student" element={<RequireAuth roles={["STUDENT"]}><DashboardLayout><StudentDashboardPage /></DashboardLayout></RequireAuth>} />
      <Route path="/student/attendance" element={<RequireAuth roles={["STUDENT"]}><DashboardLayout><AttendanceHistoryPage /></DashboardLayout></RequireAuth>} />
      <Route path="/parent" element={<RequireAuth roles={["PARENT"]}><DashboardLayout><ParentDashboardPage /></DashboardLayout></RequireAuth>} />
      <Route path="/parent/attendance" element={<RequireAuth roles={["PARENT"]}><DashboardLayout><AttendanceHistoryPage /></DashboardLayout></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
