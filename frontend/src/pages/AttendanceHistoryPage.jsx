import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../services/apiClient";
import { attendanceService } from "../services";
import { useAuth } from "../store";
import { sameId } from "../utils/auth";
import { getApiErrorMessage } from "../utils/apiError";
import { Alert, Loading } from "../components/common";

export default function AttendanceHistoryPage() {
  const { role, userId } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [role, userId]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      if (role === "STUDENT") {
        const data = await attendanceService.getStudentHistory(userId);
        setAttendanceHistory(Array.isArray(data) ? data : []);
      } else if (role === "PARENT") {
        const parents = await apiGet("/parents");
        const parent = (Array.isArray(parents) ? parents : []).find((item) => sameId(item.id, userId));
        const studentIds = parent?.studentIds || [];
        
        // Lấy lịch sử điểm danh của tất cả các con
        const promises = studentIds.map(id => attendanceService.getStudentHistory(id));
        const results = await Promise.all(promises);
        
        let combined = [];
        results.forEach(res => {
          if (Array.isArray(res)) combined = [...combined, ...res];
        });
        
        // Sắp xếp theo ngày giảm dần
        combined.sort((a, b) => new Date(b.sessionDate) - new Date(a.sessionDate));
        setAttendanceHistory(combined);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
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
        <p className="eyebrow">{role === "STUDENT" ? "Cổng học sinh" : "Cổng phụ huynh"}</p>
        <h1>Lịch sử điểm danh</h1>
        <p className="lead">
          Theo dõi chi tiết số buổi có mặt, đi muộn và vắng mặt.
        </p>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu">{error}</Alert>}

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

      <section className="section table-card">
        <h2>Chi tiết điểm danh</h2>
        <div className="table-scroll">
          <table>
            <thead><tr>{role === "PARENT" && <th>Học sinh</th>}<th>Lớp</th><th>Buổi</th><th>Ngày</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead>
            <tbody>
              {attendanceHistory.length === 0 && (
                <tr><td colSpan={role === "PARENT" ? 6 : 5} className="muted">Chưa có dữ liệu điểm danh.</td></tr>
              )}
              {attendanceHistory.map((item, index) => (
                <tr key={`${item.attendanceId || index}`}>
                  {role === "PARENT" && <td>{item.studentName || "-"}</td>}
                  <td>{item.className || "-"}</td>
                  <td>{item.sessionNumber || "-"}</td>
                  <td>{item.sessionDate || "-"}</td>
                  <td><span className={`status-pill ${item.status === 'ABSENT' ? 'danger' : item.status === 'LATE' ? 'warn' : ''}`}>{item.status}</span></td>
                  <td>{item.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
