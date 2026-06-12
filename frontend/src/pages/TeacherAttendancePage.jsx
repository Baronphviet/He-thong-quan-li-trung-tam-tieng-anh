import { useEffect, useMemo, useState } from "react";
import { attendanceService, classService } from "../services";
import { useAuth } from "../store";
import { sameId } from "../utils/auth";
import { getApiErrorMessage } from "../utils/apiError";
import { ATTENDANCE_STATUS_OPTIONS } from "../utils/constants";
import { Alert, Button, Card, Input, Loading, Select } from "../components/common";
import { useNotification } from "../hooks";

export default function TeacherAttendancePage() {
  const { role, userId } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [sheet, setSheet] = useState([]);
  const [sessionNote, setSessionNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [error, setError] = useState("");
  const { addNotification } = useNotification();

  useEffect(() => {
    loadClasses();
  }, [role, userId]);

  useEffect(() => {
    if (selectedClassId) {
      loadSessions(selectedClassId);
    } else {
      setSessions([]);
      setSelectedSessionId("");
      setSheet([]);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedSessionId) {
      loadSheet(selectedSessionId);
    } else {
      setSheet([]);
    }
  }, [selectedSessionId]);

  async function loadClasses() {
    setLoading(true);
    setError("");
    try {
      const data = await classService.getAll();
      const allClasses = Array.isArray(data) ? data : [];
      const visible = role === "TEACHER"
        ? allClasses.filter((item) => sameId(item.teacherId, userId))
        : allClasses;
      setClasses(visible);
      if (visible.length === 1) {
        setSelectedClassId(String(visible[0].id));
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadSessions(classId) {
    try {
      const data = await attendanceService.listSessions(classId);
      const nextSessions = Array.isArray(data) ? data : [];
      setSessions(nextSessions);
      setSelectedSessionId(nextSessions[0] ? String(nextSessions[0].id) : "");
    } catch (err) {
      addNotification(err.message, "error");
    }
  }

  async function loadSheet(sessionId) {
    try {
      const data = await attendanceService.getSheet(sessionId);
      setSheet(Array.isArray(data) ? data.map((row) => ({
        ...row,
        status: row.status || "PRESENT"
      })) : []);
    } catch (err) {
      addNotification(err.message, "error");
    }
  }

  async function handleCreateSession() {
    if (!selectedClassId) return;
    setCreatingSession(true);
    try {
      const session = await attendanceService.createSession(Number(selectedClassId), {
        sessionDate: new Date().toISOString().slice(0, 10),
        note: sessionNote || null,
        createdBy: userId
      });
      addNotification("Tạo buổi học mới thành công", "success");
      setSessionNote("");
      await loadSessions(selectedClassId);
      setSelectedSessionId(String(session.id));
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setCreatingSession(false);
    }
  }

  async function handleSaveAttendance() {
    if (!selectedSessionId) return;
    setSaving(true);
    try {
      const payload = sheet.map((row) => ({
        studentId: row.studentId,
        status: row.status || "PRESENT",
        note: row.note || null
      }));
      const updated = await attendanceService.saveSheet(Number(selectedSessionId), payload);
      setSheet(updated);
      addNotification("Lưu điểm danh thành công", "success");
    } catch (err) {
      addNotification(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const selectedSession = useMemo(
    () => sessions.find((item) => sameId(item.id, selectedSessionId)),
    [sessions, selectedSessionId]
  );

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <p className="eyebrow">Điểm danh</p>
        <h1>Điểm danh học sinh theo buổi học</h1>
        <p className="lead">Chọn lớp, tạo buổi học và đánh dấu có mặt / vắng / đi muộn.</p>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu">{error}</Alert>}

      <section className="section grid two">
        <Card title="Chọn lớp và buổi học">
          <Select
            id="classId"
            label="Lớp học"
            name="classId"
            value={selectedClassId}
            onChange={(event) => setSelectedClassId(event.target.value)}
            options={classes.map((item) => ({ value: String(item.id), label: item.className }))}
          />
          <Select
            id="sessionId"
            label="Buổi học"
            name="sessionId"
            value={selectedSessionId}
            onChange={(event) => setSelectedSessionId(event.target.value)}
            options={sessions.map((item) => ({
              value: String(item.id),
              label: `Buổi ${item.sessionNumber} - ${item.sessionDate}`
            }))}
          />
          {selectedSession && (
            <p className="muted">
              Buổi {selectedSession.sessionNumber} ngày {selectedSession.sessionDate}
              {selectedSession.note ? ` - ${selectedSession.note}` : ""}
            </p>
          )}
        </Card>

        <Card title="Tạo buổi học hôm nay">
          <Input
            id="sessionNote"
            label="Ghi chú buổi học"
            name="sessionNote"
            value={sessionNote}
            onChange={(event) => setSessionNote(event.target.value)}
          />
          <div className="form-actions">
            <Button type="button" onClick={handleCreateSession} disabled={!selectedClassId || creatingSession}>
              {creatingSession ? "Đang tạo..." : "Tạo buổi học hôm nay"}
            </Button>
          </div>
        </Card>
      </section>

      <section className="section table-card">
        <div className="toolbar">
          <h2>Danh sách điểm danh</h2>
          <Button type="button" onClick={handleSaveAttendance} disabled={!selectedSessionId || saving || sheet.length === 0}>
            {saving ? "Đang lưu..." : "Lưu điểm danh"}
          </Button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Học sinh</th><th>Trạng thái</th><th>Ghi chú</th></tr>
            </thead>
            <tbody>
              {sheet.length === 0 && (
                <tr><td colSpan={3} className="muted">Chưa có học sinh hoặc chưa chọn buổi học.</td></tr>
              )}
              {sheet.map((row) => (
                <tr key={row.studentId}>
                  <td>{row.studentName}</td>
                  <td>
                    <select
                      className="form-input form-select"
                      value={row.status || "PRESENT"}
                      onChange={(event) => {
                        const nextStatus = event.target.value;
                        setSheet((current) => current.map((item) => (
                          item.studentId === row.studentId ? { ...item, status: nextStatus } : item
                        )));
                      }}
                    >
                      {ATTENDANCE_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="form-input"
                      value={row.note || ""}
                      onChange={(event) => {
                        const nextNote = event.target.value;
                        setSheet((current) => current.map((item) => (
                          item.studentId === row.studentId ? { ...item, note: nextNote } : item
                        )));
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
