import { useState } from 'react';
import { Coffee, Utensils, Cookie, Clock, Eye, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const BREAK_ICONS = {
  LUNCH: Utensils,
  BREAKFAST: Coffee,
  SNACKS: Cookie,
  TEA_COFFEE: Coffee,
  OTHER: Clock,
};

export function WorkModeBadge({ mode }) {
  const isWfh = mode === 'WORK_FROM_HOME';
  return (
    <span className={`work-mode-badge ${isWfh ? 'work-mode-badge--wfh' : 'work-mode-badge--office'}`}>
      <span className="work-mode-badge__dot" />
      {isWfh ? 'WFH' : 'Office'}
    </span>
  );
}

export function AttendanceBreaksCell({ breaks = [], employeeName, date }) {
  const [showModal, setShowModal] = useState(false);

  if (!breaks || breaks.length === 0) {
    return <span className="break-empty-dash">—</span>;
  }

  const totalMinutes = breaks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0);

  return (
    <div className="attendance-breaks-cell">
      <div className="breaks-inline-chips">
        {breaks.slice(0, 2).map((b) => {
          const Icon = BREAK_ICONS[b.breakType] || Clock;
          const label = b.breakTypeLabel || b.breakType;
          const timeRange = `${b.formattedStartTime || b.startTime} – ${b.formattedEndTime || b.endTime}`;
          return (
            <span key={b.id || b.startTime} className="break-tag" title={b.notes ? `${label}: ${timeRange} (${b.notes})` : `${label}: ${timeRange}`}>
              <Icon size={12} className="break-tag__icon" />
              <span className="break-tag__name">{label.replace(' Break', '')}:</span>
              <span className="break-tag__time">{timeRange}</span>
            </span>
          );
        })}
        {breaks.length > 2 && (
          <button
            type="button"
            className="breaks-more-btn"
            onClick={() => setShowModal(true)}
          >
            +{breaks.length - 2} more
          </button>
        )}
      </div>

      {breaks.length > 0 && (
        <button
          type="button"
          className="breaks-view-all-link"
          onClick={() => setShowModal(true)}
        >
          <Eye size={12} /> {totalMinutes}m total
        </button>
      )}

      {showModal && (
        <Modal
          title={`Break Timings ${employeeName ? `— ${employeeName}` : ''}`}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        >
          <div className="breaks-modal-content">
            <p className="breaks-modal-subtitle">
              Scheduled break intervals for {date ? new Date(date).toLocaleDateString() : 'today'}.
            </p>

            <div className="breaks-detail-list">
              {breaks.map((b) => {
                const Icon = BREAK_ICONS[b.breakType] || Clock;
                return (
                  <div key={b.id || b.startTime} className="break-detail-row">
                    <div className="break-detail-row__icon">
                      <Icon size={16} />
                    </div>
                    <div className="break-detail-row__main">
                      <div className="break-detail-row__title">
                        <strong>{b.breakTypeLabel || b.breakType}</strong>
                        {b.durationMinutes ? <span className="break-duration-pill">{b.durationMinutes} mins</span> : null}
                      </div>
                      <div className="break-detail-row__time">
                        {b.formattedStartTime || b.startTime} – {b.formattedEndTime || b.endTime}
                      </div>
                      {b.notes ? <div className="break-detail-row__notes">"{b.notes}"</div> : null}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="breaks-modal-footer">
              <span className="breaks-modal-total">
                Total Breaks: <strong>{breaks.length}</strong> ({totalMinutes} minutes)
              </span>
              <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
