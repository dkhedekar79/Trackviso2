import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { runCrossDeviceStudySync } from '../utils/crossDeviceStudySync';
import logger from '../utils/logger';

/**
 * Runs Professor-only merge of study sessions, subjects, and tasks with Supabase.
 */
export default function CrossDeviceStudySync() {
  const { user } = useAuth();
  const { subscriptionPlan, loading } = useSubscription();
  useEffect(() => {
    if (!user?.id || loading || subscriptionPlan !== 'professor') {
      return;
    }

    const ac = new AbortController();
    (async () => {
      try {
        await runCrossDeviceStudySync({ signal: ac.signal });
      } catch (e) {
        if (e?.name !== 'AbortError') logger.error('CrossDeviceStudySync', e);
      }
    })();

    return () => ac.abort();
  }, [user?.id, subscriptionPlan, loading]);

  useEffect(() => {
    if (!user?.id || subscriptionPlan !== 'professor') return;

    const onVis = () => {
      if (document.visibilityState !== 'visible') return;
      runCrossDeviceStudySync().catch((e) => logger.error('CrossDeviceStudySync visibility', e));
    };

    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [user?.id, subscriptionPlan]);

  return null;
}
