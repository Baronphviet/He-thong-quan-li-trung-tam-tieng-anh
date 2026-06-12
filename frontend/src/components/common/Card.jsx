export default function Card({ 
  title, 
  children, 
  className = '',
  footer = null,
  ...props 
}) {
  return (
    <div className={`card ${className}`.trim()} {...props}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-body">
        {children}
      </div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}
