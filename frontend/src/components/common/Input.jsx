export default function Input({ 
  label, 
  error, 
  id,
  className = '',
  ...props 
}) {
  const hasError = !!error;
  
  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <input 
        id={id}
        className={`form-input ${hasError ? 'form-input-error' : ''} ${className}`.trim()}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        {...props}
      />
      {error && <span id={`${id}-error`} className="form-error">{error}</span>}
    </div>
  );
}
