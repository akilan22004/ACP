import React, { useId } from 'react';
import { LockKeyhole } from 'lucide-react';

export default function LockedAction({ children, requirement, className = '' }) {
  const requirementId = useId();

  return (
    <button
      type="button"
      disabled
      aria-describedby={requirementId}
      className={`assessment-locked-action ${className}`.trim()}
    >
      <span className="locked-action-badge" aria-hidden="true"><LockKeyhole size={12} /></span>
      <span>{children}</span>
      <span className="sr-only" id={requirementId}>{requirement}</span>
    </button>
  );
}
