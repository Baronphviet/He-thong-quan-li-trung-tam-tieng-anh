import { useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../services/apiClient";
import { formatMoney } from "../utils/format";

const emptyClass = {
  id: "",
  className: "",
  ageGroupId: "",
  academicYearId: "",
  teacherId: "",
  maxStudents: 18,
  schedule: "T2-T4-T6|18:00-19:30",
  tuitionFee: 1800000,
  status: "OPEN"
};

export default function AdminDashboardPage() {
  const [data, setData] = useState({
    summary: null,
    classes: [],
    teachers: [],
    students: [],
    parents: [],
    enrollments: [],
    fees: [],
    finance: [],
    studentChange: [],
    announcements: [],
    years: [],
    groups: []
  });
  const [classForm, setClassForm] = useState(emptyClass);
  const [studentForm, setStudentForm] = useState({
    username: "",
    fullName: "",
    phone: "",
    address: "",
    enrollDate: new Date().toISOString().slice(0, 10)
  });
  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: "",
    classId: "",
    discountRate: 0,
    totalSessions: 12
  });
  const [paymentForm, setPaymentForm] = useState({
    feeId: "",
    amount: "",
    method: "CASH",
    transferRef: ""
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    type: "BANNER",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    active: true
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const unpaidFees = useMemo(
    () => data.fees.filter((fee) => fee.status !== "PAID"),
    [data.fees]
  );

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const [
        summary,
        classes,
        teachers,
        students,
        parents,
        enrollments,
        fees,
        finance,
        studentChange,
        announcements,
        years,
        groups
      ] = await Promise.all([
        apiGet("/dashboard/summary"),
        apiGet("/classes"),
        apiGet("/teachers"),
        apiGet("/students"),
        apiGet("/parents"),
        apiGet("/enrollments"),
        apiGet("/monthly-fees"),
        apiGet("/reports/finance-monthly"),
        apiGet("/reports/student-change"),
        apiGet("/announcements"),
        apiGet("/master/academic-years"),
        apiGet("/master/age-groups")
      ]);
      setData({ summary, classes, teachers, students, parents, enrollments, fees, finance, studentChange, announcements, years, groups });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function submitClass(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    const payload = {
      className: classForm.className,
      ageGroupId: toNumber(classForm.ageGroupId),
      academicYearId: toNumber(classForm.academicYearId),
      teacherId: toNumberOrNull(classForm.teacherId),
      maxStudents: toNumber(classForm.maxStudents),
      schedule: classForm.schedule,
      tuitionFee: toNumber(classForm.tuitionFee),
      status: classForm.status
    };
    try {
      if (classForm.id) {
        await apiPut(`/classes/${classForm.id}`, payload);
        setMessage("Da cap nhat lop va backend da tinh lai invoice UNPAID neu hoc phi thay doi.");
      } else {
        await apiPost("/classes", payload);
        setMessage("Da tao lop moi.");
      }
      setClassForm(emptyClass);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitStudent(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await apiPost("/students", {
        username: studentForm.username,
        password: "student123",
        fullName: studentForm.fullName,
        phone: studentForm.phone,
        address: studentForm.address,
        enrollDate: studentForm.enrollDate
      });
      setStudentForm({ username: "", fullName: "", phone: "", address: "", enrollDate: new Date().toISOString().slice(0, 10) });
      setMessage("Da tao hoc sinh.");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitEnrollment(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await apiPost("/enrollments", {
        studentId: toNumber(enrollmentForm.studentId),
        classId: toNumber(enrollmentForm.classId),
        discountRate: Number(enrollmentForm.discountRate || 0),
        totalSessions: toNumber(enrollmentForm.totalSessions)
      });
      setEnrollmentForm({ studentId: "", classId: "", discountRate: 0, totalSessions: 12 });
      setMessage("Da xep lop va backend da tu sinh monthly fee cho thang hien tai.");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitPayment(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await apiPost("/payments", {
        feeId: toNumber(paymentForm.feeId),
        amount: toNumber(paymentForm.amount),
        method: paymentForm.method,
        transferRef: paymentForm.transferRef,
        receivedBy: 1
      });
      setPaymentForm({ feeId: "", amount: "", method: "CASH", transferRef: "" });
      setMessage("Da ghi nhan thanh toan va cap nhat trang thai hoc phi.");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitAnnouncement(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await apiPost("/announcements", {
        ...announcementForm,
        createdBy: 1
      });
      setAnnouncementForm({ title: "", content: "", type: "BANNER", startDate: new Date().toISOString().slice(0, 10), endDate: "", active: true });
      setMessage("Da tao thong bao.");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function closeClass(id) {
    setError("");
    try {
      await apiDelete(`/classes/${id}`);
      setMessage("Da dong lop theo soft workflow.");
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function editClass(item) {
    setClassForm({
      id: item.id,
      className: item.className,
      ageGroupId: item.ageGroupId,
      academicYearId: item.academicYearId,
      teacherId: item.teacherId || "",
      maxStudents: item.maxStudents,
      schedule: item.schedule || "",
      tuitionFee: item.tuitionFee,
      status: item.status
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Admin operation center</p>
        <h1>Dieu hanh lop, hoc phi va bao cao tren cung mot dashboard.</h1>
        <p className="lead">
          Cac form ben duoi goi API that. Thu tao enrollment hoac sua hoc phi lop de kiem tra
          business logic tu sinh/cap nhat monthly fee.
        </p>
      </section>

      {loading && <p className="message">Dang tai du lieu...</p>}
      {message && <p className="message">{message}</p>}
      {error && <p className="message error">{error}</p>}

      <section className="section grid four">
        <Metric label="Hoc sinh" value={data.summary?.activeStudents ?? "-"} />
        <Metric label="Giao vien" value={data.summary?.activeTeachers ?? "-"} />
        <Metric label="Lop OPEN" value={data.summary?.openClasses ?? "-"} />
        <Metric label="Cong no" value={formatMoney(data.summary?.monthOutstanding)} />
      </section>

      <section className="section grid two">
        <form className="form-card" onSubmit={submitClass}>
          <div className="toolbar">
            <div>
              <p className="eyebrow">UC-A01 / UC-A05</p>
              <h2>{classForm.id ? "Sua lop hoc" : "Tao lop hoc"}</h2>
            </div>
            {classForm.id && <button className="button secondary" type="button" onClick={() => setClassForm(emptyClass)}>Huy sua</button>}
          </div>
          <div className="form-grid">
            <label>Ten lop
              <input value={classForm.className} onChange={(event) => setClassForm({ ...classForm, className: event.target.value })} required />
            </label>
            <label>Hoc phi
              <input type="number" value={classForm.tuitionFee} onChange={(event) => setClassForm({ ...classForm, tuitionFee: event.target.value })} required />
            </label>
            <label>Nhom tuoi
              <select value={classForm.ageGroupId} onChange={(event) => setClassForm({ ...classForm, ageGroupId: event.target.value })} required>
                <option value="">Chon nhom</option>
                {data.groups.map((group) => <option key={group.id} value={group.id}>{group.groupName}</option>)}
              </select>
            </label>
            <label>Nam hoc
              <select value={classForm.academicYearId} onChange={(event) => setClassForm({ ...classForm, academicYearId: event.target.value })} required>
                <option value="">Chon nam</option>
                {data.years.map((year) => <option key={year.id} value={year.id}>{year.yearName}</option>)}
              </select>
            </label>
            <label>Giao vien
              <select value={classForm.teacherId} onChange={(event) => setClassForm({ ...classForm, teacherId: event.target.value })}>
                <option value="">Chua gan</option>
                {data.teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}
              </select>
            </label>
            <label>Si so toi da
              <input type="number" value={classForm.maxStudents} onChange={(event) => setClassForm({ ...classForm, maxStudents: event.target.value })} />
            </label>
            <label>Lich hoc
              <input value={classForm.schedule} onChange={(event) => setClassForm({ ...classForm, schedule: event.target.value })} />
            </label>
            <label>Trang thai
              <select value={classForm.status} onChange={(event) => setClassForm({ ...classForm, status: event.target.value })}>
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </label>
          </div>
          <p><button className="button" type="submit">{classForm.id ? "Cap nhat lop" : "Tao lop"}</button></p>
        </form>

        <form className="form-card" onSubmit={submitEnrollment}>
          <p className="eyebrow">UC-A03 / Auto invoice</p>
          <h2>Xep hoc sinh vao lop</h2>
          <div className="form-grid">
            <label>Hoc sinh
              <select value={enrollmentForm.studentId} onChange={(event) => setEnrollmentForm({ ...enrollmentForm, studentId: event.target.value })} required>
                <option value="">Chon hoc sinh</option>
                {data.students.map((student) => <option key={student.id} value={student.id}>{student.fullName}</option>)}
              </select>
            </label>
            <label>Lop
              <select value={enrollmentForm.classId} onChange={(event) => setEnrollmentForm({ ...enrollmentForm, classId: event.target.value })} required>
                <option value="">Chon lop</option>
                {data.classes.map((item) => <option key={item.id} value={item.id}>{item.className}</option>)}
              </select>
            </label>
            <label>Giam gia decimal
              <input type="number" min="0" max="1" step="0.01" value={enrollmentForm.discountRate} onChange={(event) => setEnrollmentForm({ ...enrollmentForm, discountRate: event.target.value })} />
            </label>
            <label>So buoi tinh phi
              <input type="number" value={enrollmentForm.totalSessions} onChange={(event) => setEnrollmentForm({ ...enrollmentForm, totalSessions: event.target.value })} />
            </label>
          </div>
          <p><button className="button" type="submit">Xep lop</button></p>
        </form>
      </section>

      <section className="section grid two">
        <form className="form-card" onSubmit={submitStudent}>
          <p className="eyebrow">UC-A03</p>
          <h2>Tao hoc sinh nhanh</h2>
          <div className="form-grid">
            <label>Username
              <input value={studentForm.username} onChange={(event) => setStudentForm({ ...studentForm, username: event.target.value })} required />
            </label>
            <label>Ho ten
              <input value={studentForm.fullName} onChange={(event) => setStudentForm({ ...studentForm, fullName: event.target.value })} required />
            </label>
            <label>Dien thoai
              <input value={studentForm.phone} onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value })} />
            </label>
            <label>Ngay nhap hoc
              <input type="date" value={studentForm.enrollDate} onChange={(event) => setStudentForm({ ...studentForm, enrollDate: event.target.value })} />
            </label>
            <label>Dia chi
              <input value={studentForm.address} onChange={(event) => setStudentForm({ ...studentForm, address: event.target.value })} />
            </label>
          </div>
          <p><button className="button" type="submit">Tao hoc sinh</button></p>
        </form>

        <form className="form-card" onSubmit={submitPayment}>
          <p className="eyebrow">UC-A06</p>
          <h2>Ghi nhan thanh toan</h2>
          <div className="form-grid">
            <label>Invoice
              <select value={paymentForm.feeId} onChange={(event) => setPaymentForm({ ...paymentForm, feeId: event.target.value })} required>
                <option value="">Chon invoice</option>
                {unpaidFees.map((fee) => (
                  <option key={fee.id} value={fee.id}>
                    #{fee.id} - {fee.studentName} - con no {formatMoney(fee.outstandingAmount)}
                  </option>
                ))}
              </select>
            </label>
            <label>So tien
              <input type="number" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} required />
            </label>
            <label>Phuong thuc
              <select value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })}>
                <option value="CASH">CASH</option>
                <option value="TRANSFER">TRANSFER</option>
              </select>
            </label>
            <label>Ma chuyen khoan
              <input value={paymentForm.transferRef} onChange={(event) => setPaymentForm({ ...paymentForm, transferRef: event.target.value })} />
            </label>
          </div>
          <p><button className="button" type="submit">Ghi nhan payment</button></p>
        </form>
      </section>

      <section className="section grid two">
        <form className="form-card" onSubmit={submitAnnouncement}>
          <p className="eyebrow">UC-A09</p>
          <h2>Tao thong bao</h2>
          <div className="form-grid">
            <label>Tieu de
              <input value={announcementForm.title} onChange={(event) => setAnnouncementForm({ ...announcementForm, title: event.target.value })} required />
            </label>
            <label>Loai
              <select value={announcementForm.type} onChange={(event) => setAnnouncementForm({ ...announcementForm, type: event.target.value })}>
                <option value="BANNER">BANNER</option>
                <option value="POPUP">POPUP</option>
                <option value="SLIDER">SLIDER</option>
              </select>
            </label>
            <label>Bat dau
              <input type="date" value={announcementForm.startDate} onChange={(event) => setAnnouncementForm({ ...announcementForm, startDate: event.target.value })} />
            </label>
            <label>Ket thuc
              <input type="date" value={announcementForm.endDate} onChange={(event) => setAnnouncementForm({ ...announcementForm, endDate: event.target.value })} />
            </label>
          </div>
          <label>Noi dung
            <textarea value={announcementForm.content} onChange={(event) => setAnnouncementForm({ ...announcementForm, content: event.target.value })} />
          </label>
          <p><button className="button" type="submit">Dang thong bao</button></p>
        </form>

        <div className="panel">
          <p className="eyebrow">UC-A07</p>
          <h2>Thang gan nhat</h2>
          <p className="lead">
            Du thu: {formatMoney(data.summary?.monthExpected)}<br />
            Thuc thu: {formatMoney(data.summary?.monthCollected)}<br />
            Luong giao vien: {formatMoney(data.summary?.monthTeacherSalaryCost)}
          </p>
        </div>
      </section>

      <section className="section table-card">
        <div className="toolbar">
          <div>
            <p className="eyebrow">Lop hoc</p>
            <h2>Danh sach lop</h2>
          </div>
        </div>
        <Table>
          <thead><tr><th>Lop</th><th>Giao vien</th><th>Lich</th><th>Hoc phi</th><th>Status</th><th>Thao tac</th></tr></thead>
          <tbody>
            {data.classes.map((item) => (
              <tr key={item.id}>
                <td>{item.className}<br /><span className="muted">{item.ageGroupName} - {item.academicYearName}</span></td>
                <td>{item.teacherName || "-"}</td>
                <td>{item.schedule}</td>
                <td>{formatMoney(item.tuitionFee)}</td>
                <td><Status value={item.status} /></td>
                <td>
                  <button className="button secondary" type="button" onClick={() => editClass(item)}>Sua</button>{" "}
                  <button className="button secondary" type="button" onClick={() => closeClass(item.id)}>Dong</button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="section table-card">
        <p className="eyebrow">Monthly fee</p>
        <h2>Hoa don hoc phi</h2>
        <Table>
          <thead><tr><th>Invoice</th><th>Hoc sinh</th><th>Lop</th><th>Ky</th><th>So tien</th><th>Da thu</th><th>Status</th></tr></thead>
          <tbody>
            {data.fees.map((fee) => (
              <tr key={fee.id}>
                <td>#{fee.id}</td>
                <td>{fee.studentName}</td>
                <td>{fee.className}</td>
                <td>{fee.month}/{fee.year}</td>
                <td>{formatMoney(fee.finalAmount)}<br /><span className="muted">Giam {formatMoney(fee.discountAmount)}</span></td>
                <td>{formatMoney(fee.paidAmount)}<br /><span className="muted">Con {formatMoney(fee.outstandingAmount)}</span></td>
                <td><Status value={fee.status} /></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section className="section grid two">
        <ReportTable title="Bao cao tai chinh" rows={data.finance} columns={[
          ["period", (row) => `${row.month}/${row.year}`],
          ["expected", (row) => formatMoney(row.tuitionExpected)],
          ["collected", (row) => formatMoney(row.tuitionCollected)],
          ["outstanding", (row) => formatMoney(row.tuitionOutstanding)]
        ]} />
        <ReportTable title="Bien dong hoc sinh" rows={data.studentChange} columns={[
          ["period", (row) => `${row.month}/${row.year}`],
          ["unique", (row) => row.uniqueNewStudents],
          ["enrollments", (row) => row.totalNewEnrollments],
          ["dropped", (row) => row.droppedStudents]
        ]} />
      </section>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}

function Table({ children }) {
  return <div className="table-scroll"><table>{children}</table></div>;
}

function Status({ value }) {
  const danger = ["UNPAID", "DROPPED", "CLOSED"].includes(value);
  const warn = ["PARTIAL", "SUSPENDED"].includes(value);
  return <span className={`status-pill ${danger ? "danger" : warn ? "warn" : ""}`}>{value}</span>;
}

function ReportTable({ title, rows, columns }) {
  return (
    <div className="table-card">
      <p className="eyebrow">SQL View</p>
      <h2>{title}</h2>
      <Table>
        <thead>
          <tr>{columns.map(([key]) => <th key={key}>{key}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map(([key, render]) => <td key={key}>{render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function toNumber(value) {
  return Number(value);
}

function toNumberOrNull(value) {
  return value === "" || value === null || value === undefined ? null : Number(value);
}
