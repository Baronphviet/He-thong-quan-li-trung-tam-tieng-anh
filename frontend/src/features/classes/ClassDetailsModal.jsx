import { useEffect, useState } from "react";
import { Modal, Loading, Button } from "../../components/common";
import { classService, enrollmentService } from "../../services";
import { useAuth } from "../../store";
import { useNotification } from "../../hooks";

export default function ClassDetailsModal({ classId, isOpen, onClose }) {
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { role } = useAuth();
  const { addNotification } = useNotification();

  const [confirmDropOpen, setConfirmDropOpen] = useState(false);
  const [pendingDropStudent, setPendingDropStudent] = useState(null);

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

  function handleDropStudent(enrollmentId, studentName) {
    setPendingDropStudent({ id: enrollmentId, name: studentName });
    setConfirmDropOpen(true);
  }

  async function executeDropStudent() {
    if (!pendingDropStudent) return;
    setConfirmDropOpen(false);
    try {
      await enrollmentService.drop(pendingDropStudent.id);
      addNotification("Đã xóa học sinh khỏi lớp thành công", "success");
      loadDetails();
    } catch (err) {
      addNotification(err.message || "Không thể xóa học sinh khỏi lớp", "error");
    } finally {
      setPendingDropStudent(null);
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Chi tiết lớp học: ${classInfo?.className || ""}`} size="xl">
        {loading ? (
          <Loading />
        ) : classInfo ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid two" style={{ gap: '16px' }}>
              <div>
                <p><strong>Mã lớp:</strong> {classInfo.classId ?? classId}</p>
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
                        {role === "ADMIN" && <th style={{ textAlign: "center" }}>Hành động</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.studentId}>
                          <td>{student.fullName}</td>
                          <td>{student.phone || "-"}</td>
                          <td>
                            {student.unpaidFeeCount > 0 ? (
                              <span style={{ color: "red", fontWeight: "bold" }}>Còn nợ {student.unpaidAmount?.toLocaleString("vi-VN")} ₫</span>
                            ) : (
                              <span style={{ color: "green" }}>Đã đóng đủ</span>
                            )}
                            {Number(student.discountRate) > 0 && <span style={{ marginLeft: "8px", fontSize: "0.8em" }}>(Giảm {Math.round(Number(student.discountRate) * 100)}%)</span>}
                          </td>
                          <td>
                            <span style={{ color: "green", fontWeight: "bold" }}>{student.presentCount}</span> / <span style={{ color: "red", fontWeight: "bold" }}>{student.absentCount}</span> / <span style={{ color: "orange", fontWeight: "bold" }}>{student.lateCount}</span>
                          </td>
                          <td>{student.parents || "-"}</td>
                          {role === "ADMIN" && (
                            <td style={{ textAlign: "center" }}>
                              <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={() => handleDropStudent(student.enrollmentId, student.fullName)}
                                title="Xóa học sinh khỏi lớp"
                              >
                                Xóa khỏi lớp
                              </Button>
                            </td>
                          )}
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

      <Modal
        isOpen={confirmDropOpen}
        onClose={() => setConfirmDropOpen(false)}
        title="Xác nhận xóa học sinh khỏi lớp"
        size="md"
        footer={(
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", width: "100%" }}>
            <Button variant="secondary" type="button" onClick={() => setConfirmDropOpen(false)}>Hủy</Button>
            <Button
              type="button"
              onClick={executeDropStudent}
              style={{ backgroundColor: "#dc3545", color: "#fff", borderColor: "#dc3545" }}
            >
              Xác nhận xóa
            </Button>
          </div>
        )}
      >
        <div style={{ padding: "8px 0", fontSize: "0.95rem", lineHeight: "1.5", color: "#333" }}>
          Bạn có chắc chắn muốn xóa học sinh <strong>{pendingDropStudent?.name}</strong> khỏi lớp học này không?
          <br />
          <span style={{ color: "#d9534f", fontSize: "0.85rem", display: "block", marginTop: "8px" }}>
            * Lưu ý: Hành động này sẽ hủy đăng ký học và xóa các khoản học phí chưa đóng của học sinh này tại lớp học.
          </span>
        </div>
      </Modal>
    </>
  );
}
