function Select({
  id,
  label,
  error,
  required,
  className = '',
  wrapperClassName = '',
  children,
  ...props
}) {
  const selectId = id ?? props.name;

  return (
    <div className={`ui-input ${wrapperClassName}`.trim()}>
      {label ? (
        <label htmlFor={selectId}>
          {label}
          {required ? <span className="ui-input__required">*</span> : null}
        </label>
      ) : null}
      <select
        id={selectId}
        className={`ui-input__field ${className}`.trim()}
        required={required}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="ui-input__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default Select;
