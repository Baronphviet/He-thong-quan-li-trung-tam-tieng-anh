import { useEffect, useState, useMemo } from "react";
import { apiGet, apiPost } from "../../services/apiClient";
import { Alert, Button, Input, Loading, Modal, Select, Table } from "../../components/common";
import { useNotification } from "../../hooks";
import { formatMoney } from "../../utils/format";

export default function TeacherSalaryPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addNotification } = useNotification();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formValues, setFormValues] = useState({ totalSessions: 0, amount: 0, status: "PENDING", note: "" });

  useEffect(() => {
    loadSalaries();
  }, [month, year]);

  async function loadSalaries() {
    setLoading(true);
    setError("");
    try {
      const data = await apiGet(`/teacher-salary?month=${month}&year=${year}`);
      setSalaries(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(row) {
    setEditingRow(row);
    setFormValues({
      totalSessions: row.totalSessions || 0,
      amount: row.amount || row.salaryRate || 0,
      status: row.status || "PENDING",
      note: row.note || ""
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingRow?.status === "PAID") {
      addNotification("Khoản lương đã thanh toán không thể chỉnh sửa", "error");
      return;
    }
    if (formValues.status === "PAID" && editingRow?.status !== "PAID") {
      const confirmPaid = window.confirm("Bạn có chắc chắn muốn thanh toán khoản lương này không? Hành động này không thể hoàn tác.");
      if (!confirmPaid) return;
    }
    try {
      await apiPost("/teacher-salary", {
        teacherId: editingRow.teacherId,
        month,
        year,
        totalSessions: Number(formValues.totalSessions),
        amount: Number(formValues.amount),
        status: formValues.status,
        note: formValues.note
      });
      addNotification("Cập nhật lương thành công!", "success");
      setModalOpen(false);
      loadSalaries();
    } catch (err) {
      addNotification(err.message, "error");
    }
  }

  const columns = useMemo(() => [
    { key: "teacherName", label: "Giáo viên" },
    { key: "salaryRate", label: "Lương cơ bản", render: (value) => formatMoney(value) },
    { key: "totalSessions", label: "Số buổi dạy" },
    { key: "amount", label: "Thực lĩnh", render: (value) => formatMoney(value) },
    { key: "status", label: "Trạng thái", render: (value) => <span className={`status-pill ${value === "PENDING" ? "warning" : "success"}`}>{value === "PENDING" ? "Chưa thanh toán" : "Đã thanh toán"}</span> },
    { key: "paidDate", label: "Ngày trả", render: (value) => value ? new Date(value).toLocaleDateString("vi-VN") : "-" },
    {
      key: "actions",
      label: "Hành động",
      render: (_, row) => (
        <Button variant="secondary" size="sm" type="button" onClick={() => handleEdit(row)}>
          Cập nhật
        </Button>
      )
    }
  ], []);

  if (loading && salaries.length === 0) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <p className="eyebrow">Quản lý lương</p>
        <h1>Bảng lương giáo viên</h1>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu">{error}</Alert>}

      <section className="section">
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: 700 }}>Tháng</label>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input-field" style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff" }}>
                {Array.from({ length: 12 }).map((_, i) => <option key={i+1} value={i+1}>Tháng {i+1}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "0.85rem", fontWeight: 700 }}>Năm</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field" style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--line)", background: "#fff", width: "100px" }} />
            </div>
          </div>
          <div style={{ background: "var(--surface)", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--line)" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: "bold" }}>TỔNG LƯƠNG CHƯA THANH TOÁN:</span>
            <span style={{ marginLeft: "10px", fontSize: "1.1rem", fontWeight: "bold", color: "var(--error)" }}>
              {formatMoney(salaries.filter(s => s.status !== "PAID").reduce((sum, s) => sum + (s.amount || s.salaryRate || 0), 0))}
            </span>
          </div>
        </div>

        <div className="table-card">
          <Table columns={columns} data={salaries} empty="Không có giáo viên nào" />
        </div>
      </section>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Cập nhật lương: ${editingRow?.teacherName} (${month}/${year})`}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Input label="Số buổi dạy" type="number" value={formValues.totalSessions} onChange={(e) => setFormValues({...formValues, totalSessions: e.target.value})} disabled={editingRow?.status === "PAID"} />
          <Input label="Số tiền thanh toán" type="number" value={formValues.amount} onChange={(e) => setFormValues({...formValues, amount: e.target.value})} disabled={editingRow?.status === "PAID"} />
          <Select label="Trạng thái" options={[{value: "PENDING", label: "Chưa thanh toán"}, {value: "PAID", label: "Đã thanh toán"}]} value={formValues.status} onChange={(e) => setFormValues({...formValues, status: e.target.value})} disabled={editingRow?.status === "PAID"} />
          <Input label="Ghi chú" value={formValues.note} onChange={(e) => setFormValues({...formValues, note: e.target.value})} disabled={editingRow?.status === "PAID"} />
          
          {editingRow?.status === "PAID" && (
            <Alert type="warning" title="Không thể sửa đổi">
              Khoản lương này đã được thanh toán và không thể chỉnh sửa hay quay lại trạng thái chưa thanh toán.
            </Alert>
          )}

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Hủy</Button>
            {editingRow?.status !== "PAID" && <Button type="submit">Lưu thay đổi</Button>}
          </div>
        </form>
      </Modal>
    </main>
  );
}
