import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Input, Loading, Modal, Select, Table } from "../../components/common";
import { adminService, parentService, studentService, teacherService, userService } from "../../services";
import { useNotification } from "../../hooks";

const roleOptions = [
  { value: "STUDENT", label: "Học sinh" },
  { value: "TEACHER", label: "Giáo viên" },
  { value: "PARENT", label: "Phụ huynh" },
  { value: "ADMIN", label: "Admin" }
];

const emptyForm = {
  role: "STUDENT",
  username: "",
  password: "",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  dateOfBirth: "",
  enrollDate: new Date().toISOString().slice(0, 10),
  degree: "",
  specialization: "",
  salaryRate: "",
  joinDate: "",
  zaloId: "",
  facebookId: "",
  relationship: ""
};

const servicesByRole = {
  ADMIN: adminService,
  TEACHER: teacherService,
  STUDENT: studentService,
  PARENT: parentService
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [values, setValues] = useState(emptyForm);
  const [linkForm, setLinkForm] = useState({ studentId: "", parentId: "" });
  const [passwordForm, setPasswordForm] = useState({ userId: null, fullName: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [linking, setLinking] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    setError("");
    const entries = Object.entries(servicesByRole);
    const results = await Promise.allSettled(entries.map(([, service]) => service.getAll()));
    const nextAccounts = [];
    const failed = [];

    results.forEach((result, index) => {
      const [role] = entries[index];
      if (result.status === "fulfilled") {
        nextAccounts.push(...(Array.isArray(result.value) ? result.value : []).map((item) => ({ ...item, role })));
      } else {
        failed.push(`${role}: ${result.reason.message}`);
      }
    });

    setAccounts(nextAccounts);
    setStudents(nextAccounts.filter((item) => item.role === "STUDENT"));
    setParents(nextAccounts.filter((item) => item.role === "PARENT"));
    if (failed.length) {
      setError(`Mot so danh sach tai khoan chua tai duoc. ${failed.join(" | ")}`);
    }
    setLoading(false);
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!values.username.trim() || !values.password.trim() || !values.fullName.trim()) {
      setError("Tài khoản, mật khẩu và họ tên là bắt buộc.");
      return;
    }

    const service = servicesByRole[values.role];
    setSubmitting(true);
    try {
      await service.create(toPayload(values));
      addNotification("Tạo tài khoản thành công", "success");
      setValues({ ...emptyForm, role: values.role });
      await loadAccounts();
    } catch (err) {
      setError(err.message);
      addNotification(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLinkParent(event) {
    event.preventDefault();
    if (!linkForm.studentId || !linkForm.parentId) {
      addNotification("Chọn học sinh và phụ huynh để liên kết.", "warning");
      return;
    }

    setLinking(true);
    try {
      await parentService.linkStudent({
        studentId: Number(linkForm.studentId),
        parentId: Number(linkForm.parentId)
      });
      addNotification("Liên kết phụ huynh - học sinh thành công", "success");
      setLinkForm({ studentId: "", parentId: "" });
      await loadAccounts();
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setLinking(false);
    }
  }

  function openPasswordModal(account) {
    setPasswordForm({ userId: account.id, fullName: account.fullName, password: "" });
    setPasswordModalOpen(true);
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    if (!passwordForm.password.trim()) {
      addNotification("Nhập mật khẩu mới.", "warning");
      return;
    }

    setPasswordSubmitting(true);
    try {
      await userService.changePassword(passwordForm.userId, passwordForm.password.trim());
      addNotification("Đổi mật khẩu thành công", "success");
      setPasswordModalOpen(false);
      await loadAccounts();
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setPasswordSubmitting(false);
    }
  }

  const columns = useMemo(() => [
    { key: "role", label: "Vai trò" },
    { key: "username", label: "Tài khoản" },
    { key: "password", label: "Mật khẩu", render: (value) => <code className="credential-code">{value || "-"}</code> },
    { key: "fullName", label: "Họ tên" },
    { key: "phone", label: "Điện thoại", render: (value) => value || "-" },
    { key: "active", label: "Trạng thái", render: (value) => <span className="status-pill">{value === false ? "INACTIVE" : "ACTIVE"}</span> },
    {
      key: "actions",
      label: "Hành động",
      render: (_, row) => (
        <Button variant="secondary" size="sm" type="button" onClick={() => openPasswordModal(row)}>
          Đổi mật khẩu
        </Button>
      )
    }
  ], []);

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <p className="eyebrow"> 👤 Quản lý tài khoản</p>
        <h1>Cấp tài khoản theo vai trò</h1>
        <p className="lead">Admin xem tài khoản/mật khẩu, đổi mật khẩu và liên kết phụ huynh với học sinh.</p>
      </section>

      {error && <Alert type="error" title="Cần kiểm tra" onClose={() => setError("")}>{error}</Alert>}

      <section className="section grid two">
        <Card title="Tài khoản mới">
          <form onSubmit={handleSubmit}>
            <Select id="role" label="Vai trò" name="role" value={values.role} onChange={handleChange} options={roleOptions} />
            <div className="form-grid">
              <Input id="username" label="Tài khoản" name="username" value={values.username} onChange={handleChange} />
              <Input id="password" label="Mật khẩu" name="password" type="text" value={values.password} onChange={handleChange} />
              <Input id="fullName" label="Họ tên" name="fullName" value={values.fullName} onChange={handleChange} />
              <Input id="phone" label="Điện thoại" name="phone" value={values.phone} onChange={handleChange} />
              <Input id="email" label="Email" name="email" type="email" value={values.email} onChange={handleChange} />
            </div>

            {values.role === "STUDENT" && (
              <div className="form-grid">
                <Input id="dateOfBirth" label="Ngày sinh" name="dateOfBirth" type="date" value={values.dateOfBirth} onChange={handleChange} />
                <Input id="enrollDate" label="Ngày nhập học" name="enrollDate" type="date" value={values.enrollDate} onChange={handleChange} />
                <Input id="address" label="Địa chỉ" name="address" value={values.address} onChange={handleChange} />
              </div>
            )}

            {values.role === "TEACHER" && (
              <div className="form-grid">
                <Input id="degree" label="Bằng cấp" name="degree" value={values.degree} onChange={handleChange} />
                <Input id="specialization" label="Chuyên môn" name="specialization" value={values.specialization} onChange={handleChange} />
                <Input id="salaryRate" label="Lương cơ bản" name="salaryRate" type="number" value={values.salaryRate} onChange={handleChange} />
                <Input id="joinDate" label="Ngày vào làm" name="joinDate" type="date" value={values.joinDate} onChange={handleChange} />
              </div>
            )}

            {values.role === "PARENT" && (
              <div className="form-grid">
                <Input id="relationship" label="Quan hệ" name="relationship" value={values.relationship} onChange={handleChange} />
                <Input id="zaloId" label="Zalo ID" name="zaloId" value={values.zaloId} onChange={handleChange} />
                <Input id="facebookId" label="Facebook ID" name="facebookId" value={values.facebookId} onChange={handleChange} />
              </div>
            )}

            <div className="form-actions">
              <Button type="submit" disabled={submitting}>{submitting ? "Đang tạo..." : "Tạo tài khoản"}</Button>
            </div>
          </form>
        </Card>

        <Card title="Liên kết phụ huynh - học sinh">
          <form onSubmit={handleLinkParent}>
            <Select
              id="studentId"
              label="Học sinh"
              name="studentId"
              value={linkForm.studentId}
              onChange={(event) => setLinkForm((current) => ({ ...current, studentId: event.target.value }))}
              options={students.map((item) => ({ value: String(item.id), label: `${item.fullName} (${item.username})` }))}
            />
            <Select
              id="parentId"
              label="Phụ huynh"
              name="parentId"
              value={linkForm.parentId}
              onChange={(event) => setLinkForm((current) => ({ ...current, parentId: event.target.value }))}
              options={parents.map((item) => ({ value: String(item.id), label: `${item.fullName} (${item.username})` }))}
            />
            <div className="form-actions">
              <Button type="submit" disabled={linking}>{linking ? "Đang liên kết..." : "Liên kết"}</Button>
            </div>
          </form>
          <p className="muted">Phụ huynh đã liên kết sẽ hiện danh sách học sinh khi tải lại.</p>
        </Card>
      </section>

      <section className="section table-card">
        <Table columns={columns} data={accounts} empty="Chưa có tài khoản nào" />
      </section>

      <Modal
        isOpen={passwordModalOpen}
        title={`Đổi mật khẩu: ${passwordForm.fullName}`}
        onClose={() => setPasswordModalOpen(false)}
        footer={(
          <>
            <Button variant="secondary" type="button" onClick={() => setPasswordModalOpen(false)}>Hủy</Button>
            <Button type="submit" form="password-form" disabled={passwordSubmitting}>
              {passwordSubmitting ? "Đang lưu..." : "Lưu mật khẩu"}
            </Button>
          </>
        )}
      >
        <form id="password-form" onSubmit={handleChangePassword}>
          <Input
            id="newPassword"
            label="Mật khẩu mới"
            name="password"
            type="text"
            value={passwordForm.password}
            onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))}
          />
        </form>
      </Modal>
    </main>
  );
}

function toPayload(values) {
  const base = {
    username: values.username.trim(),
    password: values.password,
    fullName: values.fullName.trim(),
    email: values.email || null,
    phone: values.phone || null,
    active: true
  };

  if (values.role === "TEACHER") {
    return {
      ...base,
      degree: values.degree || null,
      specialization: values.specialization || null,
      salaryRate: values.salaryRate ? Number(values.salaryRate) : 0,
      joinDate: values.joinDate || null
    };
  }

  if (values.role === "STUDENT") {
    return {
      ...base,
      dateOfBirth: values.dateOfBirth || null,
      address: values.address || null,
      enrollDate: values.enrollDate || null
    };
  }

  if (values.role === "PARENT") {
    return {
      ...base,
      zaloId: values.zaloId || null,
      facebookId: values.facebookId || null,
      relationship: values.relationship || null
    };
  }

  return base;
}
