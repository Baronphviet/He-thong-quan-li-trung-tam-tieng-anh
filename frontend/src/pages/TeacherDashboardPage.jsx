import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../services/apiClient";
import { useAuth } from "../store";
import { formatMoney } from "../utils/format";
import { sameId } from "../utils/auth";
import { getApiErrorMessage } from "../utils/apiError";
import { Link } from "react-router-dom";
import { Alert, Button, Loading } from "../components/common";
import ClassDetailsModal from "../features/classes/ClassDetailsModal";

export default function TeacherDashboardPage() {
  const { role, userId } = useAuth();
  const [classes, setClasses] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detailsClassId, setDetailsClassId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadTeacherData() {
      setLoading(true);
      setError("");

      try {
        const [classData, studentData, salaryData] = await Promise.all([
          apiGet("/classes"),
          apiGet("/reports/students-by-class"),
          role === "TEACHER" ? apiGet(`/teacher-salary/teacher?teacherId=${userId}`) : Promise.resolve([])
        ]);

        if (!active) return;

        const allClasses = Array.isArray(classData) ? classData : [];
        const allStudents = Array.isArray(studentData) ? studentData : [];
        const allSalaries = Array.isArray(salaryData) ? salaryData : [];
        const visibleClasses = role === "TEACHER"
          ? allClasses.filter((item) => sameId(item.teacherId, userId))
          : allClasses;
        const visibleClassIds = new Set(visibleClasses.map((item) => item.id));

        setClasses(visibleClasses);
        setStudentsByClass(allStudents.filter((item) => visibleClassIds.has(item.classId)));
        setSalaries(allSalaries);
      } catch (err) {
        if (active) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTeacherData();
    return () => {
      active = false;
    };
  }, [role, userId]);

  const classStats = useMemo(() => {
    return classes.map((item) => ({
      ...item,
      students: studentsByClass.filter((student) => sameId(student.classId, item.id))
    }));
  }, [classes, studentsByClass]);

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Không gian giáo viên</p>
        <h1>Lịch dạy và danh sách học sinh theo lớp</h1>
        <p className="lead">
          Giáo viên xem lớp được phân công, lịch học và thực hiện điểm danh từng buổi.
        </p>
        <Link to="/teacher/attendance"><Button type="button">Mở trang điểm danh</Button></Link>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu">{error}</Alert>}

      <section className="section grid three">
        {classStats.length === 0 && <p className="muted">Chưa có lớp được phân công.</p>}
        {classStats.map((item) => (
          <article className="panel" key={item.id}>
            <p className="eyebrow">{item.status}</p>
            <h2>{item.className}</h2>
            <p className="lead">
              {item.schedule}<br />
              GV: {item.teacherName || "Chưa gán"}<br />
              Học phí: {formatMoney(item.tuitionFee)}
            </p>
            <p><span className="status-pill">{item.students.length} học sinh</span></p>
            <Button variant="secondary" size="sm" type="button" onClick={() => setDetailsClassId(item.id)} style={{ marginTop: '10px' }}>
              Chi tiết
            </Button>
          </article>
        ))}
      </section>

      <ClassDetailsModal
        isOpen={!!detailsClassId}
        classId={detailsClassId}
        onClose={() => setDetailsClassId(null)}
      />

      <section className="section table-card">
        <p className="eyebrow">Lịch sử lương</p>
        <h2>Thanh toán lương</h2>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Kỳ lương (Tháng/Năm)</th><th>Số buổi dạy</th><th>Thực lĩnh</th><th>Trạng thái</th><th>Ngày nhận</th><th>Ghi chú</th></tr></thead>
            <tbody>
              {salaries.length === 0 && (
                <tr><td colSpan={6} className="muted">Chưa có dữ liệu lương.</td></tr>
              )}
              {salaries.map((salary) => (
                <tr key={salary.salaryId}>
                  <td>{salary.month}/{salary.year}</td>
                  <td>{salary.totalSessions}</td>
                  <td>{formatMoney(salary.amount)}</td>
                  <td><span className={`status-pill ${salary.status === "PENDING" ? "warning" : "success"}`}>{salary.status === "PENDING" ? "Chưa thanh toán" : "Đã thanh toán"}</span></td>
                  <td>{salary.paidDate ? new Date(salary.paidDate).toLocaleDateString("vi-VN") : "-"}</td>
                  <td>{salary.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
