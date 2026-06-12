import { useEffect, useState } from "react";
import { announcementService, dashboardService } from "../services";
import { formatMoney } from "../utils/format";
import { getApiErrorMessage } from "../utils/apiError";
import { Alert, BannerSlider, Loading } from "../components/common";

export default function HomePage() {
  const [summary, setSummary] = useState(null);
  const [sliderItems, setSliderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHomeData() {
      setLoading(true);
      setError("");

      const [summaryResult, sliderResult] = await Promise.allSettled([
        dashboardService.getSummary(),
        announcementService.getSlider()
      ]);

      if (!active) return;

      if (summaryResult.status === "fulfilled") {
        setSummary(summaryResult.value);
      } else {
        setError(getApiErrorMessage(summaryResult.reason, "Không tải được tổng quan hệ thống."));
      }

      if (sliderResult.status === "fulfilled") {
        setSliderItems(Array.isArray(sliderResult.value) ? sliderResult.value : []);
      }

      setLoading(false);
    }

    loadHomeData();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loading />;

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Trung tâm Tiếng Anh</p>
        <h1>Quản lý trung tâm tiếng Anh bằng một luồng dữ liệu thống nhất.</h1>
        <p className="lead">
          Hệ thống kết nối lớp học, học sinh, phụ huynh, học phí, thanh toán và báo cáo trên cùng một nền tảng.
        </p>
      </section>

      {error && <Alert type="warning" title="Backend chưa sẵn sàng">{error}</Alert>}

      <section className="section">
        <p className="eyebrow">Quảng cáo & thông báo</p>
        <h2>Banner trượt</h2>
        <BannerSlider items={sliderItems} />
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
