import { Loader2 } from 'lucide-react';

function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = '',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) {
  const sizeClass = size ? ` ui-button--${size}` : '';

  return (
    <button
      type={type}
      className={`ui-button ui-button--${variant}${sizeClass} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="ui-button__icon" style={{ animation: 'ui-spin 0.7s linear infinite' }} />
      ) : Icon ? (
        <Icon size={16} className="ui-button__icon" />
      ) : null}
      {children}
    </button>
  );
}

export default Button;
