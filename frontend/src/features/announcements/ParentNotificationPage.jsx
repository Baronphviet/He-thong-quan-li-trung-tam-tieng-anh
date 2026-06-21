import { useEffect, useState } from "react";
import { Button, Input, Select, Textarea } from "../../components/common";
import { useNotification } from "../../hooks";
import { classService } from "../../services"; // chỉnh đúng path/service thật của bạn

export default function ParentNotificationPage() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [notifyType, setNotifyType] = useState("DEBT_ABSENT");
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [formData, setFormData] = useState({
    parentEmail: "",
    studentName: "",
    absentCount: "0",
    unpaidAmount: "0",
    classId: "",
    emergencyPhone: "",
    content: ""
  });

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await classService.getAll();
        setClasses(Array.isArray(data) ? data : []);
      } catch (err) {
        addNotification("Không tải được danh sách lớp học.", "error");
      } finally {
        setLoadingClasses(false);
      }
    }
    loadClasses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedClass = classes.find(
      (c) => String(c.classId ?? c.id) === String(formData.classId)
  );

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let payload = { type: notifyType };

      if (notifyType === "DEBT_ABSENT") {
        payload.emails = formData.parentEmail.split(",").map(email => email.trim());
        payload.subject = "[English Center] Thông báo tình hình học tập và học phí";
        payload.content = `
          <h3>Thông báo từ trung tâm English Center</h3>
          <p>Kính gửi phụ huynh, chúng tôi xin thông báo tình hình hiện tại của học viên:</p>
          <ul>
            <li>Họ và tên học viên: <strong>${formData.studentName || "Chưa cập nhật"}</strong></li>
            <li>Số buổi vắng mặt: <strong>${formData.absentCount} buổi</strong></li>
            <li>Học phí chưa hoàn thành: <strong>${Number(formData.unpaidAmount).toLocaleString('vi-VN')} VND</strong></li>
          </ul>
          <p>Trân trọng cảm ơn quý phụ huynh!</p>
        `;
      } else if (notifyType === "CLASS_OFF") {
        const className = selectedClass?.className || formData.classId;

        payload.classId = formData.classId;
        payload.subject = `[English Center] Thông báo nghỉ học - Lớp ${className}`;
        payload.content = `
          <h3>Thông báo nghỉ học</h3>
          <p>Kính gửi Quý phụ huynh lớp <strong>${className}</strong>,</p>
          <p>${formData.content || "Trung tâm xin thông báo lịch nghỉ học cụ thể của lớp đã được cập nhật. Chi tiết vui lòng xem lại thời khóa biểu."}</p>
        `;
      } else if (notifyType === "EMERGENCY_SMS") {
        payload.phone = formData.emergencyPhone;
        payload.smsContent = formData.content;
      }

      const response = await fetch("http://localhost:8080/api/admin/email/send-parent-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Gửi thông báo không thành công");

      const result = await response.json();
      const message = result.message || "Đã xử lý gửi thông báo.";

      // Phát hiện trường hợp 0 người nhận dựa theo nội dung message backend trả về
      const isEmpty = /\b0\s*(phụ huynh|học sinh|người)\b/i.test(message)
          || /không (tìm thấy|có)\s*(phụ huynh|học sinh)/i.test(message);

      if (isEmpty) {
        addNotification(`⚠️ ${message}`, "warning");
      } else {
        addNotification(`✉️ ${message}`, "success");
      }
    } catch (err) {
      addNotification(`Lỗi: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
      <main style={{ padding: '20px' }}>
        <section className="hero compact-hero">
          <h1>Gửi thông báo cho phụ huynh</h1>
        </section>

        <section className="notification-card">
          <form onSubmit={handleSendNotification}>

            <Select
                id="notifyType"
                label="Chọn loại thông báo muốn gửi"
                value={notifyType}
                onChange={(e) => setNotifyType(e.target.value)}
                showBlankOption={false}
                options={[
                  { value: "DEBT_ABSENT", label: "Thông báo vắng học & Công nợ (Học phí)" },
                  { value: "CLASS_OFF", label: "Thông báo nghỉ học theo Lớp" },
                  { value: "EMERGENCY_SMS", label: "Tin nhắn điện thoại Khẩn cấp" }
                ]}
            />

            <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #eee" }} />

            {notifyType === "DEBT_ABSENT" && (
                <>
                  <Input
                      id="parentEmail" name="parentEmail"
                      label="Email phụ huynh (Nhập nhiều email cách nhau bằng dấu phẩy ',')"
                      placeholder="phuhuynh1@gmail.com, phuhuynh2@gmail.com"
                      value={formData.parentEmail} onChange={handleInputChange} required
                  />
                  <Input
                      id="studentName" name="studentName" type="text"
                      label="Họ và tên học viên" placeholder="Nhập đầy đủ họ tên học sinh..."
                      value={formData.studentName} onChange={handleInputChange} required
                  />
                  <div className="notification-grid">
                    <Input id="absentCount" name="absentCount" type="number" label="Số buổi vắng" value={formData.absentCount} onChange={handleInputChange} required />
                    <Input id="unpaidAmount" name="unpaidAmount" type="number" label="Số tiền chưa đóng (VND)" value={formData.unpaidAmount} onChange={handleInputChange} required />
                  </div>
                </>
            )}

            {notifyType === "CLASS_OFF" && (
                <>
                  <Select
                      id="classId"
                      name="classId"
                      label="Chọn lớp học"
                      value={formData.classId}
                      onChange={handleInputChange}
                      disabled={loadingClasses}
                      options={classes.map((c) => ({
                        value: String(c.classId ?? c.id),
                        label: `#${c.classId ?? c.id} - ${c.className}`
                      }))}
                  />

                  {selectedClass && (
                      <div style={{
                        margin: "10px 0 16px", padding: "12px 14px", borderRadius: 10,
                        background: "rgba(113,50,245,0.06)", border: "1px solid rgba(113,50,245,0.18)",
                        fontSize: "0.88rem"
                      }}>
                        <div><strong>Mã lớp:</strong> #{selectedClass.classId ?? selectedClass.id}</div>
                        <div><strong>Tên lớp:</strong> {selectedClass.className}</div>
                      </div>
                  )}

                  <Textarea
                      id="content" name="content"
                      label="Nội dung thông báo chi tiết lý do/ngày nghỉ"
                      placeholder="Nhập nội dung thông báo nghỉ học tại đây..."
                      value={formData.content} onChange={handleInputChange} required
                  />
                </>
            )}

            {notifyType === "EMERGENCY_SMS" && (
                <>
                  <Input
                      id="emergencyPhone" name="emergencyPhone"
                      label="Số điện thoại phụ huynh nhận tin khẩn"
                      placeholder="Ví dụ: 0912345678"
                      value={formData.emergencyPhone} onChange={handleInputChange} required
                  />
                  <Textarea
                      id="content" name="content"
                      label="Nội dung tin nhắn khẩn (Nên viết ngắn gọn dưới 160 ký tự không dấu)"
                      placeholder="Ví dụ: Thong bao khan: Trung tam nghi hoc ngay hom nay do su co mat dien đột xuat..."
                      value={formData.content} onChange={handleInputChange} required
                  />
                </>
            )}

            <Button type="submit" disabled={loading} style={{ marginTop: "20px", width: "100%" }}>
              {loading ? "Đang xử lý gửi..." : "Xác nhận gửi thông báo"}
            </Button>
          </form>
        </section>
      </main>
  );
}