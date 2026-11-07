function Spinner({ label = 'Loading', size = 'md', className = '' }) {
  return (
    <div
      className={`ui-spinner ui-spinner--${size} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="ui-spinner__circle" aria-hidden="true" />
      <span className="ui-spinner__label">{label}</span>
    </div>
  );
}

export default Spinner;
