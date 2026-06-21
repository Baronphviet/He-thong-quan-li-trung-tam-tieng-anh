import { useEffect, useState } from "react";
import { classService, enrollmentService, studentService } from "../../services";
import { Alert, Button, Input, Loading, Modal, Select, Table } from "../../components/common";
import { useForm, useModal, useNotification } from "../../hooks";
import { createValidator, validators } from "../../utils/validators";

const emptyStudent = {
  username: "",
  fullName: "",
  phone: "",
  email: "",
  address: "",
  dateOfBirth: "",
  enrollDate: new Date().toISOString().slice(0, 10)
};

const emptyEnrollment = {
  studentId: "",
  classId: "",
  discountRate: "0"
};

const validateRules = {
  fullName: [validators.required],
  username: [validators.required, validators.minLength(3)],
  phone: [validators.phone]
};

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [openClasses, setOpenClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [enrollStudent, setEnrollStudent] = useState(null);
  const [enrollmentValues, setEnrollmentValues] = useState(emptyEnrollment);
  const [enrolling, setEnrolling] = useState(false);
  const { addNotification } = useNotification();
  const { isOpen, open, close } = useModal();
  const { isOpen: enrollOpen, open: openEnroll, close: closeEnroll } = useModal();
  const form = useForm(emptyStudent, handleSubmit, createValidator(validateRules));

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [studentsData, classesData] = await Promise.all([
        studentService.getAll(),
        classService.getOpen()
      ]);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setOpenClasses(Array.isArray(classesData) ? classesData : []);
    } catch (err) {
      setError(err.message);
      addNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(values) {
    const payload = {
      ...values,
      email: values.email || null,
      dateOfBirth: values.dateOfBirth || null,
      enrollDate: values.enrollDate || null,
      password: editingId ? undefined : "student123",
      active: true
    };

    try {
      if (editingId) {
        await studentService.update(editingId, payload);
        addNotification("Cập nhật học sinh thành công", "success");
      } else {
        await studentService.create(payload);
        addNotification("Tạo học sinh mới thành công", "success");
      }
      handleCloseModal();
      await loadData();
    } catch (err) {
      addNotification(err.message, "error");
    }
  }

  async function handleEnrollSubmit(event) {
    event.preventDefault();
    if (!enrollmentValues.classId) {
      addNotification("Chọn lớp học đang mở.", "warning");
      return;
    }

    setEnrolling(true);
    try {
      await enrollmentService.create({
        studentId: Number(enrollmentValues.studentId),
        classId: Number(enrollmentValues.classId),
        discountRate: Number(enrollmentValues.discountRate || 0),
        status: "ACTIVE",
        totalSessions: 12
      });
      addNotification("Ghi danh học sinh vào lớp thành công", "success");
      closeEnroll();
      setEnrollStudent(null);
      setEnrollmentValues(emptyEnrollment);
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setEnrolling(false);
    }
  }

  function handleEdit(student) {
    form.setValues({ ...emptyStudent, ...student });
    setEditingId(student.id);
    open();
  }

  function handleOpenEnroll(student) {
    setEnrollStudent(student);
    setEnrollmentValues({
      ...emptyEnrollment,
      studentId: String(student.id)
    });
    openEnroll();
  }

  function handleAddNew() {
    form.setValues(emptyStudent);
    setEditingId(null);
    open();
  }

  function handleCloseModal() {
    form.resetForm();
    setEditingId(null);
    close();
  }

  const columns = [
    { key: "fullName", label: "Tên học sinh" },
    { key: "username", label: "Tài khoản" },
    { key: "password", label: "Mật khẩu", render: (value) => <code className="credential-code">{value || "-"}</code> },
    { key: "phone", label: "Điện thoại", render: (value) => value || "-" },
    { key: "address", label: "Địa chỉ", render: (value) => value || "-" },
    {
      key: "actions",
      label: "Hành động",
      render: (_, row) => (
        <div className="table-actions">
          <Button variant="secondary" size="sm" type="button" onClick={() => handleEdit(row)}>Sửa</Button>
          <Button size="sm" type="button" onClick={() => handleOpenEnroll(row)}>Ghi danh lớp</Button>
        </div>
      )
    }
  ];

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <h1>Danh sách học sinh</h1>
        <Button type="button" onClick={handleAddNew}>Thêm học sinh</Button>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu" onClose={() => setError("")}>{error}</Alert>}

      <section className="section table-card">
        <Table columns={columns} data={students} empty="Chưa có học sinh nào" />
      </section>

      <StudentFormModal
        isOpen={isOpen}
        title={editingId ? "Cập nhật học sinh" : "Thêm học sinh mới"}
        form={form}
        onClose={handleCloseModal}
      />

      <Modal
        isOpen={enrollOpen}
        title={enrollStudent ? `Ghi danh: ${enrollStudent.fullName}` : "Ghi danh lớp học"}
        onClose={() => {
          closeEnroll();
          setEnrollStudent(null);
        }}
        footer={(
          <>
            <Button variant="secondary" type="button" onClick={closeEnroll}>Hủy</Button>
            <Button type="submit" form="enrollment-form" disabled={enrolling}>
              {enrolling ? "Đang ghi danh..." : "Ghi danh"}
            </Button>
          </>
        )}
      >
        <form id="enrollment-form" onSubmit={handleEnrollSubmit}>
          <Select
            id="classId"
            label="Lớp đang mở"
            name="classId"
            value={enrollmentValues.classId}
            onChange={(event) => setEnrollmentValues((current) => ({ ...current, classId: event.target.value }))}
            options={openClasses.map((item) => ({
              value: String(item.id),
              label: `${item.className} - ${item.schedule}`
            }))}
          />
          <Input
            id="discountRate"
            label="Giảm giá (0-1)"
            name="discountRate"
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={enrollmentValues.discountRate}
            onChange={(event) => setEnrollmentValues((current) => ({ ...current, discountRate: event.target.value }))}
          />
        </form>
      </Modal>
    </main>
  );
}

function StudentFormModal({ isOpen, title, form, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
          <Button type="submit" form="student-form" disabled={form.isSubmitting}>
            {form.isSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </>
      )}
    >
      <form id="student-form" onSubmit={form.handleSubmit}>
        <Input id="fullName" label="Họ và tên" name="fullName" value={form.values.fullName} onChange={form.handleChange} onBlur={form.handleBlur} error={form.touched.fullName && form.errors.fullName} />
        <Input id="username" label="Tài khoản" name="username" value={form.values.username} onChange={form.handleChange} onBlur={form.handleBlur} error={form.touched.username && form.errors.username} />
        <Input id="phone" label="Điện thoại" name="phone" value={form.values.phone || ""} onChange={form.handleChange} onBlur={form.handleBlur} error={form.touched.phone && form.errors.phone} />
        <Input id="email" label="Email" name="email" type="email" value={form.values.email || ""} onChange={form.handleChange} onBlur={form.handleBlur} />
        <Input id="address" label="Địa chỉ" name="address" value={form.values.address || ""} onChange={form.handleChange} onBlur={form.handleBlur} />
        <Input id="dateOfBirth" label="Ngày sinh" name="dateOfBirth" type="date" value={form.values.dateOfBirth || ""} onChange={form.handleChange} onBlur={form.handleBlur} />
        <Input id="enrollDate" label="Ngày đăng ký" name="enrollDate" type="date" value={form.values.enrollDate || ""} onChange={form.handleChange} onBlur={form.handleBlur} />
      </form>
    </Modal>
  );
}
