import { useCallback, useEffect, useRef, useState } from "react";

/**
 * BannerSlider
 * Props: items: Array<{ id, title, content, imageUrl }>
 *        autoplayMs?: number (default 5000)
 */
export default function BannerSlider({ items = [], autoplayMs = 5000 }) {
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState("idle");
  const timerRef = useRef(null);
  const total = items.length;

  const goTo = useCallback((next, dir = "next") => {
    if (next === current) return;
    setAnimDir(dir);
    setCurrent(next);
    setTimeout(() => setAnimDir("idle"), 380);
  }, [current]);

  const next = useCallback(
    () => goTo((current + 1) % total, "next"),
    [current, total, goTo]
  );

  const prev = useCallback(
    () => goTo((current - 1 + total) % total, "prev"),
    [current, total, goTo]
  );

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, autoplayMs);
  }, [next, autoplayMs]);

  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setInterval(next, autoplayMs);
    return () => clearInterval(timerRef.current);
  }, [next, autoplayMs, total]);

  if (!total) {
    return (
      <div className="banner-slider-empty">
        <p className="muted">Chưa có banner quảng cáo.</p>
      </div>
    );
  }

  const item = items[current];

  return (
    <div className="banner-slider">
      {/* Frame */}
      <div className="banner-slider-frame">

        {/* Progress bar */}
        {total > 1 && (
          <div className="bsl-progress-track">
            <div key={`${current}`} className="bsl-progress-bar" />
          </div>
        )}

        {/* Image hoặc placeholder */}
        {item.imageUrl ? (
          <img
            key={current}
            src={item.imageUrl}
            alt={item.title}
            className={`banner-slider-image bsl-slide-${animDir}`}
          />
        ) : (
          <div className="bsl-placeholder">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <rect width="64" height="64" rx="14" fill="rgba(31,111,80,0.10)" />
              <path d="M12 48l16-22 12 14 8-9 16 17H12z" fill="rgba(31,111,80,0.28)" />
              <circle cx="44" cy="20" r="7" fill="rgba(31,111,80,0.35)" />
            </svg>
          </div>
        )}

        {/* Caption */}
        <div className={`banner-slider-caption bsl-slide-${animDir}`}>
          <strong className="bsl-caption-title">{item.title}</strong>
          {item.content && <p className="bsl-caption-body">{item.content}</p>}
        </div>

        {/* Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              className="bsl-arrow bsl-arrow-left"
              onClick={() => { prev(); resetTimer(); }}
              aria-label="Banner trước"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L6 8l4 5" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="bsl-arrow bsl-arrow-right"
              onClick={() => { next(); resetTimer(); }}
              aria-label="Banner tiếp"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l4 5-4 5" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Bottom bar: counter + dots */}
      {total > 1 && (
        <div className="bsl-bar">
          <span className="bsl-counter muted">
            {String(current + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>

          <div className="banner-slider-dots">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`banner-dot${i === current ? " active" : ""}`}
                onClick={() => { goTo(i, i > current ? "next" : "prev"); resetTimer(); }}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>

          {/* spacer để dots căn giữa */}
          <span className="bsl-bar-spacer" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}