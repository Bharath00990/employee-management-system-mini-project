function Input({
  id,
  label,
  error,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  const inputId = id ?? props.name;

  return (
    <div className={`ui-input ${wrapperClassName}`.trim()}>
      {label ? <label htmlFor={inputId}>{label}</label> : null}
      <input id={inputId} className={`ui-input__field ${className}`.trim()} {...props} />
      {error ? (
        <p className="ui-input__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default Input;
