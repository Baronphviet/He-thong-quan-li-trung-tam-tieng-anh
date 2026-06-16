import { useCallback, useEffect, useRef, useState } from "react";
import { announcementService, dashboardService } from "../services";
import { formatMoney } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";
import { Alert, BannerSlider, Loading } from "../components/common";

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

        {/* Header — ảnh banner nếu có, fallback gradient brand */}
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

        {/* Body */}
        <div className="modal-body">
          <h3 className="wp-notice-title">{notice.title}</h3>
          {notice.content && (
            <p className="wp-notice-body">{notice.content}</p>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary btn-md" onClick={onClose}>Bỏ qua</button>
          <button className="btn btn-primary btn-md" onClick={onClose}>Đã hiểu</button>
        </div>
      </div>
    </div>
  );
}

/* ── Metric card ────────────────────────────────────────────────────── */
function Metric({ label, value }) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
    </article>
  );
}

/* ── HomePage ───────────────────────────────────────────────────────── */
export default function HomePage() {
  const [summary, setSummary]         = useState(null);
  const [sliderItems, setSliderItems] = useState([]);
  const [popupNotice, setPopupNotice] = useState(null); // announcement type POPUP
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  const closePopup = useCallback(() => {
    if (popupNotice) {
      sessionStorage.setItem(`edulingo_notice_${popupNotice.id}`, "1");
    }
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

      // Summary
      if (summaryResult.status === "fulfilled") {
        setSummary(summaryResult.value);
      } else {
        setError(getApiErrorMessage(summaryResult.reason, "Không tải được tổng quan hệ thống."));
      }

      // Announcements — tách SLIDER và POPUP
      if (announcementsResult.status === "fulfilled") {
        const all = Array.isArray(announcementsResult.value) ? announcementsResult.value : [];
        const now = new Date();

        // Lọc active + trong thời hạn
        const live = all.filter((a) => {
          if (!a.active) return false;
          if (a.startDate && new Date(a.startDate) > now) return false;
          if (a.endDate   && new Date(a.endDate)   < now) return false;
          return true;
        });

        // Slider items
        setSliderItems(live.filter((a) => a.type === "SLIDER"));

        // Popup: lấy cái POPUP active mới nhất chưa bị đóng trong session
        const popups = live.filter((a) => a.type === "POPUP" || a.type === "NOTICE");
        if (popups.length > 0) {
          // Ưu tiên cái mới nhất (sort theo id desc)
          const latest = [...popups].sort((a, b) => b.id - a.id)[0];
          const seenKey = `edulingo_notice_${latest.id}`;
          if (!sessionStorage.getItem(seenKey)) {
            // Delay nhỏ để trang render xong trước
            setTimeout(() => {
              if (active) setPopupNotice(latest);
            }, 700);
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

      <main>
        {/* ── Hero ── */}
      <section className="hero">
        <p className="eyebrow">EC English Center</p>
        <h1>Nền tảng quản lý trung tâm tiếng Anh toàn diện.</h1>
        <p className="lead">
          Kết nối lớp học, học sinh, phụ huynh, học phí và báo cáo
          trên một hệ thống duy nhất.  
          <br/>
          Đơn giản - chính xác - hiệu quả.
        </p>
      </section>

      {/* ── Banner Slider ── */}
      <section className="section">
        <div className="section-header">
          <p className="eyebrow">Thông tin trung tâm</p>
          <h2>Tin tức & Thông báo</h2>
        </div>
        <BannerSlider items={sliderItems} />
      </section>
      </main>
    </>
  );
}