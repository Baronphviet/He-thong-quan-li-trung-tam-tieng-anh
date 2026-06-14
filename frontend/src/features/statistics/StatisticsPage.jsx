import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Alert, Card, Loading } from "../../components/common";
import { formatMoney } from "../../utils/format";
import { getApiErrorMessage } from "../../utils/apiError";
import { dashboardService } from "../../services";

const COLORS = {
  tuition: "#1f6f50",
  salary:  "#d46a2f",
  profit:  "#2d6f9f",
};

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}

function Legend({ items }) {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 12, fontSize: "0.78rem" }}>
      {items.map((l) => (
        <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--muted)" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
          {l.label}
        </span>
      ))}
    </div>
  );
}

function BarChartCard({ finance }) {
  const data = finance.map((r) => ({
    name:    `T${r.month}/${String(r.year).slice(-2)}`,
    tuition: +(r.tuitionCollected / 1_000_000).toFixed(1),
    salary:  +(r.teacherSalaryCost / 1_000_000).toFixed(1),
    profit:  +(r.profit / 1_000_000).toFixed(1),
  }));

  return (
    <Card title="Lợi nhuận theo tháng">
      <Legend items={[
        { color: COLORS.tuition, label: "Thu học phí" },
        { color: COLORS.salary,  label: "Chi lương" },
        { color: COLORS.profit,  label: "Lợi nhuận" },
      ]} />
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#667368" }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => `${v}M`} tick={{ fontSize: 11, fill: "#667368" }} tickLine={false} axisLine={false} />
          <Tooltip formatter={(v, key) => [
            `${v}M ₫`,
            key === "tuition" ? "Thu học phí" : key === "salary" ? "Chi lương" : "Lợi nhuận"
          ]} />
          <Bar dataKey="tuition" fill={COLORS.tuition} radius={[4, 4, 0, 0]} />
          <Bar dataKey="salary"  fill={COLORS.salary}  radius={[4, 4, 0, 0]} />
          <Bar dataKey="profit"  fill={COLORS.profit}  radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function DonutChartCard({ stats }) {
  const salaryTotal = stats?.totalSalaryPaid ?? 0;
  const profitTotal = stats?.profit ?? 0;
  const total       = salaryTotal + profitTotal;
  const salaryPct   = total > 0 ? Math.round((salaryTotal / total) * 100) : 0;
  const profitPct   = 100 - salaryPct;

  const data = [
    { name: `Chi lương`,  value: salaryPct, color: COLORS.salary  },
    { name: `Lợi nhuận`, value: profitPct, color: COLORS.tuition },
  ];

  return (
    <Card title="Phân bổ tài chính">
      <Legend items={[
        { color: COLORS.salary,  label: `Chi lương ${salaryPct}%` },
        { color: COLORS.tuition, label: `Lợi nhuận ${profitPct}%` },
      ]} />
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius="58%" outerRadius="80%" paddingAngle={3}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v, name) => [`${v}%`, name]} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

function LineChartCard({ finance }) {
  const data = finance.map((r) => ({
    name:    `T${r.month}/${String(r.year).slice(-2)}`,
    tuition: +(r.tuitionCollected / 1_000_000).toFixed(1),
  }));

  return (
    <Card title="Xu hướng thu học phí">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#667368" }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => `${v}M`} tick={{ fontSize: 11, fill: "#667368" }} tickLine={false} axisLine={false} />
          <Tooltip formatter={(v) => [`${v}M ₫`, "Thu học phí"]} />
          <Line
            type="monotone"
            dataKey="tuition"
            stroke={COLORS.tuition}
            strokeWidth={2}
            dot={{ r: 4, fill: COLORS.tuition }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default function StatisticsPage() {
  const [stats, setStats]     = useState(null);
  const [finance, setFinance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [statsData, financeData] = await Promise.all([
        dashboardService.getStatistics(),
        dashboardService.getFinanceProfit(),
      ]);
      setStats(statsData);
      setFinance(Array.isArray(financeData) ? financeData : []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <p className="eyebrow">📊 Thống kê tài chính</p>
        <h1>Báo cáo thu chi và vận hành</h1>
        <p className="lead">Theo dõi học phí đã thu, lương đã trả, lợi nhuận và quy mô trung tâm.</p>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu">{error}</Alert>}

      <section className="section grid four">
        <MetricCard label="Học sinh"          value={stats?.activeStudents ?? "-"} />
        <MetricCard label="Giáo viên"         value={stats?.activeTeachers ?? "-"} />
        <MetricCard label="Lớp học"           value={stats?.totalClasses ?? "-"} />
        <MetricCard label="Học sinh đang học" value={stats?.activeEnrollments ?? "-"} />
      </section>

      <section className="section grid three">
        <MetricCard label="Đã thu học phí" value={stats ? formatMoney(stats.totalTuitionCollected) : "-"} />
        <MetricCard label="Đã trả lương"   value={stats ? formatMoney(stats.totalSalaryPaid) : "-"} />
        <MetricCard label="Lợi nhuận"      value={stats ? formatMoney(stats.profit) : "-"} />
      </section>

      {finance.length > 0 && (
        <>
          <section className="section grid two">
            <BarChartCard finance={finance} />
            <DonutChartCard stats={stats} />
          </section>
          <section className="section">
            <LineChartCard finance={finance} />
          </section>
        </>
      )}

      <section className="section grid two">
        <Card title="Tình hình tháng hiện tại">
          <div className="finance-list">
            <p>Thực thu: <strong>{stats ? formatMoney(stats.monthCollected) : "-"}</strong></p>
            <p>Công nợ: <strong>{stats ? formatMoney(stats.monthOutstanding) : "-"}</strong></p>
            <p>Chi lương dự kiến: <strong>{stats ? formatMoney(stats.monthTeacherSalaryCost) : "-"}</strong></p>
            <p>Lớp đang mở: <strong>{stats?.openClasses ?? "-"}</strong></p>
          </div>
        </Card>
      </section>
    </main>
  );
}