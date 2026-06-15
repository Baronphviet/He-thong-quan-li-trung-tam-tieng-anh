import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Input, Alert } from "../components/common";
import { authService } from "../services";
import { useAuth } from "../store";
import { getRoleHome } from "../utils/auth";
import { getApiErrorMessage } from "../utils/apiError";

export default function LoginPage() {
  const { isAuthenticated, role, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ username: "admin", password: "admin" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || getRoleHome(role)} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!values.username.trim() || !values.password.trim()) {
      setError("Vui lòng nhập tài khoản và mật khẩu.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await authService.login({
        username: values.username.trim(),
        password: values.password,
      });
      if (!user?.token || !user?.role) throw new Error("Phản hồi đăng nhập không hợp lệ.");
      login(user);
      navigate(location.state?.from?.pathname || getRoleHome(user.role), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Đăng nhập thất bại."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="login-panel">
        <p className="eyebrow">Đăng nhập hệ thống</p>
        <h1>Trung tâm Tiếng Anh</h1>
        <p className="lead">
          Không có đăng ký công khai. Tài khoản được admin tạo và cấp riêng cho từng vai trò.
        </p>

        {error && <Alert type="error" title="Đăng nhập thất bại">{error}</Alert>}

        <form className="login-form" onSubmit={handleSubmit}>
          <Input
            id="username" label="Tài khoản" name="username"
            value={values.username} onChange={handleChange}
            autoComplete="username" disabled={submitting}
          />
          <Input
            id="password" label="Mật khẩu" name="password" type="password"
            value={values.password} onChange={handleChange}
            autoComplete="current-password" disabled={submitting}
          />

          <div style={{ textAlign: "right", marginTop: "-4px" }}>
            <button
              type="button"
              onClick={() => setShowForgot((v) => !v)}
              style={{
                background: "none", border: "none", padding: 0,
                color: "var(--brand)", fontWeight: 500,
                fontSize: "0.85rem", cursor: "pointer",
              }}
            >
              Quên mật khẩu?
            </button>
          </div>

          {showForgot && (
            <div className="alert alert-info" style={{ marginBottom: 0 }}>
              <div className="alert-content">
                <span className="alert-title">Liên hệ quản trị viên</span>
                <p className="alert-message">
                  📞 0901 234 567
                  <br />
                  ✉️ admin@ecenglish.vn
                </p>
              </div>
            </div>
          )}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <p className="muted">Mặc định demo: admin / admin</p>
      </section>
    </main>
  );
}