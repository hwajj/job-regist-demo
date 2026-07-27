export type Gender = 'male' | 'female' | 'other';

export type JobForm = {
  name: string;
  age: number | '';
  gender: Gender | '';
  carePlace: string;
  carePeriod: string;
};

export type RegisterDraft = {
  data: JobForm;
  updatedAt: string;
  version: 1;
};

export type EditSession = {
  jobId: string;
  committed: JobForm;
  working: JobForm | null;
};

export type ReRegisterSession = {
  sourceJobId: string;
  committed: JobForm;
  working: JobForm | null;
};

export type JobRecord = {
  id: string;
  data: JobForm;
  createdAt: string;
  updatedAt: string;
};

export const emptyJobForm = (): JobForm => ({
  name: '',
  age: '',
  gender: '',
  carePlace: '',
  carePeriod: '',
});

export const genderLabel = (g: Gender | ''): string => {
  if (g === 'male') return '남';
  if (g === 'female') return '여';
  if (g === 'other') return '기타';
  return '-';
};
