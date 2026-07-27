import { create } from 'zustand';
import type { JobForm } from '../types';
import type { SectionField } from './editSession';
import { useRegisterDraftStore } from './registerDraft';

/**
 * 등록 미리보기(care의 detail/register)에서 섹션 세부수정용.
 * RegisterDraft는 「적용」할 때만 갱신. 이전/새로고침(메모리) 시 미반영.
 */
type RegisterSectionState = {
  working: JobForm | null;
  beginFromDraft: () => void;
  patchWorking: (partial: Partial<JobForm>) => void;
  applyToDraft: (fields: SectionField[]) => void;
  discard: () => void;
};

export const useRegisterSectionStore = create<RegisterSectionState>((set, get) => ({
  working: null,

  beginFromDraft: () => {
    const data = useRegisterDraftStore.getState().getData();
    set({ working: { ...data } });
  },

  patchWorking: (partial) => {
    const w = get().working;
    if (!w) return;
    set({ working: { ...w, ...partial } });
  },

  applyToDraft: (fields) => {
    const w = get().working;
    if (!w) return;
    const patch: Partial<JobForm> = {};
    for (const f of fields) {
      patch[f] = w[f];
    }
    useRegisterDraftStore.getState().patchDraft(patch);
    set({ working: null });
  },

  discard: () => set({ working: null }),
}));
