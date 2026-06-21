import { useEffect, useState } from "react";
import { userService } from "../services";
import { useAuth } from "../store";
import { Alert, Card, Loading } from "../components/common";
import { getApiErrorMessage } from "../utils/apiError";
import { formatDate, formatMoney } from "../utils/format";

const roleLabels = {
  ADMIN: "Quản trị viên",
  TEACHER: "Giáo viên",
  STUDENT: "Học sinh",
  PARENT: "Phụ huynh"
};

export default function ProfilePage() {
  const { userId, role } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    loadProfile();
  }, [userId]);

  async function loadProfile() {
    setLoading(true);
    setError("");
    try {
      const data = await userService.getProfile(userId);
      setProfile(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero compact-hero">
        <h1>Hồ sơ của bạn</h1>
        <p className="lead">Xem thông tin tài khoản và dữ liệu liên quan đến vai trò {roleLabels[role] || role}.</p>
      </section>

      {error && <Alert type="error" title="Lỗi tải dữ liệu">{error}</Alert>}

      {profile && (
        <section className="section grid two">
          <Card title="Tài khoản">
            <ProfileRow label="Họ tên" value={profile.fullName} />
            <ProfileRow label="Tài khoản" value={profile.username} />
            <ProfileRow label="Vai trò" value={roleLabels[profile.role] || profile.role} />
            <ProfileRow label="Email" value={profile.email} />
            <ProfileRow label="Điện thoại" value={profile.phone} />
            <ProfileRow label="Trạng thái" value={profile.active === false ? "Ngưng hoạt động" : "Đang hoạt động"} />
          </Card>

          <Card title="Thông tin bổ sung">
            {profile.role === "STUDENT" && (
              <>
                <ProfileRow label="Ngày sinh" value={formatDate(profile.dateOfBirth)} />
                <ProfileRow label="Địa chỉ" value={profile.address} />
                <ProfileRow label="Ngày nhập học" value={formatDate(profile.enrollDate)} />
              </>
            )}
            {profile.role === "TEACHER" && (
              <>
                <ProfileRow label="Bằng cấp" value={profile.degree} />
                <ProfileRow label="Chuyên môn" value={profile.specialization} />
                <ProfileRow label="Lương cơ bản" value={formatMoney(profile.salaryRate)} />
                <ProfileRow label="Ngày vào làm" value={formatDate(profile.joinDate)} />
              </>
            )}
            {profile.role === "PARENT" && (
              <>
                <ProfileRow label="Quan hệ" value={profile.relationship} />
                <ProfileRow label="Zalo ID" value={profile.zaloId} />
                <ProfileRow label="Facebook ID" value={profile.facebookId} />
                <ProfileRow label="Học sinh liên kết" value={(profile.studentIds || []).join(", ") || "Chưa liên kết"} />
              </>
            )}
            {profile.role === "ADMIN" && (
              <p className="muted">Tài khoản quản trị hệ thống trung tâm tiếng Anh.</p>
            )}
          </Card>
        </section>
      )}
    </main>
  );
}

function ProfileRow({ label, value }) {
  return (
    <p className="profile-row">
      <span className="profile-label">{label}</span>
      <strong>{value || "-"}</strong>
    </p>
  );
}
