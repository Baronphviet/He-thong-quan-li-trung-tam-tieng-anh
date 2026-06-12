import { useEffect, useState } from "react";
import { classService, masterService } from "../../services";
import { Alert, Button, Input, Loading, Modal, Select, Table } from "../../components/common";
import { useForm, useModal, useNotification } from "../../hooks";
import { createValidator, validators } from "../../utils/validators";
import { CLASS_STATUS_OPTIONS } from "../../utils/constants";
import { formatMoney } from "../../utils/format";

const emptyClass = {
  className: "",
  ageGroupId: "",
  academicYearId: "",
  teacherId: "",
  maxStudents: 18,
  schedule: "T2-T4-T6|18:00-19:30",
  tuitionFee: 1800000,
  status: "OPEN"
};

const validateRules = {
  className: [validators.required],
  ageGroupId: [validators.required],
  academicYearId: [validators.required],
  maxStudents: [validators.required, validators.number, validators.min(1)],
  tuitionFee: [validators.required, validators.number, validators.min(0)],
  schedule: [validators.required]
};

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [ageGroups, setAgeGroups] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const { addNotification } = useNotification();
  const { isOpen, open, close } = useModal();
  const form = useForm(emptyClass, handleSubmit, createValidator(validateRules));

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [classesData, teachersData, groupsData, yearsData] = await Promise.all([
        classService.getAll(),
        masterService.getTeachers(),
        masterService.getAgeGroups(),
        masterService.getAcademicYears()
      ]);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setAgeGroups(Array.isArray(groupsData) ? groupsData : []);
      setAcademicYears(Array.isArray(yearsData) ? yearsData : []);
    } catch (err) {
      setError(err.message);
      addNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(values) {
    const payload = toClassPayload(values);
    try {
      if (editingId) {
        await classService.update(editingId, payload);
        addNotification("Cập nhật lớp thành công", "success");
      } else {
        await classService.create(payload);
        addNotification("Tạo lớp mới thành công", "success");
      }
      handleCloseModal();
      await loadData();
    } catch (err) {
      addNotification(err.message, "error");
    }
  }

  function handleEdit(classItem) {
    form.setValues({
      ...emptyClass,
      ...classItem,
      ageGroupId: classItem.ageGroupId != null ? String(classItem.ageGroupId) : "",
      academicYearId: classItem.academicYearId != null ? String(classItem.academicYearId) : "",
      teacherId: classItem.teacherId != null ? String(classItem.teacherId) : "",
      maxStudents: classItem.maxStudents ?? emptyClass.maxStudents,
      tuitionFee: classItem.tuitionFee ?? emptyClass.tuitionFee
    });
    setEditingId(classItem.id);
    open();
  }

  function handleAddNew() {
    form.setValues(emptyClass);
    setEditingId(null);
    open();
  }

  function handleCloseModal() {
    form.resetForm();
    setEditingId(null);
    close();
  }

  const columns = [
    { key: "className", label: "Tên lớp" },
    { key: "teacherName", label: "Giáo viên", render: (value) => value || "-" },
    { key: "schedule", label: "Lịch học" },
    { key: "tuitionFee", label: "Học phí", render: (value) => formatMoney(value) },
    { key: "status", label: "Trạng thái", render: (value) => <span className="status-pill">{value}</span> },
    {
      key: "actions",
      label: "Hành động",
      render: (_, row) => (
        <Button variant="secondary" size="sm" type="button" onClick={() => handleEdit(row)}>
          Sửa
        </Button>
      )
    }
  ];

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <p className="eyebrow">Quản lý lớp học</p>
        <h1>Danh sách lớp học</h1>
        <Button type="button" onClick={handleAddNew}>Thêm lớp</Button>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu" onClose={() => setError("")}>{error}</Alert>}

      <section className="section table-card">
        <Table columns={columns} data={classes} empty="Chưa có lớp nào" />
      </section>

      <ClassFormModal
        isOpen={isOpen}
        title={editingId ? "Cập nhật lớp" : "Tạo lớp mới"}
        form={form}
        teachers={teachers}
        ageGroups={ageGroups}
        academicYears={academicYears}
        onClose={handleCloseModal}
      />
    </main>
  );
}

function ClassFormModal({ isOpen, title, form, teachers, ageGroups, academicYears, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
          <Button type="submit" form="class-form" disabled={form.isSubmitting}>
            {form.isSubmitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </>
      )}
    >
      <form id="class-form" onSubmit={form.handleSubmit}>
        <Input id="className" label="Tên lớp" name="className" value={form.values.className} onChange={form.handleChange} onBlur={form.handleBlur} error={form.touched.className && form.errors.className} />
        <Select id="ageGroupId" label="Độ tuổi" name="ageGroupId" value={form.values.ageGroupId} onChange={form.handleChange} onBlur={form.handleBlur} error={form.touched.ageGroupId && form.errors.ageGroupId} options={ageGroups.map((item) => ({ value: String(item.id), label: item.groupName }))} />
        <Select id="academicYearId" label="Năm học" name="academicYearId" value={form.values.academicYearId} onChange={form.handleChange} onBlur={form.handleBlur} error={form.touched.academicYearId && form.errors.academicYearId} options={academicYears.map((item) => ({ value: String(item.id), label: item.yearName }))} />
        <Select id="teacherId" label="Giáo viên" name="teacherId" value={form.values.teacherId} onChange={form.handleChange} onBlur={form.handleBlur} blankLabel="Chưa gán" options={teachers.map((item) => ({ value: String(item.id), label: item.fullName }))} />
        <Input id="maxStudents" label="Số học sinh tối đa" name="maxStudents" type="number" value={form.values.maxStudents} onChange={form.handleChange} onBlur={form.handleBlur} error={form.touched.maxStudents && form.errors.maxStudents} />
        <Input id="schedule" label="Lịch học" name="schedule" value={form.values.schedule} onChange={form.handleChange} onBlur={form.handleBlur} error={form.touched.schedule && form.errors.schedule} placeholder="T2-T4-T6|18:00-19:30" />
        <Input id="tuitionFee" label="Học phí" name="tuitionFee" type="number" value={form.values.tuitionFee} onChange={form.handleChange} onBlur={form.handleBlur} error={form.touched.tuitionFee && form.errors.tuitionFee} />
        <Select id="status" label="Trạng thái" name="status" value={form.values.status} onChange={form.handleChange} onBlur={form.handleBlur} showBlankOption={false} options={CLASS_STATUS_OPTIONS} />
      </form>
    </Modal>
  );
}

function toClassPayload(values) {
  return {
    className: values.className,
    ageGroupId: values.ageGroupId ? Number(values.ageGroupId) : null,
    academicYearId: values.academicYearId ? Number(values.academicYearId) : null,
    teacherId: values.teacherId ? Number(values.teacherId) : null,
    maxStudents: Number(values.maxStudents || 0),
    schedule: values.schedule,
    tuitionFee: Number(values.tuitionFee || 0),
    status: values.status || "OPEN"
  };
}
