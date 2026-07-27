import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { emptyJobForm, type JobForm, type RegisterDraft } from '../types';

type RegisterDraftState = {
  draft: RegisterDraft | null;
  hasDraft: () => boolean;
  patchDraft: (partial: Partial<JobForm>) => void;
  setDraftData: (data: JobForm) => void;
  clearDraft: () => void;
  getData: () => JobForm;
};

export const useRegisterDraftStore = create<RegisterDraftState>()(
  persist(
    (set, get) => ({
      draft: null,

      hasDraft: () => {
        const d = get().draft;
        if (!d) return false;
        const { name, age, gender, carePlace, carePeriod } = d.data;
        return !!(name || age !== '' || gender || carePlace || carePeriod);
      },

      patchDraft: (partial) => {
        const prev = get().draft?.data ?? emptyJobForm();
        set({
          draft: {
            data: { ...prev, ...partial },
            updatedAt: new Date().toISOString(),
            version: 1,
          },
        });
      },

      setDraftData: (data) => {
        set({
          draft: {
            data,
            updatedAt: new Date().toISOString(),
            version: 1,
          },
        });
      },

      clearDraft: () => set({ draft: null }),

      getData: () => get().draft?.data ?? emptyJobForm(),
    }),
    {
      name: 'job-regist-demo:register-draft',
    },
  ),
);
