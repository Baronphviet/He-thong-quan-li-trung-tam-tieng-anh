import { useEffect, useState } from "react";
import { Alert, Button, Card, Input, Loading, Table, Modal } from "../../components/common";
import { masterService } from "../../services";
import { useNotification } from "../../hooks";

export default function MasterDataPage() {
  const [academicYears, setAcademicYears] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addNotification } = useNotification();

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

  async function handleDeleteYear(id) {
    if (!window.confirm("Bạn có chắc chắn muốn xoá năm học này không?")) return;
    try {
      await masterService.deleteAcademicYear(id);
      addNotification("Xoá năm học thành công", "success");
      loadData();
    } catch (err) {
      addNotification(err.message || "Không thể xoá năm học (Có thể do đã có lớp học tham chiếu)", "error");
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

  async function handleDeleteAge(id) {
    if (!window.confirm("Bạn có chắc chắn muốn xoá độ tuổi này không?")) return;
    try {
      await masterService.deleteAgeGroup(id);
      addNotification("Xoá độ tuổi thành công", "success");
      loadData();
    } catch (err) {
      addNotification(err.message || "Không thể xoá độ tuổi (Có thể do đã có lớp học tham chiếu)", "error");
    }
  }

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <p className="eyebrow">Quản trị</p>
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
            
            <table className="table" style={{ width: "100%" }}>
              <thead><tr><th>Năm học</th><th>Bắt đầu</th><th>Kết thúc</th><th>Hành động</th></tr></thead>
              <tbody>
                {academicYears.length === 0 && <tr><td colSpan={4} className="muted">Chưa có dữ liệu</td></tr>}
                {academicYears.map(item => (
                  <tr key={item.id}>
                    <td>{item.yearName}</td>
                    <td>{item.startDate}</td>
                    <td>{item.endDate}</td>
                    <td>
                      <Button variant="danger" size="sm" type="button" onClick={() => handleDeleteYear(item.id)}>Xoá</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            
            <table className="table" style={{ width: "100%" }}>
              <thead><tr><th>Nhóm tuổi</th><th>Mô tả</th><th>Hành động</th></tr></thead>
              <tbody>
                {ageGroups.length === 0 && <tr><td colSpan={3} className="muted">Chưa có dữ liệu</td></tr>}
                {ageGroups.map(item => (
                  <tr key={item.id}>
                    <td>{item.groupName}</td>
                    <td>{item.description || "-"}</td>
                    <td>
                      <Button variant="danger" size="sm" type="button" onClick={() => handleDeleteAge(item.id)}>Xoá</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </section>
    </main>
  );
}
