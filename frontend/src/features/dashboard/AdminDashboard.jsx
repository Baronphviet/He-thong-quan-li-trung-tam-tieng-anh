import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <p className="eyebrow">Bảng điều khiển</p>
        <h1>Tổng quan quản trị</h1>
        <p className="lead">Admin quản lý lớp, tài khoản, học phí và gán giáo viên. Điểm danh do giáo viên thực hiện.</p>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu" onClose={() => setError("")}>{error}</Alert>}

      <section className="section grid four">
        <MetricCard label="Học sinh" value={summary?.activeStudents ?? "-"} />
        <MetricCard label="Giáo viên" value={summary?.activeTeachers ?? "-"} />
        <MetricCard label="Lớp đang mở" value={summary?.openClasses ?? "-"} />
        <MetricCard label="Học sinh tham gia" value={summary?.activeEnrollments ?? "-"} />
      </section>

      <section className="section grid two">
        <Card title="Nhanh trong tháng">
          <p>Thực thu: <strong>{summary ? formatMoney(summary.monthCollected) : "-"}</strong></p>
          <p>Công nợ: <strong>{summary ? formatMoney(summary.monthOutstanding) : "-"}</strong></p>
        </Card>
        <Card title="Quản lý nhanh">
          <div className="quick-actions">
            <Link to="/admin/accounts">Tài khoản người dùng</Link>
            <Link to="/admin/classes">Quản lý lớp & gán giáo viên</Link>
            <Link to="/admin/students">Quản lý học sinh</Link>
            <Link to="/admin/payments">Ghi nhận thanh toán</Link>
            <Link to="/admin/statistics">Thống kê tài chính</Link>
            <Link to="/admin/announcements">Banner thông báo</Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
