import { useEffect, useState } from "react";

export default function BannerSlider({ items = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return undefined;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items.length) {
    return <p className="muted">Chưa có banner quảng cáo.</p>;
  }

  const current = items[index];

  return (
    <div className="banner-slider">
      <div className="banner-slider-frame">
        <img src={current.imageUrl} alt={current.title} className="banner-slider-image" />
        <div className="banner-slider-caption">
          <strong>{current.title}</strong>
          {current.content && <p>{current.content}</p>}
        </div>
      </div>
      {items.length > 1 && (
        <div className="banner-slider-dots">
          {items.map((item, dotIndex) => (
            <button
              key={item.id}
              type="button"
              className={`banner-dot ${dotIndex === index ? "active" : ""}`}
              onClick={() => setIndex(dotIndex)}
              aria-label={`Xem banner ${dotIndex + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
