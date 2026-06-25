import { useEffect, useState } from "react";
import { Alert, Button, Card, Input, Loading, Table, Modal } from "../../components/common";
import { masterService } from "../../services";
import { useNotification } from "../../hooks";
import { useAuth } from "../../store";

export default function MasterDataPage() {
  const [academicYears, setAcademicYears] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addNotification } = useNotification();
  const { role } = useAuth();

  const [confirmDeleteYearOpen, setConfirmDeleteYearOpen] = useState(false);
  const [pendingDeleteYear, setPendingDeleteYear] = useState(null);

  const [confirmDeleteAgeOpen, setConfirmDeleteAgeOpen] = useState(false);
  const [pendingDeleteAge, setPendingDeleteAge] = useState(null);

  const [yearForm, setYearForm] = useState({ yearName: "", startDate: "", endDate: "", active: true });
  const [ageForm, setAgeForm] = useState({ groupName: "", description: "" });
  const [submittingYear, setSubmittingYear] = useState(false);
  const [submittingAge, setSubmittingAge] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [yearsRes, ageRes] = await Promise.all([
        masterService.getAcademicYears(),
        masterService.getAgeGroups()
      ]);
      setAcademicYears(Array.isArray(yearsRes) ? yearsRes : []);
      setAgeGroups(Array.isArray(ageRes) ? ageRes : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateYear(e) {
    e.preventDefault();
    if (!yearForm.yearName || !yearForm.startDate || !yearForm.endDate) {
      addNotification("Vui lòng điền đủ thông tin năm học", "warning");
      return;
    }
    setSubmittingYear(true);
    try {
      await masterService.createAcademicYear(yearForm);
      addNotification("Thêm năm học thành công", "success");
      setYearForm({ yearName: "", startDate: "", endDate: "", active: true });
      loadData();
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setSubmittingYear(false);
    }
  }

  function handleDeleteYear(item) {
    if (role !== "ADMIN") {
      addNotification("Chỉ có ADMIN mới có quyền xóa năm học", "error");
      return;
    }
    setPendingDeleteYear(item);
    setConfirmDeleteYearOpen(true);
  }

  async function executeDeleteYear() {
    if (!pendingDeleteYear) return;
    try {
      await masterService.deleteAcademicYear(pendingDeleteYear.id);
      addNotification("Xoá năm học thành công", "success");
      setConfirmDeleteYearOpen(false);
      setPendingDeleteYear(null);
      loadData();
    } catch (err) {
      addNotification(err.message || "Không thể xoá năm học (Có thể do đã có lớp học tham chiếu)", "error");
      setConfirmDeleteYearOpen(false);
      setPendingDeleteYear(null);
    }
  }

  async function handleCreateAge(e) {
    e.preventDefault();
    if (!ageForm.groupName) {
      addNotification("Tên độ tuổi không được để trống", "warning");
      return;
    }
    setSubmittingAge(true);
    try {
      await masterService.createAgeGroup(ageForm);
      addNotification("Thêm độ tuổi thành công", "success");
      setAgeForm({ groupName: "", description: "" });
      loadData();
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setSubmittingAge(false);
    }
  }

  function handleDeleteAge(item) {
    if (role !== "ADMIN") {
      addNotification("Chỉ có ADMIN mới có quyền xóa độ tuổi", "error");
      return;
    }
    setPendingDeleteAge(item);
    setConfirmDeleteAgeOpen(true);
  }

  async function executeDeleteAge() {
    if (!pendingDeleteAge) return;
    try {
      await masterService.deleteAgeGroup(pendingDeleteAge.id);
      addNotification("Xoá độ tuổi thành công", "success");
      setConfirmDeleteAgeOpen(false);
      setPendingDeleteAge(null);
      loadData();
    } catch (err) {
      addNotification(err.message || "Không thể xoá độ tuổi (Có thể do đã có lớp học tham chiếu)", "error");
      setConfirmDeleteAgeOpen(false);
      setPendingDeleteAge(null);
    }
  }

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <h1>Dữ liệu danh mục</h1>
        <p className="lead">Quản lý Năm học và Độ tuổi</p>
      </section>

      {error && <Alert type="error" title="Lỗi">{error}</Alert>}

      <section className="section grid two">
        <div>
          <Card title="Năm học">
            <form onSubmit={handleCreateYear} style={{ marginBottom: "20px" }}>
              <div className="form-grid">
                <Input label="Tên năm học (VD: 2026-2027)" value={yearForm.yearName} onChange={e => setYearForm({...yearForm, yearName: e.target.value})} />
                <Input type="date" label="Ngày bắt đầu" value={yearForm.startDate} onChange={e => setYearForm({...yearForm, startDate: e.target.value})} />
                <Input type="date" label="Ngày kết thúc" value={yearForm.endDate} onChange={e => setYearForm({...yearForm, endDate: e.target.value})} />
              </div>
              <Button type="submit" disabled={submittingYear} style={{ marginTop: "10px" }}>{submittingYear ? "Đang xử lý..." : "Thêm Năm học"}</Button>
            </form>
            
            <div className="table-scroll">
              <table className="table" style={{ width: "100%", minWidth: "auto" }}>
                <thead><tr><th>Năm học</th><th>Bắt đầu</th><th>Kết thúc</th><th>Hành động</th></tr></thead>
                <tbody>
                  {academicYears.length === 0 && <tr><td colSpan={4} className="muted">Chưa có dữ liệu</td></tr>}
                  {academicYears.map(item => (
                    <tr key={item.id}>
                      <td>{item.yearName}</td>
                      <td>{item.startDate}</td>
                      <td>{item.endDate}</td>
                      <td>
                        {role === "ADMIN" && (
                          <Button variant="danger" size="sm" type="button" onClick={() => handleDeleteYear(item)}>Xoá</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card title="Độ tuổi">
            <form onSubmit={handleCreateAge} style={{ marginBottom: "20px" }}>
              <div className="form-grid">
                <Input label="Tên nhóm tuổi (VD: 5-7 tuổi)" value={ageForm.groupName} onChange={e => setAgeForm({...ageForm, groupName: e.target.value})} />
                <Input label="Mô tả" value={ageForm.description} onChange={e => setAgeForm({...ageForm, description: e.target.value})} />
              </div>
              <Button type="submit" disabled={submittingAge} style={{ marginTop: "10px" }}>{submittingAge ? "Đang xử lý..." : "Thêm Độ tuổi"}</Button>
            </form>
            
            <div className="table-scroll">
              <table className="table" style={{ width: "100%", minWidth: "auto" }}>
                <thead><tr><th>Nhóm tuổi</th><th>Mô tả</th><th>Hành động</th></tr></thead>
                <tbody>
                  {ageGroups.length === 0 && <tr><td colSpan={3} className="muted">Chưa có dữ liệu</td></tr>}
                  {ageGroups.map(item => (
                    <tr key={item.id}>
                      <td>{item.groupName}</td>
                      <td>{item.description || "-"}</td>
                      <td>
                        {role === "ADMIN" && (
                          <Button variant="danger" size="sm" type="button" onClick={() => handleDeleteAge(item)}>Xoá</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </section>

      <Modal
        isOpen={confirmDeleteYearOpen}
        onClose={() => { setConfirmDeleteYearOpen(false); setPendingDeleteYear(null); }}
        title="Xác nhận xóa năm học"
        size="md"
        footer={(
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", width: "100%" }}>
            <Button variant="secondary" type="button" onClick={() => { setConfirmDeleteYearOpen(false); setPendingDeleteYear(null); }}>Hủy</Button>
            <Button
              type="button"
              onClick={executeDeleteYear}
              style={{ backgroundColor: "#dc3545", color: "#fff", borderColor: "#dc3545" }}
            >
              Xác nhận xóa
            </Button>
          </div>
        )}
      >
        <div style={{ padding: "8px 0", fontSize: "0.95rem", lineHeight: "1.5", color: "#333" }}>
          Bạn có chắc chắn muốn xóa năm học <strong>{pendingDeleteYear?.yearName}</strong> không?
          <br />
          <span style={{ color: "#d9534f", fontSize: "0.85rem", display: "block", marginTop: "8px" }}>
            * Lưu ý: Thao tác này không thể hoàn tác và chỉ có thể thực hiện nếu chưa có lớp học nào liên kết với năm học này.
          </span>
        </div>
      </Modal>

      <Modal
        isOpen={confirmDeleteAgeOpen}
        onClose={() => { setConfirmDeleteAgeOpen(false); setPendingDeleteAge(null); }}
        title="Xác nhận xóa nhóm tuổi"
        size="md"
        footer={(
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", width: "100%" }}>
            <Button variant="secondary" type="button" onClick={() => { setConfirmDeleteAgeOpen(false); setPendingDeleteAge(null); }}>Hủy</Button>
            <Button
              type="button"
              onClick={executeDeleteAge}
              style={{ backgroundColor: "#dc3545", color: "#fff", borderColor: "#dc3545" }}
            >
              Xác nhận xóa
            </Button>
          </div>
        )}
      >
        <div style={{ padding: "8px 0", fontSize: "0.95rem", lineHeight: "1.5", color: "#333" }}>
          Bạn có chắc chắn muốn xóa nhóm tuổi <strong>{pendingDeleteAge?.groupName}</strong> không?
          <br />
          <span style={{ color: "#d9534f", fontSize: "0.85rem", display: "block", marginTop: "8px" }}>
            * Lưu ý: Thao tác này không thể hoàn tác và chỉ có thể thực hiện nếu chưa có lớp học nào liên kết với nhóm tuổi này.
          </span>
        </div>
      </Modal>
    </main>
  );
}
