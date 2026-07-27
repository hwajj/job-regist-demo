import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { mockApi } from '../../mock/api';
import { JobSummary } from '../../components/JobSummary';
import { useEditSessionStore } from '../../store/editSession';
import { genderLabel } from '../../types';

/** care 상세(edit)처럼 섹션별 「수정」→ 세부 페이지 → 이전/적용 */
export function EditMainPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = useEditSessionStore((s) => s.session);
  const ensureFromJob = useEditSessionStore((s) => s.ensureFromJob);
  const beginWorking = useEditSessionStore((s) => s.beginWorking);
  const clear = useEditSessionStore((s) => s.clear);
  const [loading, setLoading] = useState(!session || session.jobId !== id);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (session && session.jobId === id) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      try {
        const job = await mockApi.getJob(id);
        if (!alive) return;
        if (!job) {
          setError('공고를 찾을 수 없습니다.');
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
  }, [id, session, ensureFromJob]);

  const goPlace = () => {
    beginWorking();
    navigate(`/jobs/${id}/edit/place`);
  };

  const goPeriod = () => {
    beginWorking();
    navigate(`/jobs/${id}/edit/period`);
  };

  const handleComplete = async () => {
    const s = useEditSessionStore.getState().session;
    if (!s || !id) return;
    setSubmitting(true);
    try {
      await mockApi.updateJob(id, s.committed);
      clear();
      navigate(`/jobs/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '수정 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    clear();
    navigate(`/jobs/${id}`);
  };

  const committed = session?.committed;

  return (
    <main>
      <p>
        <Link to={`/jobs/${id}`}>← 상세</Link>
      </p>
      <h1>수정 메인 (care 상세 edit 동선)</h1>
      <p>
        <small>섹션마다 세부수정 → 이전/적용. 「수정완료」때만 API update.</small>
      </p>
      {loading && <p>불러오는 중…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {committed && (
        <>
          <JobSummary data={committed} title="committed (적용된 내용)" />

          <fieldset>
            <legend>기본정보 (Step1)</legend>
            <p>
              {committed.name} / {committed.age === '' ? '-' : committed.age} / {genderLabel(committed.gender)}
            </p>
            <p>
              <small>데모: Step1 세부수정 없음</small>
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
              {submitting ? '저장 중…' : '수정완료'}
            </button>
          </p>
        </>
      )}
    </main>
  );
}
