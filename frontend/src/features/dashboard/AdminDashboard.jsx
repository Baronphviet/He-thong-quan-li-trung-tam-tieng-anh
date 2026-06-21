import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { dashboardService } from "../../services";
import { Alert, Card, Loading } from "../../components/common";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatMoney } from "../../utils/format";


function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}

const fmt = (v) => {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + "M";
  if (v >= 1_000)     return (v / 1_000).toFixed(0) + "K";
  return v;
};

const TooltipContent = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(255,250,240,0.97)", border: "1px solid var(--line)",
      borderRadius: 12, padding: "10px 14px", fontSize: "0.85rem",
    }}>
      <p style={{ margin: "0 0 6px", fontWeight: 700 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ margin: "2px 0", color: p.color }}>
          {p.name}: {formatMoney(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Dùng data tháng hiện tại từ summary để tạo biểu đồ đơn giản
  const chartData = summary ? [
    {
      name: "Tháng này",
      "Thực thu":  Number(summary.monthCollected          ?? 0),
      "Công nợ":   Number(summary.monthOutstanding         ?? 0),
      "Lương GV":  Number(summary.monthTeacherSalaryCost   ?? 0),
    }
  ] : [];

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <h1>Tổng quan quản trị</h1>
        <p className="lead">
          Quản lý lớp, tài khoản, học phí và gán giáo viên. Điểm danh do giáo viên thực hiện.
        </p>
      </section>

      {error && (
        <Alert type="error" title="Lỗi tải dữ liệu" onClose={() => setError("")}>{error}</Alert>
      )}

      {/* ── Metric cards ── */}
      <section className="section grid three">
        <MetricCard label="Học sinh"          value={summary?.activeStudents    ?? "-"} />
        <MetricCard label="Giáo viên"         value={summary?.activeTeachers    ?? "-"} />
        <MetricCard label="Lớp đang mở"       value={summary?.openClasses       ?? "-"} />
      </section>

      {/* ── Biểu đồ + tài chính tháng ── */}
      <section className="section grid two">
        <Card title="Thu học phí tháng này">
          <div style={{ height: 220, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(220,207,184,0.5)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={44} />
                <Tooltip content={<TooltipContent />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="Thực thu" fill="var(--brand)"  radius={[6, 6, 0, 0]} />
                <Bar dataKey="Công nợ"  fill="var(--accent)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Lương GV" fill="var(--blue)"   radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Chi tiết tài chính tháng này">
          <div style={{ display: "grid", gap: 10, marginTop: 4 }}>
            {[
              { label: "Dự kiến thu", value: summary?.monthExpected,           color: "var(--blue)"   },
              { label: "Thực thu",    value: summary?.monthCollected,           color: "var(--brand)"  },
              { label: "Công nợ",     value: summary?.monthOutstanding,         color: "var(--accent)" },
              { label: "Lương GV",    value: summary?.monthTeacherSalaryCost,   color: "var(--danger)" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", borderRadius: 14,
                border: "1px solid var(--line)", background: "#fffdf6",
              }}>
                <span style={{ color: "var(--muted)", fontSize: "0.88rem", fontWeight: 700 }}>{label}</span>
                <span style={{ color, fontWeight: 900, fontSize: "1rem" }}>
                  {value != null ? formatMoney(value) : "-"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}