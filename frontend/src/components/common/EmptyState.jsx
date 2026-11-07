import { Inbox } from 'lucide-react';

function EmptyState({ title = 'No data yet', description, icon: Icon, action }) {
  const DisplayIcon = Icon ?? Inbox;

  return (
    <div className="state-panel state-panel--empty">
      <div className="state-panel__icon" aria-hidden="true">
        <DisplayIcon size={24} />
      </div>
      <h3 className="state-panel__title">{title}</h3>
      {description ? <p className="state-panel__description">{description}</p> : null}
      {action ? <div className="state-panel__action">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
