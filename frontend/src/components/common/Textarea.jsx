export default function Textarea({ 
  label, 
  error, 
  id,
  rows = 4,
  className = '',
  ...props 
}) {
  const hasError = !!error;
  
  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <textarea 
        id={id}
        rows={rows}
        className={`form-input form-textarea ${hasError ? 'form-input-error' : ''} ${className}`.trim()}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        {...props}
      />
      {error && <span id={`${id}-error`} className="form-error">{error}</span>}
    </div>
  );
}
