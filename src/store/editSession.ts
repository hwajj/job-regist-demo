import { create } from 'zustand';
import type { EditSession, JobForm } from '../types';

export type SectionField = 'carePlace' | 'carePeriod';

type EditSessionState = {
  session: EditSession | null;
  start: (jobId: string, data: JobForm) => void;
  ensureFromJob: (jobId: string, data: JobForm) => void;
  beginWorking: () => void;
  patchWorking: (partial: Partial<JobForm>) => void;
  /** care처럼 해당 섹션 필드만 committed에 반영 */
  applyWorking: (fields: SectionField[]) => void;
  discardWorking: () => void;
  clear: () => void;
};

export const useEditSessionStore = create<EditSessionState>((set, get) => ({
  session: null,

  start: (jobId, data) => {
    set({
      session: {
        jobId,
        committed: { ...data },
        working: null,
      },
    });
  },

  ensureFromJob: (jobId, data) => {
    const cur = get().session;
    if (cur && cur.jobId === jobId) return;
    set({
      session: {
        jobId,
        committed: { ...data },
        working: null,
      },
    });
  },

  beginWorking: () => {
    const s = get().session;
    if (!s) return;
    set({
      session: {
        ...s,
        working: { ...s.committed },
      },
    });
  },

  patchWorking: (partial) => {
    const s = get().session;
    if (!s?.working) return;
    set({
      session: {
        ...s,
        working: { ...s.working, ...partial },
      },
    });
  },

  applyWorking: (fields) => {
    const s = get().session;
    if (!s?.working) return;
    const next = { ...s.committed };
    for (const f of fields) {
      next[f] = s.working[f];
    }
    set({
      session: {
        ...s,
        committed: next,
        working: null,
      },
    });
  },

  discardWorking: () => {
    const s = get().session;
    if (!s) return;
    set({ session: { ...s, working: null } });
  },

  clear: () => set({ session: null }),
}));
