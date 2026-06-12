export default function Loading({
  message = "Đang tải...",
  className = ""
}) {
  return (
    <div className={`loading-container ${className}`.trim()}>
      <div className="spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
}
