import { useEffect, useState } from "react";
import { Modal, Loading } from "../../components/common";
import { classService } from "../../services";

export default function ClassDetailsModal({ classId, isOpen, onClose }) {
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && classId) {
      loadDetails();
    }
  }, [isOpen, classId]);

  async function loadDetails() {
    setLoading(true);
    try {
      const info = await classService.getDetails(classId);
      setClassInfo(info);
      setStudents(info.students || []);
    } catch (err) {
      console.error(err);
      setClassInfo(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Chi tiết lớp học: ${classInfo?.className || ""}`} size="xl">
      {loading ? (
        <Loading />
      ) : classInfo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="grid two" style={{ gap: '16px' }}>
            <div>
              <p><strong>Tên lớp:</strong> {classInfo.className}</p>
              <p><strong>Ngày tạo:</strong> {classInfo.createdAt ? new Date(classInfo.createdAt).toLocaleDateString("vi-VN") : "-"}</p>
              <p><strong>Giáo viên phụ trách:</strong> {classInfo.teacherName || "Chưa gán"}</p>
              <p><strong>Lịch học:</strong> {classInfo.schedule}</p>
            </div>
            <div>
              <p><strong>Học phí:</strong> {classInfo.tuitionFee?.toLocaleString("vi-VN")} VND</p>
              <p><strong>Độ tuổi:</strong> {classInfo.ageGroupName || "-"}</p>
              <p><strong>Năm học:</strong> {classInfo.academicYearName || "-"}</p>
              <p><strong>Trạng thái:</strong> {classInfo.status}</p>
            </div>
          </div>
          
          <div>
            <h3>Danh sách học sinh ({students.length}/{classInfo.maxStudents})</h3>
            {students.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table className="table" style={{ width: "100%", marginTop: "10px", minWidth: "800px" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left" }}>Họ tên học sinh</th>
                      <th style={{ textAlign: "left" }}>SĐT</th>
                      <th style={{ textAlign: "left" }}>Tình trạng học phí</th>
                      <th style={{ textAlign: "left" }}>Chuyên cần (Mặt/Vắng/Muộn)</th>
                      <th style={{ textAlign: "left" }}>Phụ huynh liên kết</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.studentId}>
                        <td>{student.fullName}</td>
                        <td>{student.phone || "-"}</td>
                        <td>
                          {student.unpaidFeeCount > 0 ? (
                            <span style={{ color: "red", fontWeight: "bold" }}>Nợ {student.unpaidFeeCount} tháng</span>
                          ) : (
                            <span style={{ color: "green" }}>Đã đóng đủ</span>
                          )}
                          {Number(student.discountRate) > 0 && <span style={{ marginLeft: "8px", fontSize: "0.8em" }}>(Giảm {Math.round(Number(student.discountRate) * 100)}%)</span>}
                        </td>
                        <td>
                          <span style={{ color: "green", fontWeight: "bold" }}>{student.presentCount}</span> / <span style={{ color: "red", fontWeight: "bold" }}>{student.absentCount}</span> / <span style={{ color: "orange", fontWeight: "bold" }}>{student.lateCount}</span>
                        </td>
                        <td>{student.parents || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">Chưa có học sinh nào đăng ký lớp này.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Không tìm thấy thông tin lớp học.</p>
      )}
    </Modal>
  );
}
