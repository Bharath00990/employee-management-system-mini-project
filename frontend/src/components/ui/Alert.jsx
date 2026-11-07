import { Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

function Alert({ children, variant = 'info', title, className = '', onDismiss }) {
  const IconComponent = ICONS[variant] ?? Info;

  return (
    <div className={`ui-alert ui-alert--${variant} ${className}`.trim()} role="alert">
      <div className="ui-alert__content">
        <IconComponent size={18} className="ui-alert__icon" />
        <div className="ui-alert__text">
          {title ? <strong className="ui-alert__title">{title}</strong> : null}
          <div>{children}</div>
        </div>
      </div>
      {onDismiss ? (
        <button type="button" className="ui-alert__dismiss" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      ) : null}
    </div>
  );
}

export default Alert;
