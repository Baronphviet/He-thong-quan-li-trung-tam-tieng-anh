import { useEffect, useState } from "react";
import { dashboardService } from "../../services";
import { Alert, Card, Loading } from "../../components/common";
import { formatMoney } from "../../utils/format";
import { getApiErrorMessage } from "../../utils/apiError";

function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}

export default function StatisticsPage() {
  const [stats, setStats] = useState(null);
  const [finance, setFinance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [statsData, financeData] = await Promise.all([
        dashboardService.getStatistics(),
        dashboardService.getFinanceProfit()
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
        <p className="eyebrow">Thống kê tài chính</p>
        <h1>Báo cáo thu chi và vận hành</h1>
        <p className="lead">Theo dõi học phí đã thu, lương đã trả, lợi nhuận và quy mô trung tâm.</p>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu">{error}</Alert>}

      <section className="section grid four">
        <MetricCard label="Học sinh" value={stats?.activeStudents ?? "-"} />
        <MetricCard label="Giáo viên" value={stats?.activeTeachers ?? "-"} />
        <MetricCard label="Lớp học" value={stats?.totalClasses ?? "-"} />
        <MetricCard label="Học sinh đang học" value={stats?.activeEnrollments ?? "-"} />
      </section>

      <section className="section grid three">
        <MetricCard label="Đã thu học phí" value={stats ? formatMoney(stats.totalTuitionCollected) : "-"} />
        <MetricCard label="Đã trả lương" value={stats ? formatMoney(stats.totalSalaryPaid) : "-"} />
        <MetricCard label="Lợi nhuận" value={stats ? formatMoney(stats.profit) : "-"} />
      </section>

      <section className="section grid two">
        <Card title="Tình hình tháng hiện tại">
          <div className="finance-list">
            <p>Thực thu: <strong>{stats ? formatMoney(stats.monthCollected) : "-"}</strong></p>
            <p>Công nợ: <strong>{stats ? formatMoney(stats.monthOutstanding) : "-"}</strong></p>
            <p>Chi lương dự kiến: <strong>{stats ? formatMoney(stats.monthTeacherSalaryCost) : "-"}</strong></p>
            <p>Lớp đang mở: <strong>{stats?.openClasses ?? "-"}</strong></p>
          </div>
        </Card>

        <Card title="Lợi nhuận theo tháng">
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Kỳ</th><th>Thu học phí</th><th>Chi lương</th><th>Lợi nhuận</th></tr>
              </thead>
              <tbody>
                {finance.length === 0 && (
                  <tr><td colSpan={4} className="muted">Chưa có dữ liệu.</td></tr>
                )}
                {finance.map((item) => (
                  <tr key={item.id || `${item.year}-${item.month}`}>
                    <td>{item.month}/{item.year}</td>
                    <td className="text-success">{formatMoney(item.tuitionCollected)}</td>
                    <td className="text-danger">{formatMoney(item.teacherSalaryCost)}</td>
                    <td>{formatMoney(item.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </main>
  );
}
