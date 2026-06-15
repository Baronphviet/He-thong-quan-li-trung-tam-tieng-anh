import { useState } from "react";
import { Button, Input, Select, Textarea } from "../../components/common";
import { useNotification } from "../../hooks";

export default function ParentNotificationPage() {
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [notifyType, setNotifyType] = useState("DEBT_ABSENT");
  
  // CẬP NHẬT: Thêm studentName vào trạng thái lưu trữ của Form
  const [formData, setFormData] = useState({
    parentEmail: "",      // Dành cho gửi 1 hoặc 1 nhóm phụ huynh (cách nhau bằng dấu phẩy)
    studentName: "",      // Tên học viên bổ sung
    absentCount: "0",     // Số buổi vắng
    unpaidAmount: "0",    // Số tiền chưa đóng
    classId: "",          // Gửi theo lớp
    emergencyPhone: "",   // Số điện thoại khẩn cấp
    content: ""           // Nội dung tin nhắn / thông báo chung
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let payload = { type: notifyType };

      // Khớp cấu trúc dữ liệu theo từng loại thông báo
      if (notifyType === "DEBT_ABSENT") {
        payload.emails = formData.parentEmail.split(",").map(email => email.trim());
        payload.subject = "[English Center] Thông báo tình hình học tập và học phí";
        
        // CẬP NHẬT: Thêm dòng "Họ và tên học viên" vào cấu trúc HTML Email gửi đi
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
        payload.classId = formData.classId;
        payload.subject = `[English Center] Thông báo nghỉ học - Lớp ${formData.classId}`;
        payload.content = `
          <h3>Thông báo nghỉ học</h3>
          <p>Kính gửi Quý phụ huynh lớp <strong>${formData.classId}</strong>,</p>
          <p>${formData.content || "Trung tâm xin thông báo lịch nghỉ học cụ thể của lớp đã được cập nhật. Chi tiết vui lòng xem lại thời khóa biểu."}</p>
        `;
      } else if (notifyType === "EMERGENCY_SMS") {
        payload.phone = formData.emergencyPhone;
        payload.smsContent = formData.content;
        console.log("Gửi SMS khẩn cấp tới: ", formData.emergencyPhone, formData.content);
      }

      // Endpoint API xử lý logic phân loại thông báo ở Backend
      const response = await fetch("http://localhost:8080/api/admin/email/send-parent-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Gửi thông báo không thành công");
      
      addNotification("✉️ Đã kích hoạt lệnh gửi thông báo thành công!", "success");
    } catch (err) {
      addNotification(`Lỗi: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '20px' }}>
      <section className="hero compact-hero">
        <p className="eyebrow">Hệ thống liên lạc</p>
        <h1>Gửi thông báo cho phụ huynh</h1>
      </section>

      <section className="section card" style={{ maxWidth: "600px", margin: "20px 0", padding: "24px", background: "#fff", borderRadius: "8px" }}>
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

          {/* LOẠI 1: BÁO VẮNG VÀ NỢ TIỀN */}
          {notifyType === "DEBT_ABSENT" && (
            <>
              <Input 
                id="parentEmail" 
                name="parentEmail" 
                label="Email phụ huynh (Nhập nhiều email cách nhau bằng dấu phẩy ',')" 
                placeholder="phuhuynh1@gmail.com, phuhuynh2@gmail.com"
                value={formData.parentEmail} 
                onChange={handleInputChange} 
                required 
              />
              
              {/* CẬP NHẬT: Thêm ô Input nhập Tên Học Viên trực quan ngay trên form */}
              <Input 
                id="studentName" 
                name="studentName" 
                type="text" 
                label="Họ và tên học viên" 
                placeholder="Nhập đầy đủ họ tên học sinh..." 
                value={formData.studentName} 
                onChange={handleInputChange} 
                required 
              />

              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <Input id="absentCount" name="absentCount" type="number" label="Số buổi vắng" value={formData.absentCount} onChange={handleInputChange} required />
                <Input id="unpaidAmount" name="unpaidAmount" type="number" label="Số tiền chưa đóng (VND)" value={formData.unpaidAmount} onChange={handleInputChange} required />
              </div>
            </>
          )}

          {/* LOẠI 2: THÔNG BÁO NGHỈ HỌC THEO LỚP */}
          {notifyType === "CLASS_OFF" && (
            <>
              <Input 
                id="classId" 
                name="classId" 
                label="Mã lớp học / Tên lớp" 
                placeholder="Ví dụ: EN-K20, IELTS-01" 
                value={formData.classId} 
                onChange={handleInputChange} 
                required 
              />
              <Textarea 
                id="content" 
                name="content" 
                label="Nội dung thông báo chi tiết lý do/ngày nghỉ" 
                placeholder="Nhập nội dung thông báo nghỉ học tại đây..." 
                value={formData.content} 
                onChange={handleInputChange} 
                required 
              />
            </>
          )}

          {/* LOẠI 3: TIN NHẮN KHẨN CẤP */}
          {notifyType === "EMERGENCY_SMS" && (
            <>
              <Input 
                id="emergencyPhone" 
                name="emergencyPhone" 
                label="Số điện thoại phụ huynh nhận tin khẩn" 
                placeholder="Ví dụ: 0912345678" 
                value={formData.emergencyPhone} 
                onChange={handleInputChange} 
                required 
              />
              <Textarea 
                id="content" 
                name="content" 
                label="Nội dung tin nhắn khẩn (Nên viết ngắn gọn dưới 160 ký tự không dấu)" 
                placeholder="Ví dụ: Thong bao khan: Trung tam nghi hoc ngay hom nay do su co mat dien đột xuat..." 
                value={formData.content} 
                onChange={handleInputChange} 
                required 
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