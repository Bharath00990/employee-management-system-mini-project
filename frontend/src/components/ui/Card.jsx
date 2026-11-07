function Card({ title, description, children, footer, className = '' }) {
  return (
    <section className={`ui-card ${className}`.trim()}>
      {(title || description) && (
        <header className="ui-card__header">
          {title ? <h3 className="ui-card__title">{title}</h3> : null}
          {description ? <p className="ui-card__description">{description}</p> : null}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
      {footer ? <footer className="ui-card__footer">{footer}</footer> : null}
    </section>
  );
}

export default Card;
