import { useCallback, useEffect, useRef, useState } from "react";
import { announcementService, dashboardService } from "../services";
import { getApiErrorMessage } from "../utils/apiError";
import { Alert, BannerSlider, Loading } from "../components/common";
import "../styles.css";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────
   WelcomePopup
───────────────────────────────────────────── */
function WelcomePopup({ notice, onClose }) {
  const overlayRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
      <div
          ref={overlayRef}
          className="modal-backdrop wp-backdrop"
          onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      >
        <div className="modal modal-sm wp-modal" role="dialog" aria-modal="true">
          {notice.imageUrl ? (
              <div className="wp-header-img-wrap">
                <img src={notice.imageUrl} alt={notice.title} className="wp-header-img" />
                <button className="modal-close wp-close wp-close-on-img" onClick={onClose} aria-label="Đóng">✕</button>
              </div>
          ) : (
              <div className="wp-header">
                <div className="wp-header-icon">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <circle cx="14" cy="14" r="12" fill="rgba(255,250,240,0.2)" />
                    <path d="M8 14h8M12 10l4 4-4 4" stroke="#fffaf0" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <button className="modal-close wp-close" onClick={onClose} aria-label="Đóng">✕</button>
              </div>
          )}
          <div className="modal-body">
            <h3 className="wp-notice-title">{notice.title}</h3>
            {notice.content && <p className="wp-notice-body">{notice.content}</p>}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary btn-md" onClick={onClose}>Bỏ qua</button>
            <button className="btn btn-primary btn-md" onClick={onClose}>Đã hiểu</button>
          </div>
        </div>
      </div>
  );
}

/* ─────────────────────────────────────────────
   Metric Card
───────────────────────────────────────────── */
function Metric({ label, value, icon }) {
  return (
      <article className="metric-card hp-metric">
        <span className="hp-metric-icon" aria-hidden="true">{icon}</span>
        <p className="metric-label">{label}</p>
        <p className="metric-value">{value}</p>
      </article>
  );
}

/* ─────────────────────────────────────────────
   Feature Card
───────────────────────────────────────────── */
function FeatureCard({ icon, title, desc }) {
  return (
      <div className="hp-feature-card">
        <div className="hp-feature-icon">{icon}</div>
        <h3 className="hp-feature-title">{title}</h3>
        <p className="hp-feature-desc">{desc}</p>
      </div>
  );
}

/* ─────────────────────────────────────────────
   Animated counter
───────────────────────────────────────────── */
function StatPill({ value, label }) {
  return (
      <div className="hp-stat-pill">
        <span className="hp-stat-value">{value}</span>
        <span className="hp-stat-label">{label}</span>
      </div>
  );
}

/* ─────────────────────────────────────────────
   HomePage
───────────────────────────────────────────── */
export default function HomePage() {
  const [summary, setSummary]         = useState(null);
  const [sliderItems, setSliderItems] = useState([]);
  const [popupNotice, setPopupNotice] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const closePopup = useCallback(() => {
    if (popupNotice) sessionStorage.setItem(`edulingo_notice_${popupNotice.id}`, "1");
    setPopupNotice(null);
  }, [popupNotice]);

  useEffect(() => {
    let active = true;
    async function loadHomeData() {
      setLoading(true);
      setError("");
      const [summaryResult, announcementsResult] = await Promise.allSettled([
        dashboardService.getSummary(),
        announcementService.getAll(),
      ]);
      if (!active) return;
      if (summaryResult.status === "fulfilled") {
        setSummary(summaryResult.value);
      } else {
        setError(getApiErrorMessage(summaryResult.reason, "Không tải được tổng quan hệ thống."));
      }
      if (announcementsResult.status === "fulfilled") {
        const all = Array.isArray(announcementsResult.value) ? announcementsResult.value : [];
        const now = new Date();
        const live = all.filter((a) => {
          if (!a.active) return false;
          if (a.startDate && new Date(a.startDate) > now) return false;
          if (a.endDate   && new Date(a.endDate)   < now) return false;
          return true;
        });
        setSliderItems(live.filter((a) => a.type === "SLIDER"));
        const popups = live.filter((a) => a.type === "POPUP" || a.type === "NOTICE");
        if (popups.length > 0) {
          const latest = [...popups].sort((a, b) => b.id - a.id)[0];
          const seenKey = `edulingo_notice_${latest.id}`;
          if (!sessionStorage.getItem(seenKey)) {
            setTimeout(() => { if (active) setPopupNotice(latest); }, 700);
          }
        }
      }
      setLoading(false);
    }
    loadHomeData();
    return () => { active = false; };
  }, []);

  if (loading) return <Loading />;

  return (
      <>
        {popupNotice && <WelcomePopup notice={popupNotice} onClose={closePopup} />}

        <main className="hp-main">

          {/* ── HERO ── */}
          <section className="hp-hero">
            <div className="hero-icon icon-book">
              📚
            </div>

            <div className="hero-icon icon-student">
              👨‍🎓
            </div>

            <div className="hero-icon icon-chart">
              📈
            </div>

            <div className="hero-icon icon-trophy">
              🏆
            </div>

            <div className="hero-icon icon-star">
              ⭐
            </div>
            <div className="hp-hero-content">

              <div className="hp-eyebrow-pill">
                ⭐EC ENGLISH CENTER · HỆ THỐNG QUẢN LÝ
              </div>

              <h1 className="hp-headline">
                Nền tảng quản lý
                <span> trung tâm Tiếng Anh </span>
               hiện đại và toàn diện
              </h1>

              <p className="hp-lead">
                Quản lý học viên, lớp học, giáo viên, học phí và báo cáo
                trên một hệ thống duy nhất. Đơn giản, chính xác và hiệu quả.
              </p>

              <div className="hp-cta-row">
                <Link to="/login" className="hp-cta-primary">
                  Vào trang quản lý
                </Link>
              </div>
              <div className="hero-blob blob-1"></div>
              <div className="hero-blob blob-2"></div>
            </div>

          </section>

          {/* ── ERROR ── */}
          {error && (
              <div className="hp-section">
                <Alert type="error" message={error} />
              </div>
          )}

          {/* ── BANNER SLIDER ── */}
          <section className="hp-section">
            <div className="hp-section-header">
              <p className="eyebrow">📢 Thông tin trung tâm</p>
              <h3>Tin tức &amp; Thông báo</h3>
            </div>
            <BannerSlider items={sliderItems} />
          </section>

          {/* ── FEATURES ── */}
          <section className="hp-features-section">
            <div className="hp-section-header">
              <p className="eyebrow">Tính năng nổi bật</p>
              <h2>Mọi thứ bạn cần trong một nơi</h2>
            </div>
            <div className="grid three">
              <FeatureCard
                  icon={
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect x="2" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M7 2v3M15 2v3M2 9h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  }
                  title="Quản lý lịch học"
                  desc="Theo dõi điểm danh và thông báo tự động đến phụ huynh."
              />
              <FeatureCard
                  icon={
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M2 19c0-3.866 3.134-7 7-7h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M16 14v6M13 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  }
                  title="Hồ sơ học sinh"
                  desc="Lưu trữ thông tin đầy đủ, lịch sử học tập, các lớp đã đăng ký."
              />
              <FeatureCard
                  icon={
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <rect x="2" y="2" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M7 11l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  }
                  title="Quản lý học phí"
                  desc="Theo dõi công nợ và nhắc nhở thanh toán tự động qua Gmail."
              />
              <FeatureCard
                  icon={
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M3 17l4-4 4 4 4-6 4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  }
                  title="Báo cáo & Thống kê"
                  desc="Dashboard trực quan, biểu đồ doanh thu, tỷ lệ đi học và các chỉ số vận hành."
              />
              <FeatureCard
                  icon={
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M4 4h14v10H4z" stroke="currentColor" strokeWidth="1.8" rx="2"/>
                      <path d="M8 18h6M11 14v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  }
                  title="Thông báo tự động"
                  desc="Gửi thông báo tới phụ huynh qua email chỉ bằng vài cú nhấp."
              />
              <FeatureCard
                  icon={
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M11 7v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  }
                  title="Phân quyền vai trò"
                  desc="Admin, giáo viên, học sinh, phụ huynh — mỗi vai trò có giao diện và quyền riêng."
              />
            </div>
          </section>
          <footer className="ec-footer">
            <p>© 2026 EC English Center</p>
            <span>Built with React & Spring Boot</span>
          </footer>
        </main>
      </>
  );
}