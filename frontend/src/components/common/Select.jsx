export default function Select({
  label,
  error,
  id,
  options = [],
  className = "",
  blankLabel = "-- Chọn --",
  showBlankOption = true,
  ...props
}) {
  const hasError = Boolean(error);

  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <select
        id={id}
        className={`form-input form-select ${hasError ? "form-input-error" : ""} ${className}`.trim()}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        {...props}
      >
        {showBlankOption && <option value="">{blankLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span id={`${id}-error`} className="form-error">{error}</span>}
    </div>
  );
}
