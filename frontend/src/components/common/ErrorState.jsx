import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';

function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again.',
  onRetry,
  retryLabel = 'Try again',
}) {
  return (
    <div className="state-panel state-panel--error">
      <div className="state-panel__icon" aria-hidden="true">
        <AlertTriangle size={24} />
      </div>
      <h3 className="state-panel__title">{title}</h3>
      <p className="state-panel__description">{description}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default ErrorState;
