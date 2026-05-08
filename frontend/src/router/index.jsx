import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import HomePage from "../pages/HomePage";
import ParentDashboardPage from "../pages/ParentDashboardPage";
import StudentDashboardPage from "../pages/StudentDashboardPage";
import TeacherDashboardPage from "../pages/TeacherDashboardPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/teacher" element={<TeacherDashboardPage />} />
      <Route path="/student" element={<StudentDashboardPage />} />
      <Route path="/parent" element={<ParentDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
