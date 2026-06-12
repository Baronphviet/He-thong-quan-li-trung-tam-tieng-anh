export default function Alert({
  type = "info",
  title,
  children,
  onClose = null,
  className = "",
  ...props
}) {
  return (
    <div className={`alert alert-${type} ${className}`.trim()} role="alert" {...props}>
      <div className="alert-content">
        {title && <strong className="alert-title">{title}</strong>}
        {children && <p className="alert-message">{children}</p>}
      </div>
      {onClose && (
        <button
          className="alert-close"
          type="button"
          onClick={onClose}
          aria-label="Close alert"
        >
          x
        </button>
      )}
    </div>
  );
}
