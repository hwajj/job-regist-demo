import type { JobForm, JobRecord } from '../types';

const DB_KEY = 'job-regist-demo:db';

const readDb = (): JobRecord[] => {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as JobRecord[];
  } catch {
    return [];
  }
};

const writeDb = (jobs: JobRecord[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(jobs));
};

export const db = {
  list: (): JobRecord[] => readDb(),
  get: (id: string): JobRecord | null => readDb().find((j) => j.id === id) ?? null,
  create: (data: JobForm): JobRecord => {
    const now = new Date().toISOString();
    const record: JobRecord = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      data,
      createdAt: now,
      updatedAt: now,
    };
    const jobs = readDb();
    jobs.unshift(record);
    writeDb(jobs);
    return record;
  },
  update: (id: string, data: JobForm): JobRecord => {
    const jobs = readDb();
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx < 0) throw new Error('공고를 찾을 수 없습니다');
    const updated: JobRecord = {
      ...jobs[idx],
      data,
      updatedAt: new Date().toISOString(),
    };
    jobs[idx] = updated;
    writeDb(jobs);
    return updated;
  },
};
