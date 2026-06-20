import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../services/apiClient";
import { attendanceService, classService, enrollmentService } from "../services";
import { useAuth } from "../store";
import { formatMoney } from "../utils/format";
import { sameId } from "../utils/auth";
import { getApiErrorMessage } from "../utils/apiError";
import { Alert, Button, Loading } from "../components/common";
import { useNotification } from "../hooks";

export default function StudentDashboardPage() {
  const { role, userId } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [fees, setFees] = useState([]);
  const [openClasses, setOpenClasses] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningClassId, setJoiningClassId] = useState(null);
  const [error, setError] = useState("");
  const { addNotification } = useNotification();

  useEffect(() => {
    loadStudentData();
  }, [role, userId]);

  async function loadStudentData() {
    setLoading(true);
    setError("");

    try {
      const [studentClassData, feeData, openClassData, attendanceData] = await Promise.all([
        apiGet("/reports/students-by-class"),
        apiGet("/monthly-fees"),
        classService.getOpen(),
        role === "STUDENT" ? attendanceService.getStudentHistory(userId) : Promise.resolve([])
      ]);

      const allEnrollments = Array.isArray(studentClassData) ? studentClassData : [];
      const allFees = Array.isArray(feeData) ? feeData : [];
      const visibleEnrollments = role === "STUDENT"
        ? allEnrollments.filter((item) => sameId(item.studentId, userId))
        : allEnrollments;
      const visibleEnrollmentIds = new Set(visibleEnrollments.map((item) => item.enrollmentId));
      const enrolledClassIds = new Set(visibleEnrollments.map((item) => item.classId));

      setEnrollments(visibleEnrollments);
      setFees(
        role === "STUDENT"
          ? allFees.filter((item) => visibleEnrollmentIds.has(item.enrollmentId))
          : allFees
      );
      setOpenClasses(
        (Array.isArray(openClassData) ? openClassData : []).filter((item) => !enrolledClassIds.has(item.id))
      );
      setAttendanceHistory(Array.isArray(attendanceData) ? attendanceData : []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinClass(classId) {
    if (role !== "STUDENT") return;
    setJoiningClassId(classId);
    try {
      await enrollmentService.create({
        studentId: userId,
        classId,
        discountRate: 0,
        status: "ACTIVE",
        totalSessions: 12
      });
      addNotification("Tham gia lớp học thành công", "success");
      await loadStudentData();
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setJoiningClassId(null);
    }
  }

  const attendanceSummary = useMemo(() => {
    const present = attendanceHistory.filter((item) => item.status === "PRESENT").length;
    const absent = attendanceHistory.filter((item) => item.status === "ABSENT").length;
    const late = attendanceHistory.filter((item) => item.status === "LATE").length;
    return { present, absent, late };
  }, [attendanceHistory]);

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Cổng học sinh</p>
        <h1>Lớp đang học, đăng ký lớp mới và lịch sử điểm danh</h1>
        <p className="lead">
          Học sinh có thể tham gia lớp đang mở, xem học phí và lịch sử điểm danh.
        </p>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu">{error}</Alert>}

      {role === "STUDENT" && (
        <section className="section table-card">
          <p className="eyebrow">Đăng ký lớp</p>
          <h2>Lớp học đang mở</h2>
          <div className="grid three">
            {openClasses.length === 0 && <p className="muted">Không còn lớp mở để tham gia.</p>}
            {openClasses.map((item) => (
              <article className="panel" key={item.id}>
                <p className="eyebrow">{item.status}</p>
                <h2>{item.className}</h2>
                <p className="lead">
                  {item.schedule}<br />
                  GV: {item.teacherName || "Chưa gán"}<br />
                  Học phí: {formatMoney(item.tuitionFee)}
                </p>
                <Button
                  type="button"
                  disabled={joiningClassId === item.id}
                  onClick={() => handleJoinClass(item.id)}
                >
                  {joiningClassId === item.id ? "Đang ghi danh..." : "Tham gia lớp"}
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="section table-card">
        <h2>Lớp của học sinh</h2>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Học sinh</th><th>Lớp</th><th>Trạng thái</th><th>Giảm giá</th></tr></thead>
            <tbody>
              {enrollments.length === 0 && (
                <tr><td colSpan={4} className="muted">Chưa có lớp đang học.</td></tr>
              )}
              {enrollments.map((item) => (
                <tr key={item.enrollmentId}>
                  <td>{item.fullName}</td>
                  <td>{item.className}</td>
                  <td><span className="status-pill">{item.status}</span></td>
                  <td>{Math.round(Number(item.discountRate || 0) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {role === "STUDENT" && (
        <section className="section grid three">
          <article className="metric-card">
            <p className="metric-label">Có mặt</p>
            <p className="metric-value">{attendanceSummary.present}</p>
          </article>
          <article className="metric-card">
            <p className="metric-label">Vắng</p>
            <p className="metric-value">{attendanceSummary.absent}</p>
          </article>
          <article className="metric-card">
            <p className="metric-label">Đi muộn</p>
            <p className="metric-value">{attendanceSummary.late}</p>
          </article>
        </section>
      )}

      {role === "STUDENT" && (
        <section className="section table-card">
          <h2>Lịch sử điểm danh</h2>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Lớp</th><th>Buổi</th><th>Ngày</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead>
              <tbody>
                {attendanceHistory.length === 0 && (
                  <tr><td colSpan={5} className="muted">Chưa có dữ liệu điểm danh.</td></tr>
                )}
                {attendanceHistory.map((item) => (
                  <tr key={item.attendanceId}>
                    <td>{item.className || "-"}</td>
                    <td>{item.sessionNumber || "-"}</td>
                    <td>{item.sessionDate || "-"}</td>
                    <td><span className="status-pill">{item.status}</span></td>
                    <td>{item.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section grid three">
        {fees.length === 0 && <p className="muted">Chưa có hóa đơn học phí.</p>}
        {fees.map((fee) => (
          <article className="panel" key={fee.id}>
            <h2>{fee.studentName}</h2>
            <p className="lead">
              {fee.className} - {fee.month}/{fee.year}<br />
              Cần thu: {formatMoney(fee.finalAmount)}<br />
              Đã đóng: {formatMoney(fee.paidAmount)}
            </p>
            <span className={`status-pill ${fee.status === "UNPAID" ? "danger" : fee.status === "PARTIAL" ? "warn" : ""}`}>{fee.status}</span>
          </article>
        ))}
      </section>
    </main>
  );
}
