import { useEffect, useState } from "react";
import { paymentService } from "../../services";
import { Alert, Button, Card, Input, Loading, Modal, Select, Table } from "../../components/common";
import { useForm, useModal, useNotification } from "../../hooks";
import { createValidator, validators } from "../../utils/validators";
import { PAYMENT_METHOD_OPTIONS } from "../../utils/constants";
import { formatMoney, removeAccents } from "../../utils/format";

const emptyPayment = {
  feeId: "",
  amount: "",
  method: "CASH",
  transferRef: ""
};

const validateRules = {
  feeId: [validators.required],
  amount: [validators.required, validators.number, validators.min(1)],
  method: [validators.required]
};

export default function PaymentsPage() {
  const [fees, setFees] = useState([]);
  const [finance, setFinance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addNotification } = useNotification();
  const { isOpen, open, close } = useModal();
  const form = useForm(emptyPayment, handleSubmit, createValidator(validateRules));

  const [bankConfig, setBankConfig] = useState({
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    qrCodeImage: ""
  });
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [feesData, financeData, bankConfigData] = await Promise.all([
        paymentService.getAll(),
        paymentService.getFinanceReport(),
        paymentService.getBankConfig()
      ]);
      setFees(Array.isArray(feesData) ? feesData : []);
      setFinance(Array.isArray(financeData) ? financeData : []);
      if (bankConfigData) {
        setBankConfig(bankConfigData);
      }
    } catch (err) {
      setError(err.message);
      addNotification(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(values) {
    try {
      await paymentService.processPayment({
        feeId: Number(values.feeId),
        amount: Number(values.amount),
        method: values.method,
        transferRef: values.transferRef || null
      });
      addNotification("Ghi nhận thanh toán thành công", "success");
      form.resetForm();
      close();
      await loadData();
    } catch (err) {
      addNotification(err.message, "error");
    }
  }

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setBankConfig((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBankConfig((prev) => ({
        ...prev,
        qrCodeImage: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await paymentService.updateBankConfig(bankConfig);
      addNotification("Cập nhật thông tin ngân hàng thành công", "success");
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setSavingConfig(false);
    }
  };

  const feesColumns = [
    { key: "studentName", label: "Học sinh" },
    { key: "className", label: "Lớp" },
    {
      key: "paymentCode",
      label: "Mã thanh toán",
      render: (_, row) => (
        <code style={{ fontSize: "14px", fontWeight: "bold", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#0f172a" }}>
          HD{row.id} {removeAccents(row.studentName || "").toUpperCase()}
        </code>
      )
    },
    { key: "finalAmount", label: "Cần thu", render: (value) => formatMoney(value) },
    { key: "paidAmount", label: "Đã đóng", render: (value) => formatMoney(value) },
    { key: "outstandingAmount", label: "Còn nợ", render: (value) => formatMoney(value) },
    { key: "status", label: "Trạng thái", render: (value) => <span className={`status-pill ${value === "UNPAID" ? "danger" : value === "PARTIAL" ? "warn" : ""}`}>{value}</span> },
    {
      key: "actions",
      label: "Hành động",
      render: (_, row) => row.status !== "PAID" ? (
        <Button
          variant="success"
          size="sm"
          type="button"
          onClick={() => {
            form.setValues({
              ...emptyPayment,
              feeId: String(row.id),
              amount: row.outstandingAmount ?? row.finalAmount ?? ""
            });
            open();
          }}
        >
          Thanh toán
        </Button>
      ) : null
    }
  ];

  const financeColumns = [
    { key: "month", label: "Kỳ", render: (_, row) => `${row.month}/${row.year}` },
    { key: "tuitionCollected", label: "Thực thu", render: (value) => formatMoney(value) },
    { key: "tuitionOutstanding", label: "Công nợ", render: (value) => formatMoney(value) }
  ];

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <h1>Hóa đơn học phí và công nợ</h1>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu" onClose={() => setError("")}>{error}</Alert>}

      <section className="section grid two">
        <Card title="Tình hình thu chi">
          <Table columns={financeColumns} data={finance} empty="Chưa có dữ liệu" />
        </Card>

        <Card title="Cấu hình tài khoản ngân hàng & QR Code">
          <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                id="bankName"
                name="bankName"
                label="Tên ngân hàng"
                value={bankConfig.bankName || ""}
                onChange={handleConfigChange}
                required
              />
              <Input
                id="accountNumber"
                name="accountNumber"
                label="Số tài khoản"
                value={bankConfig.accountNumber || ""}
                onChange={handleConfigChange}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
              <Input
                id="accountHolder"
                name="accountHolder"
                label="Chủ tài khoản"
                value={bankConfig.accountHolder || ""}
                onChange={handleConfigChange}
                required
              />
              <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                <label htmlFor="qrCodeUpload" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Ảnh QR Code (Base64)</label>
                <input
                  id="qrCodeUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    display: 'block',
                    width: '100%',
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    padding: '0.375rem 0.5rem',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
            
            {bankConfig.qrCodeImage && (
              <div style={{ textAlign: 'center', marginTop: '0.5rem', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '1rem', background: '#f8fafc' }}>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>Xem trước mã QR:</p>
                <img
                  src={bankConfig.qrCodeImage}
                  alt="QR Code Preview"
                  style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', padding: '4px' }}
                />
                <div>
                  <Button
                    variant="danger"
                    size="sm"
                    type="button"
                    onClick={() => setBankConfig(prev => ({ ...prev, qrCodeImage: "" }))}
                    style={{ marginTop: '8px' }}
                  >
                    Xóa ảnh QR
                  </Button>
                </div>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button variant="success" type="submit" disabled={savingConfig}>
                {savingConfig ? "Đang cập nhật..." : "Cập nhật cấu hình"}
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <section className="section table-card">
        <p className="eyebrow">Hóa đơn học phí</p>
        <h2>Danh sách các khoản phí</h2>
        <Table columns={feesColumns} data={fees} empty="Không có khoản phí nào" />
      </section>

      <PaymentFormModal
        isOpen={isOpen}
        form={form}
        fees={fees}
        onClose={() => {
          form.resetForm();
          close();
        }}
      />
    </main>
  );
}

function PaymentFormModal({ isOpen, form, fees, onClose }) {
  const unpaidFees = fees.filter((fee) => fee.status !== "PAID");

  return (
    <Modal
      isOpen={isOpen}
      title="Ghi nhận thanh toán"
      onClose={onClose}
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onClose}>Hủy</Button>
          <Button variant="success" type="submit" form="payment-form" disabled={form.isSubmitting}>
            {form.isSubmitting ? "Đang lưu..." : "Lưu thanh toán"}
          </Button>
        </>
      )}
    >
      <form id="payment-form" onSubmit={form.handleSubmit}>
        <Select
          id="feeId"
          label="Chọn hóa đơn"
          name="feeId"
          value={form.values.feeId}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          error={form.touched.feeId && form.errors.feeId}
          options={unpaidFees.map((fee) => ({
            value: String(fee.id),
            label: `${fee.studentName || "Học sinh"} - ${fee.className || "Lớp"} - nợ ${formatMoney(fee.outstandingAmount)}`
          }))}
        />
        <Input id="amount" label="Số tiền thanh toán" name="amount" type="number" value={form.values.amount} onChange={form.handleChange} onBlur={form.handleBlur} error={form.touched.amount && form.errors.amount} />
        <Select id="method" label="Hình thức" name="method" value={form.values.method} onChange={form.handleChange} onBlur={form.handleBlur} error={form.touched.method && form.errors.method} showBlankOption={false} options={PAYMENT_METHOD_OPTIONS} />
        {form.values.method === "TRANSFER" && (
          <Input id="transferRef" label="Mã tham chiếu" name="transferRef" value={form.values.transferRef} onChange={form.handleChange} onBlur={form.handleBlur} />
        )}
      </form>
    </Modal>
  );
}
