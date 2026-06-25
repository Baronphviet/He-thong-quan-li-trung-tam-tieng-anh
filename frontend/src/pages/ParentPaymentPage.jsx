import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../services/apiClient";
import { paymentService } from "../services";
import { useAuth } from "../store";
import { formatMoney, removeAccents } from "../utils/format";
import { sameId } from "../utils/auth";
import { getApiErrorMessage } from "../utils/apiError";
import { Alert, Loading, Button, Card } from "../components/common";
import { useNotification } from "../hooks";

export default function ParentPaymentPage() {
  const { role, userId } = useAuth();
  const [fees, setFees] = useState([]);
  const [bankConfig, setBankConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFeeId, setSelectedFeeId] = useState("");
  const { addNotification } = useNotification();
  
  // Local copy states for visual feedback
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    loadData();
  }, [role, userId]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [feeData, parents, configData] = await Promise.all([
        apiGet("/monthly-fees"),
        apiGet("/parents"),
        paymentService.getBankConfig()
      ]);

      const allFees = Array.isArray(feeData) ? feeData : [];
      let parentFees = [];

      if (role === "PARENT") {
        const parent = (Array.isArray(parents) ? parents : []).find((item) => sameId(item.id, userId));
        const studentIds = new Set(parent?.studentIds || []);
        // Only get unpaid or partial invoices
        parentFees = allFees.filter(
          (fee) => studentIds.has(fee.studentId) && (fee.status === "UNPAID" || fee.status === "PARTIAL")
        );
      } else {
        parentFees = allFees.filter((fee) => fee.status === "UNPAID" || fee.status === "PARTIAL");
      }

      setFees(parentFees);
      setBankConfig(configData);
      
      if (parentFees.length > 0) {
        setSelectedFeeId(String(parentFees[0].id));
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const selectedFee = useMemo(() => {
    return fees.find((fee) => String(fee.id) === selectedFeeId) || null;
  }, [fees, selectedFeeId]);

  const paymentSyntax = useMemo(() => {
    if (!selectedFee) return "";
    return `HD${selectedFee.id} ${removeAccents(selectedFee.studentName || "").toUpperCase()}`;
  }, [selectedFee]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    addNotification(`Đã sao chép ${fieldName}!`, "success");
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <p className="eyebrow">Thanh toán học phí</p>
        <h1>Thanh toán qua Ngân hàng & QR Code</h1>
        <p className="lead">Chọn hóa đơn cần đóng và thực hiện chuyển khoản bằng mã QR hoặc thông tin tài khoản bên dưới.</p>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu">{error}</Alert>}

      {fees.length === 0 ? (
        <section className="section" style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ maxWidth: "500px", margin: "0 auto" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🎉</div>
            <h2>Không có học phí cần đóng</h2>
            <p className="muted" style={{ marginTop: "0.5rem" }}>
              Tất cả các khoản học phí của con đã được đóng đầy đủ. Xin cảm ơn phụ huynh!
            </p>
          </div>
        </section>
      ) : (
        <section className="section grid two">
          {/* CỘT TRÁI: CHỌN HÓA ĐƠN & THÔNG TIN HÓA ĐƠN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <Card title="1. Chọn hóa đơn cần thanh toán">
              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label htmlFor="feeSelect" style={{ fontWeight: "600", marginBottom: "0.5rem", display: "block" }}>
                  Danh sách hóa đơn chưa đóng:
                </label>
                <select
                  id="feeSelect"
                  className="form-input"
                  value={selectedFeeId}
                  onChange={(e) => setSelectedFeeId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    fontSize: "1rem"
                  }}
                >
                  {fees.map((fee) => (
                    <option key={fee.id} value={String(fee.id)}>
                      {fee.studentName} - {fee.className} (Kỳ {fee.month}/{fee.year}) - Còn nợ: {formatMoney(fee.outstandingAmount)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedFee && (
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#111827" }}>Thông tin chi tiết</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.95rem" }}>
                    <div>
                      <p className="muted" style={{ marginBottom: "2px" }}>Học sinh</p>
                      <strong>{selectedFee.studentName}</strong>
                    </div>
                    <div>
                      <p className="muted" style={{ marginBottom: "2px" }}>Lớp học</p>
                      <strong>{selectedFee.className}</strong>
                    </div>
                    <div>
                      <p className="muted" style={{ marginBottom: "2px" }}>Kỳ học phí</p>
                      <strong>Kỳ {selectedFee.month}/{selectedFee.year}</strong>
                    </div>
                    <div>
                      <p className="muted" style={{ marginBottom: "2px" }}>Số tiền cần đóng</p>
                      <strong style={{ color: "#b91c1c", fontSize: "1.1rem" }}>
                        {formatMoney(selectedFee.outstandingAmount)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {selectedFee && (
              <Card title="2. Cú pháp chuyển khoản bắt buộc">
                <p className="muted" style={{ fontSize: "0.875rem", marginBottom: "1rem" }}>
                  Vui lòng sao chép chính xác cú pháp chuyển khoản dưới đây để hệ thống tự động ghi nhận thanh toán nhanh nhất.
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    fontFamily: "monospace",
                    fontSize: "1.15rem",
                    fontWeight: "bold",
                    color: "#0f172a"
                  }}
                >
                  <span>{paymentSyntax}</span>
                  <Button
                    variant={copiedField === "cú pháp" ? "success" : "secondary"}
                    size="sm"
                    type="button"
                    onClick={() => handleCopy(paymentSyntax, "cú pháp")}
                  >
                    {copiedField === "cú pháp" ? "Đã chép ✓" : "Sao chép"}
                  </Button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                  <span style={{ color: "#ef4444", fontSize: "14px" }}>⚠️</span>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Cú pháp gồm mã hóa đơn và tên học sinh viết hoa không dấu.
                  </span>
                </div>
              </Card>
            )}
          </div>

          {/* CỘT PHẢI: THÔNG TIN TÀI KHOẢN VÀ QR CODE */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <Card title="3. Thông tin tài khoản ngân hàng">
              {bankConfig ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.5rem" }}>
                    <span className="muted">Ngân hàng thụ hưởng:</span>
                    <strong>{bankConfig.bankName}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.5rem" }}>
                    <span className="muted">Số tài khoản:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong>{bankConfig.accountNumber}</strong>
                      <button
                        onClick={() => handleCopy(bankConfig.accountNumber, "số tài khoản")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#3b82f6",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "500"
                        }}
                      >
                        {copiedField === "số tài khoản" ? "Đã chép" : "Chép"}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.5rem" }}>
                    <span className="muted">Chủ tài khoản:</span>
                    <strong style={{ textTransform: "uppercase" }}>{bankConfig.accountHolder}</strong>
                  </div>
                  {selectedFee && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.5rem" }}>
                      <span className="muted">Số tiền cần chuyển:</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ color: "#b91c1c" }}>{formatMoney(selectedFee.outstandingAmount)}</strong>
                        <button
                          onClick={() => handleCopy(String(selectedFee.outstandingAmount), "số tiền")}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#3b82f6",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500"
                          }}
                        >
                          {copiedField === "số tiền" ? "Đã chép" : "Chép"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="muted">Hệ thống chưa cấu hình tài khoản ngân hàng. Vui lòng liên hệ Admin.</p>
              )}
            </Card>

            {bankConfig && bankConfig.qrCodeImage && (
              <Card title="Quét mã QR để thanh toán">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.5rem 0" }}>
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "1rem",
                      padding: "1rem",
                      background: "#fff",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                      display: "inline-block",
                      textAlign: "center"
                    }}
                  >
                    <img
                      src={bankConfig.qrCodeImage}
                      alt="QR Code"
                      style={{
                        maxHeight: "260px",
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: "0.5rem"
                      }}
                    />
                  </div>
                  <p className="muted" style={{ fontSize: "0.85rem", marginTop: "1rem", textAlign: "center" }}>
                    Sử dụng ứng dụng Ngân hàng di động (Mobile Banking) quét mã QR ở trên để thanh toán tự động điền thông tin tài khoản.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
