import type { JobForm, JobRecord } from '../types';
import { db } from './db';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

export const mockApi = {
  async listJobs(): Promise<JobRecord[]> {
    await delay();
    return db.list();
  },

  async getJob(id: string): Promise<JobRecord | null> {
    await delay();
    return db.get(id);
  },

  async createJob(data: JobForm): Promise<JobRecord> {
    await delay(400);
    return db.create(data);
  },

  async updateJob(id: string, data: JobForm): Promise<JobRecord> {
    await delay(400);
    return db.update(id, data);
  },
};
