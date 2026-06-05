import { useEffect, useState } from "react";
import { apiGet } from "../services/apiClient";
import { formatMoney } from "../utils/format";

export default function HomePage() {
  const [summary, setSummary] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet("/dashboard/summary"),
      apiGet("/public/announcements")
    ])
      .then(([summaryData, announcementData]) => {
        setSummary(summaryData);
        setAnnouncements(announcementData);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Master Design MVP</p>
        <h1>Quan ly trung tam tieng Anh bang mot luong du lieu thong nhat.</h1>
        <p className="lead">
          Website nay ket noi truc tiep backend Spring Boot: lop hoc, hoc sinh, phu huynh,
          hoc phi, thanh toan va view thong ke deu chay tren database that.
        </p>
      </section>

      {error && <p className="message error">Backend chua san sang: {error}</p>}

      <section className="section grid four">
        <Metric label="Hoc sinh active" value={summary?.activeStudents ?? "-"} />
        <Metric label="Lop dang mo" value={summary?.openClasses ?? "-"} />
        <Metric label="Thuc thu thang" value={summary ? formatMoney(summary.monthCollected) : "-"} />
        <Metric label="Cong no thang" value={summary ? formatMoney(summary.monthOutstanding) : "-"} />
      </section>

      <section className="section grid two">
        <div className="panel">
          <p className="eyebrow">Kien truc</p>
          <h2>JPA Service first, SQL View for reports.</h2>
          <p className="lead">
            CRUD va cac luong nghiep vu nhu tao enrollment, sinh monthly fee, cap nhat
            status thanh toan duoc xu ly trong service layer. Database chi giu bang va
            view bao cao phuc tap.
          </p>
        </div>

        <div className="panel">
          <div className="toolbar">
            <div>
              <p className="eyebrow">Thong bao hien hanh</p>
              <h2>Banner & popup</h2>
            </div>
          </div>
          <div className="banner-list">
            {announcements.length === 0 && <p className="muted">Chua co thong bao active.</p>}
            {announcements.map((item) => (
              <article className="banner-card" key={item.id}>
                <strong>{item.title}</strong>
                <span className="muted">{item.content}</span>
                <span className="status-pill">{item.type}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}
