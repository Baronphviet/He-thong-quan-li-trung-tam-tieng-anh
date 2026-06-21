import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../services/apiClient";
import { useAuth } from "../store";
import { formatMoney } from "../utils/format";
import { sameId } from "../utils/auth";
import { getApiErrorMessage } from "../utils/apiError";
import { Alert, Loading, Button } from "../components/common";
import ClassDetailsModal from "../features/classes/ClassDetailsModal";

export default function ParentDashboardPage() {
  const { role, userId } = useAuth();
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsClassId, setDetailsClassId] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadParentData();
  }, [role, userId]);

  async function loadParentData() {
    setLoading(true);
    setError("");
    try {
      const [feeData, parents, studentClassData] = await Promise.all([
        apiGet("/monthly-fees"),
        apiGet("/parents"),
        apiGet("/reports/students-by-class")
      ]);

      const allFees = Array.isArray(feeData) ? feeData : [];
      const allEnrollments = Array.isArray(studentClassData) ? studentClassData : [];
      if (role === "PARENT") {
        const parent = (Array.isArray(parents) ? parents : []).find((item) => sameId(item.id, userId));
        const studentIds = new Set(parent?.studentIds || []);
        setFees(allFees.filter((fee) => studentIds.has(fee.studentId)));
        setEnrollments(allEnrollments.filter((item) => studentIds.has(item.studentId)));
      } else {
        setFees(allFees);
        setEnrollments(allEnrollments);
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const outstanding = useMemo(
    () => fees.reduce((total, fee) => total + Number(fee.outstandingAmount || 0), 0),
    [fees]
  );

  const tuitionAlerts = useMemo(
    () => fees.filter((fee) => fee.status === "UNPAID" || fee.status === "PARTIAL"),
    [fees]
  );

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Cổng phụ huynh</p>
        <h1>Theo dõi học phí và công nợ của con.</h1>
        <p className="lead">Hệ thống tự hiển thị nhắc nhở khi còn học phí cần đóng.</p>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu">{error}</Alert>}

      {tuitionAlerts.length > 0 && (
        <section className="section tuition-alerts">
          {tuitionAlerts.map((fee) => (
            <Alert key={fee.id} type="warning" title={`Nhắc đóng học phí - ${fee.studentName}`}>
              Học sinh <strong>{fee.studentName}</strong> lớp <strong>{fee.className}</strong> kỳ {fee.month}/{fee.year}
              còn nợ <strong>{formatMoney(fee.outstandingAmount)}</strong>. Hạn đóng: {fee.dueDate || "theo quy định trung tâm"}.
            </Alert>
          ))}
        </section>
      )}

      <section className="section grid three">
        <article className="metric-card">
          <p className="metric-label">Tổng còn nợ</p>
          <p className="metric-value">{formatMoney(outstanding)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Số hóa đơn</p>
          <p className="metric-value">{fees.length}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Cần thanh toán</p>
          <p className="metric-value">{tuitionAlerts.length}</p>
        </article>
      </section>

      <section className="section table-card">
        <p className="eyebrow">Học phí</p>
        <h2>Chi tiết hóa đơn</h2>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Học sinh</th><th>Lớp</th><th>Kỳ</th><th>Cần thu</th><th>Còn nợ</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {fees.length === 0 && (
                <tr><td colSpan={6} className="muted">Chưa có hóa đơn học phí.</td></tr>
              )}
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

      <section className="section table-card">
        <h2>Lớp của học sinh</h2>
        <div className="table-scroll">
          <table>
            <thead><tr><th>Học sinh</th><th>Lớp</th><th>Trạng thái</th><th>Giảm giá</th><th>Hành động</th></tr></thead>
            <tbody>
              {enrollments.length === 0 && (
                <tr><td colSpan={5} className="muted">Chưa có lớp đang học.</td></tr>
              )}
              {enrollments.map((item) => (
                <tr key={item.enrollmentId}>
                  <td>{item.fullName}</td>
                  <td>{item.className}</td>
                  <td><span className="status-pill">{item.status}</span></td>
                  <td>{Math.round(Number(item.discountRate || 0) * 100)}%</td>
                  <td>
                    <Button variant="secondary" size="sm" type="button" onClick={() => setDetailsClassId(item.classId)}>
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ClassDetailsModal
        isOpen={!!detailsClassId}
        classId={detailsClassId}
        onClose={() => setDetailsClassId(null)}
      />
    </main>
  );
}
