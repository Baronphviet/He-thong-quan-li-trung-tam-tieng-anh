import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../services/apiClient";
import { formatMoney } from "../utils/format";

export default function ParentDashboardPage() {
  const [fees, setFees] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet("/monthly-fees"),
      apiGet("/public/announcements")
    ])
      .then(([feeData, announcementData]) => {
        setFees(feeData);
        setAnnouncements(announcementData);
      })
      .catch((err) => setError(err.message));
  }, []);

  const outstanding = useMemo(
    () => fees.reduce((total, fee) => total + Number(fee.outstandingAmount || 0), 0),
    [fees]
  );

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Parent portal</p>
        <h1>Theo doi hoc phi, cong no va thong bao cua trung tam.</h1>
        <p className="lead">
          Phu huynh co the xem invoice, so tien da dong va so con thieu. Chuc nang thanh
          toan that nam o API `/payments`, dashboard admin dang su dung cung endpoint nay.
        </p>
      </section>

      {error && <p className="message error">{error}</p>}

      <section className="section grid three">
        <article className="metric-card">
          <p className="metric-label">Tong con no</p>
          <p className="metric-value">{formatMoney(outstanding)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">So invoice</p>
          <p className="metric-value">{fees.length}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Thong bao</p>
          <p className="metric-value">{announcements.length}</p>
        </article>
      </section>

      <section className="section table-card">
        <p className="eyebrow">UC-P03</p>
        <h2>Hoc phi cua hoc sinh</h2>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Hoc sinh</th><th>Lop</th><th>Ky</th><th>Can thu</th><th>Con no</th><th>Status</th></tr></thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td>{fee.studentName}</td>
                  <td>{fee.className}</td>
                  <td>{fee.month}/{fee.year}</td>
                  <td>{formatMoney(fee.finalAmount)}</td>
                  <td>{formatMoney(fee.outstandingAmount)}</td>
                  <td><span className={`status-pill ${fee.status === "UNPAID" ? "danger" : fee.status === "PARTIAL" ? "warn" : ""}`}>{fee.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section grid two">
        {announcements.map((item) => (
          <article className="panel" key={item.id}>
            <p className="eyebrow">{item.type}</p>
            <h2>{item.title}</h2>
            <p className="lead">{item.content}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
