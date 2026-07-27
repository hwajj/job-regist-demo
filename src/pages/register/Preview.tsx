import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobFormSchema } from '../../schema';
import { useRegisterDraftStore } from '../../store/registerDraft';
import { useRegisterSectionStore } from '../../store/registerSection';
import { JobSummary } from '../../components/JobSummary';
import { mockApi } from '../../mock/api';
import { genderLabel } from '../../types';

/**
 * care의 /care/detail/register 미리보기 동선.
 * 섹션 「수정」→ 세부 페이지 → 이전/적용 후 여기로 복귀 → 최종 등록완료.
 */
export function RegisterPreviewPage() {
  const navigate = useNavigate();
  const draft = useRegisterDraftStore((s) => s.draft);
  const getData = useRegisterDraftStore((s) => s.getData);
  const clearDraft = useRegisterDraftStore((s) => s.clearDraft);
  const beginFromDraft = useRegisterSectionStore((s) => s.beginFromDraft);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const data = getData();

  useEffect(() => {
    const parsed = jobFormSchema.safeParse(getData());
    if (!parsed.success && !draft) {
      navigate('/register/step1', { replace: true });
    }
  }, [draft, getData, navigate]);

  const goPlace = () => {
    beginFromDraft();
    navigate('/register/preview/place');
  };

  const goPeriod = () => {
    beginFromDraft();
    navigate('/register/preview/period');
  };

  const handleSubmit = async () => {
    const parsed = jobFormSchema.safeParse(getData());
    if (!parsed.success) {
      setError('입력값이 부족합니다. Step1/Step2를 확인해 주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const record = await mockApi.createJob(parsed.data);
      clearDraft();
      navigate(`/jobs/${record.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '등록 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <p>
        <Link to="/register/step2">← Step2</Link> | <Link to="/">Home</Link>
      </p>
      <h1>등록 미리보기 (care detail/register)</h1>
      <p>
        <small>섹션별 수정 → 이전/적용. 「등록완료」때만 mock API.create</small>
      </p>

      <JobSummary data={data} title="Draft (적용분)" />

      <fieldset>
        <legend>기본정보</legend>
        <p>
          {data.name || '-'} / {data.age === '' ? '-' : data.age} / {genderLabel(data.gender)}
        </p>
        <button type="button" onClick={() => navigate('/register/step1')}>
          Step1로 수정
        </button>
      </fieldset>

      <fieldset>
        <legend>간병장소</legend>
        <p>{data.carePlace || '-'}</p>
        <button type="button" onClick={goPlace}>
          수정
        </button>
      </fieldset>

      <fieldset>
        <legend>간병기간</legend>
        <p>{data.carePeriod || '-'}</p>
        <button type="button" onClick={goPeriod}>
          수정
        </button>
      </fieldset>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <p>
        <button type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? '등록 중…' : '등록완료'}
        </button>
      </p>
    </main>
  );
}
