import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { mockApi } from '../mock/api';
import type { JobRecord } from '../types';
import { JobSummary } from '../components/JobSummary';
import { useWorkspaceStore } from '../store/workspace';

export function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const startEdit = useWorkspaceStore((s) => s.startEdit);
  const [job, setJob] = useState<JobRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const data = await mockApi.getJob(id);
        if (!alive) return;
        if (!data) {
          setError('공고를 찾을 수 없습니다.');
          setJob(null);
        } else {
          setJob(data);
        }
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : '로드 실패');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const handleEdit = () => {
    if (!job) return;
    startEdit(job.id, job.data);
    navigate(`/jobs/${job.id}/edit`);
  };

  return (
    <main>
      <p>
        <Link to="/jobs">← 목록</Link> | <Link to="/">Home</Link>
      </p>
      <h1>공고 상세 (서버 mock만 표시)</h1>
      {loading && <p>불러오는 중…</p>}
      {error && (
        <p>
          {error} <Link to="/">Home</Link>
        </p>
      )}
      {job && (
        <>
          <p>
            <small>
              id: {job.id} / updatedAt: {job.updatedAt}
            </small>
          </p>
          <JobSummary data={job.data} />
          <p>
            <button type="button" onClick={handleEdit}>
              수정
            </button>
          </p>
          <p>
            <small>재등록은 목록 아이템의 「공고 재등록」에서 시작합니다.</small>
          </p>
        </>
      )}
    </main>
  );
}
