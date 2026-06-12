import { useEffect, useState } from "react";
import { announcementService } from "../../services";
import { Alert, Button, Card, Input, Loading, Modal, Select, Table, Textarea } from "../../components/common";
import { useNotification } from "../../hooks";
import { ANNOUNCEMENT_TYPE_OPTIONS } from "../../utils/constants";
import { useAuth } from "../../store";

const emptyForm = {
  title: "",
  content: "",
  imageUrl: "",
  type: "SLIDER",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  active: true
};

export default function AnnouncementsPage() {
  const { userId } = useAuth();
  const [items, setItems] = useState([]);
  const [values, setValues] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await announcementService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addNotification("Ảnh tối đa 2MB.", "warning");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setValues((current) => ({ ...current, imageUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        endDate: values.endDate || null,
        createdBy: userId || 1,
        active: Boolean(values.active)
      };
      if (editingId) {
        await announcementService.update(editingId, payload);
        addNotification("Cập nhật thông báo thành công", "success");
      } else {
        await announcementService.create(payload);
        addNotification("Tạo thông báo thành công", "success");
      }
      setModalOpen(false);
      setEditingId(null);
      setValues(emptyForm);
      await loadData();
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  function openCreate() {
    setEditingId(null);
    setValues(emptyForm);
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);
    setValues({
      title: item.title || "",
      content: item.content || "",
      imageUrl: item.imageUrl || "",
      type: item.type || "SLIDER",
      startDate: item.startDate || "",
      endDate: item.endDate || "",
      active: item.active !== false
    });
    setModalOpen(true);
  }

  async function handleDeactivate(id) {
    try {
      await announcementService.delete(id);
      addNotification("Đã tắt thông báo", "success");
      await loadData();
    } catch (err) {
      addNotification(err.message, "error");
    }
  }

  const columns = [
    { key: "title", label: "Tiêu đề" },
    { key: "type", label: "Loại" },
    { key: "active", label: "Trạng thái", render: (value) => <span className="status-pill">{value ? "ACTIVE" : "INACTIVE"}</span> },
    {
      key: "imageUrl",
      label: "Ảnh",
      render: (value) => value ? <img src={value} alt="" className="banner-thumb" /> : "-"
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (_, row) => (
        <div className="table-actions">
          <Button variant="secondary" size="sm" type="button" onClick={() => openEdit(row)}>Sửa</Button>
          {row.active && (
            <Button variant="secondary" size="sm" type="button" onClick={() => handleDeactivate(row.id)}>Tắt</Button>
          )}
        </div>
      )
    }
  ];

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <p className="eyebrow">Quảng cáo & thông báo</p>
        <h1>Quản lý banner trang chủ</h1>
        <Button type="button" onClick={openCreate}>Thêm banner</Button>
      </section>

      <section className="section table-card">
        <Table columns={columns} data={items} empty="Chưa có thông báo" />
      </section>

      <Modal
        isOpen={modalOpen}
        title={editingId ? "Cập nhật thông báo" : "Thêm banner mới"}
        onClose={() => setModalOpen(false)}
        footer={(
          <>
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Hủy</Button>
            <Button type="submit" form="announcement-form" disabled={submitting}>
              {submitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </>
        )}
      >
        <form id="announcement-form" onSubmit={handleSubmit}>
          <Input id="title" label="Tiêu đề" name="title" value={values.title} onChange={handleChange} required />
          <Textarea id="content" label="Nội dung" name="content" value={values.content} onChange={handleChange} />
          <Select id="type" label="Loại hiển thị" name="type" value={values.type} onChange={handleChange} showBlankOption={false} options={ANNOUNCEMENT_TYPE_OPTIONS} />
          <Input id="imageFile" label="Tải ảnh banner" name="imageFile" type="file" accept="image/*" onChange={handleImageUpload} />
          <Input id="imageUrl" label="Hoặc dán URL ảnh" name="imageUrl" value={values.imageUrl} onChange={handleChange} />
          {values.imageUrl && <img src={values.imageUrl} alt="Xem trước" className="banner-preview" />}
          <div className="form-grid">
            <Input id="startDate" label="Ngày bắt đầu" name="startDate" type="date" value={values.startDate} onChange={handleChange} />
            <Input id="endDate" label="Ngày kết thúc" name="endDate" type="date" value={values.endDate} onChange={handleChange} />
          </div>
          <label className="checkbox-row">
            <input type="checkbox" name="active" checked={values.active} onChange={handleChange} />
            <span>Đang hiển thị</span>
          </label>
        </form>
      </Modal>
    </main>
  );
}
