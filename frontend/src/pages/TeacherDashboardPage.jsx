import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../services/apiClient";
import { formatMoney } from "../utils/format";

export default function TeacherDashboardPage() {
  const [classes, setClasses] = useState([]);
  const [studentsByClass, setStudentsByClass] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet("/classes"),
      apiGet("/reports/students-by-class")
    ])
      .then(([classData, studentData]) => {
        setClasses(classData);
        setStudentsByClass(studentData);
      })
      .catch((err) => setError(err.message));
  }, []);

  const classStats = useMemo(() => {
    return classes.map((item) => ({
      ...item,
      students: studentsByClass.filter((student) => student.classId === item.id)
    }));
  }, [classes, studentsByClass]);

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Teacher workspace</p>
        <h1>Lich day va danh sach hoc sinh theo lop.</h1>
        <p className="lead">
          Trang giao vien doc du lieu class va view hoc sinh theo lop. Phan diem danh co
          schema san sang de mo rong thanh form buoi hoc.
        </p>
      </section>

      {error && <p className="message error">{error}</p>}

      <section className="section grid three">
        {classStats.map((item) => (
          <article className="panel" key={item.id}>
            <p className="eyebrow">{item.status}</p>
            <h2>{item.className}</h2>
            <p className="lead">
              {item.schedule}<br />
              GV: {item.teacherName || "Chua gan"}<br />
              Hoc phi: {formatMoney(item.tuitionFee)}
            </p>
            <p><span className="status-pill">{item.students.length} hoc sinh</span></p>
          </article>
        ))}
      </section>

      <section className="section table-card">
        <p className="eyebrow">Attendance source</p>
        <h2>Danh sach hoc sinh dang hoc</h2>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Lop</th><th>Hoc sinh</th><th>Dien thoai</th><th>Giam gia</th><th>Status</th></tr></thead>
            <tbody>
              {studentsByClass.map((student) => (
                <tr key={student.enrollmentId}>
                  <td>{student.className}</td>
                  <td>{student.fullName}</td>
                  <td>{student.phone || "-"}</td>
                  <td>{Math.round(Number(student.discountRate || 0) * 100)}%</td>
                  <td><span className="status-pill">{student.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
