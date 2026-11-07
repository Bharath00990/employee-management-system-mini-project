import Spinner from '../ui/Spinner';

function LoadingState({ title = 'Loading', description }) {
  return (
    <div className="state-panel state-panel--loading">
      <Spinner label={title} />
      {description ? <p className="state-panel__description">{description}</p> : null}
    </div>
  );
}

export default LoadingState;
