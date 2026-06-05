import { useEffect, useState } from "react";
import { apiGet } from "../services/apiClient";
import { formatMoney } from "../utils/format";

export default function StudentDashboardPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [fees, setFees] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet("/reports/students-by-class"),
      apiGet("/monthly-fees")
    ])
      .then(([studentClassData, feeData]) => {
        setEnrollments(studentClassData);
        setFees(feeData);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Student portal</p>
        <h1>Lop dang hoc va tinh trang hoc phi.</h1>
        <p className="lead">
          Ban demo hien tat ca hoc sinh trong seed data. Khi them Spring Security/JWT,
          backend chi can loc theo user dang dang nhap.
        </p>
      </section>

      {error && <p className="message error">{error}</p>}

      <section className="section table-card">
        <p className="eyebrow">UC-S01</p>
        <h2>Lop cua hoc sinh</h2>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Hoc sinh</th><th>Lop</th><th>Status</th><th>Giam gia</th></tr></thead>
            <tbody>
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

      <section className="section grid three">
        {fees.map((fee) => (
          <article className="panel" key={fee.id}>
            <p className="eyebrow">Invoice #{fee.id}</p>
            <h2>{fee.studentName}</h2>
            <p className="lead">
              {fee.className} - {fee.month}/{fee.year}<br />
              Can thu: {formatMoney(fee.finalAmount)}<br />
              Da dong: {formatMoney(fee.paidAmount)}
            </p>
            <span className={`status-pill ${fee.status === "UNPAID" ? "danger" : fee.status === "PARTIAL" ? "warn" : ""}`}>{fee.status}</span>
          </article>
        ))}
      </section>
    </main>
  );
}
