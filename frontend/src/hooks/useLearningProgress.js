import { useEffect, useState } from 'react';
import { useAuth } from '../auth/context.js';
import { progressService } from '../lib/supabase.js';

export function useLearningProgress() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ userId: null, attempt: -1, records: [], error: '' });
  useEffect(() => {
    if (!userId) return;
    let active = true;
    progressService.getAll().then(
      (records) => { if (active) setState({ userId, attempt, records, error: '' }); },
      (error) => { if (active) setState({ userId, attempt, records: [], error: error.message }); },
    );
    return () => { active = false; };
  }, [userId, attempt]);
  const ready = state.userId === userId && state.attempt === attempt;
  return {
    records: ready ? state.records : [], error: ready ? state.error : '', loading: !ready,
    reload: () => setAttempt((n) => n + 1),
  };
}
