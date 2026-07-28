import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockApi } from '../mock/api';
import type { JobRecord } from '../types';
import { genderLabel } from '../types';
import { useWorkspaceStore } from '../store/workspace';

export function JobListPage() {
  const navigate = useNavigate();
  const startReregister = useWorkspaceStore((s) => s.startReregister);
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await mockApi.listJobs();
        if (alive) setJobs(list);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : '목록 로드 실패');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleReRegister = async (e: React.MouseEvent, job: JobRecord) => {
    e.stopPropagation();
    e.preventDefault();
    // RegisterDraft는 건드리지 않음 — 재등록 세션만 시작
    startReregister(job.id, job.data);
    navigate(`/reregister/${job.id}`);
  };

  return (
    <main>
      <p>
        <Link to="/">← Home</Link>
      </p>
      <h1>공고 목록</h1>
      {loading && <p>불러오는 중…</p>}
      {error && <p>{error}</p>}
      {!loading && jobs.length === 0 && <p>등록된 공고가 없습니다. Home에서 공고를 등록하세요.</p>}
      <ul>
        {jobs.map((job) => (
          <li key={job.id} style={{ marginBottom: 16, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
            <div
              role="link"
              tabIndex={0}
              onClick={() => navigate(`/jobs/${job.id}`)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') navigate(`/jobs/${job.id}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              <strong>{job.data.name || '(이름 없음)'}</strong>
              <br />
              <small>
                id: {job.id} / {genderLabel(job.data.gender)} / {job.data.carePlace || '-'} /{' '}
                {job.data.carePeriod || '-'}
              </small>
            </div>
            <p>
              <button type="button" onClick={() => navigate(`/jobs/${job.id}`)}>
                상세
              </button>{' '}
              <button type="button" onClick={(e) => handleReRegister(e, job)}>
                공고 재등록
              </button>
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
