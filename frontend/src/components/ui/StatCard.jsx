function StatCard({ icon: Icon, label, value, variant = 'primary' }) {
  return (
    <div className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${variant}`}>
        {Icon ? <Icon size={22} /> : null}
      </div>
      <div className="stat-card__content">
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value ?? '—'}</div>
      </div>
    </div>
  );
}

export default StatCard;
