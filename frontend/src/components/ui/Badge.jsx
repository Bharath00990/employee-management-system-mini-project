function Badge({ children, variant = 'default', dot = false, className = '' }) {
  return (
    <span className={`ui-badge ui-badge--${variant} ${className}`.trim()}>
      {dot ? <span className="ui-badge__dot" /> : null}
      {children}
    </span>
  );
}

export default Badge;
