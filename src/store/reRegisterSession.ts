import { create } from 'zustand';
import type { JobForm, ReRegisterSession } from '../types';
import type { SectionField } from './workspace';

type ReRegisterSessionState = {
  session: ReRegisterSession | null;
  start: (sourceJobId: string, data: JobForm) => void;
  ensureFromJob: (sourceJobId: string, data: JobForm) => void;
  beginWorking: () => void;
  patchWorking: (partial: Partial<JobForm>) => void;
  applyWorking: (fields: SectionField[]) => void;
  discardWorking: () => void;
  clear: () => void;
};

/** RegisterDraft와 완전 분리 */
export const useReRegisterSessionStore = create<ReRegisterSessionState>((set, get) => ({
  session: null,

  start: (sourceJobId, data) => {
    set({
      session: {
        sourceJobId,
        committed: { ...data },
        working: null,
      },
    });
  },

  ensureFromJob: (sourceJobId, data) => {
    const cur = get().session;
    if (cur && cur.sourceJobId === sourceJobId) return;
    set({
      session: {
        sourceJobId,
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
