function PageHeader({ title, description, children }) {
  const hasActions = Boolean(children);

  return (
    <header className={`page__header${hasActions ? ' page__header--split' : ''}`}>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {hasActions ? <div className="page__actions">{children}</div> : null}
    </header>
  );
}

export default PageHeader;
