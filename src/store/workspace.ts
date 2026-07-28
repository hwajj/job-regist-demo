import { create } from 'zustand';
import type { JobForm } from '../types';
import { useRegisterDraftStore } from './registerDraft';

export type FormMode = 'register' | 'edit' | 'reregister';
export type SectionField = 'carePlace' | 'carePeriod';

/**
 * care처럼 수정/재등록은 같은 워크스페이스 형태.
 * 등록 미리보기 섹션 수정은 working만 쓰고, committed는 RegisterDraft.
 * RegisterDraft는 재등록·수정과 섞지 않음.
 */
type WorkspaceState = {
  mode: 'edit' | 'reregister' | null;
  /** edit=jobId, reregister=sourceJobId */
  refId: string | null;
  committed: JobForm | null;
  working: JobForm | null;

  startEdit: (jobId: string, data: JobForm) => void;
  startReregister: (sourceJobId: string, data: JobForm) => void;
  ensureLoaded: (mode: 'edit' | 'reregister', refId: string, data: JobForm) => void;

  /** 등록 미리보기 섹션 진입 시 Draft 복사 */
  beginRegisterWorking: () => void;
  beginWorkspaceWorking: () => void;

  patchWorking: (partial: Partial<JobForm>) => void;
  applyWorking: (mode: FormMode, fields: SectionField[]) => void;
  discardWorking: () => void;
  clear: () => void;

  getRegisterWorking: () => JobForm | null;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  mode: null,
  refId: null,
  committed: null,
  working: null,

  startEdit: (jobId, data) => {
    set({
      mode: 'edit',
      refId: jobId,
      committed: { ...data },
      working: null,
    });
  },

  startReregister: (sourceJobId, data) => {
    set({
      mode: 'reregister',
      refId: sourceJobId,
      committed: { ...data },
      working: null,
    });
  },

  ensureLoaded: (mode, refId, data) => {
    const cur = get();
    if (cur.mode === mode && cur.refId === refId && cur.committed) return;
    set({
      mode,
      refId,
      committed: { ...data },
      working: null,
    });
  },

  beginRegisterWorking: () => {
    const data = useRegisterDraftStore.getState().getData();
    set({ working: { ...data } });
  },

  beginWorkspaceWorking: () => {
    const { committed } = get();
    if (!committed) return;
    set({ working: { ...committed } });
  },

  patchWorking: (partial) => {
    const w = get().working;
    if (!w) return;
    set({ working: { ...w, ...partial } });
  },

  applyWorking: (mode, fields) => {
    const w = get().working;
    if (!w) return;

    if (mode === 'register') {
      const patch: Partial<JobForm> = {};
      for (const f of fields) patch[f] = w[f];
      useRegisterDraftStore.getState().patchDraft(patch);
      set({ working: null });
      return;
    }

    const committed = get().committed;
    if (!committed) return;
    const next = { ...committed };
    for (const f of fields) next[f] = w[f];
    set({ committed: next, working: null });
  },

  discardWorking: () => set({ working: null }),

  clear: () =>
    set({
      mode: null,
      refId: null,
      committed: null,
      working: null,
    }),

  getRegisterWorking: () => get().working,
}));
