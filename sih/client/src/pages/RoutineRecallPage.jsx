import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RoutineRecall from '../games/routine-recall/RoutineRecall';

export default function RoutineRecallPage() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 20px' }}>
      {/* Back to games navigation */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => navigate('/')}
          className="btn-secondary"
          style={{ minHeight: '48px', padding: '8px 16px', fontSize: '0.95rem' }}
        >
          <ArrowLeft size={18} />
          <span>Back to Cognitive Games</span>
        </button>
      </div>

      {/* Render the scoped Daily Routine Recall Game */}
      <RoutineRecall />
    </div>
  );
}
