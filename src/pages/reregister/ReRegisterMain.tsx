import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { mockApi } from '../../mock/api';
import { JobSummary } from '../../components/JobSummary';
import { useReRegisterSessionStore } from '../../store/reRegisterSession';
import { genderLabel } from '../../types';

/** care 재등록(detail/register?reFlag)처럼 섹션별 수정 후 create */
export function ReRegisterMainPage() {
  const { sourceJobId } = useParams<{ sourceJobId: string }>();
  const navigate = useNavigate();
  const session = useReRegisterSessionStore((s) => s.session);
  const ensureFromJob = useReRegisterSessionStore((s) => s.ensureFromJob);
  const beginWorking = useReRegisterSessionStore((s) => s.beginWorking);
  const clear = useReRegisterSessionStore((s) => s.clear);
  const [loading, setLoading] = useState(!session || session.sourceJobId !== sourceJobId);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sourceJobId) return;
    if (session && session.sourceJobId === sourceJobId) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const job = await mockApi.getJob(sourceJobId);
        if (!alive) return;
        if (!job) {
          setError('원본 공고를 찾을 수 없습니다.');
          return;
        }
        ensureFromJob(job.id, job.data);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : '로드 실패');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [sourceJobId, session, ensureFromJob]);

  const goPlace = () => {
    beginWorking();
    navigate(`/reregister/${sourceJobId}/place`);
  };

  const goPeriod = () => {
    beginWorking();
    navigate(`/reregister/${sourceJobId}/period`);
  };

  const handleComplete = async () => {
    const s = useReRegisterSessionStore.getState().session;
    if (!s) return;
    setSubmitting(true);
    try {
      const created = await mockApi.createJob(s.committed);
      clear();
      navigate(`/jobs/${created.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '재등록 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    clear();
    navigate('/jobs');
  };

  const committed = session?.committed;

  return (
    <main>
      <p>
        <Link to="/jobs">← 목록</Link>
      </p>
      <h1>공고 재등록 메인</h1>
      <p>
        <small>
          원본 id: {sourceJobId}. 「등록완료」= 새 공고 create. RegisterDraft와 분리.
        </small>
      </p>
      {loading && <p>불러오는 중…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {committed && (
        <>
          <JobSummary data={committed} title="재등록 committed" />

          <fieldset>
            <legend>기본정보</legend>
            <p>
              {committed.name} / {committed.age === '' ? '-' : committed.age} / {genderLabel(committed.gender)}
            </p>
          </fieldset>

          <fieldset>
            <legend>간병장소</legend>
            <p>{committed.carePlace || '-'}</p>
            <button type="button" onClick={goPlace}>
              수정
            </button>
          </fieldset>

          <fieldset>
            <legend>간병기간</legend>
            <p>{committed.carePeriod || '-'}</p>
            <button type="button" onClick={goPeriod}>
              수정
            </button>
          </fieldset>

          <p>
            <button type="button" onClick={handleCancel}>
              취소
            </button>{' '}
            <button type="button" onClick={handleComplete} disabled={submitting}>
              {submitting ? '등록 중…' : '등록완료 (새 공고)'}
            </button>
          </p>
        </>
      )}
    </main>
  );
}
