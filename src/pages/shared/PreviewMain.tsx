import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { jobFormSchema } from '../../schema';
import { mockApi } from '../../mock/api';
import { useFormRouteContext } from '../../hooks/useFormRouteContext';
import { useRegisterDraftStore } from '../../store/registerDraft';
import { useWorkspaceStore } from '../../store/workspace';
import { JobSummary } from '../../components/JobSummary';
import { genderLabel, type JobForm } from '../../types';

/**
 * care의 detail/register·edit 재사용.
 * 등록 미리보기 / 수정 / 재등록이 이 화면 하나를 공유한다.
 */
export function PreviewMainPage() {
  const ctx = useFormRouteContext();
  const navigate = useNavigate();
  const getDraftData = useRegisterDraftStore((s) => s.getData);
  const draft = useRegisterDraftStore((s) => s.draft);
  const clearDraft = useRegisterDraftStore((s) => s.clearDraft);
  const committedWs = useWorkspaceStore((s) => s.committed);
  const wsMode = useWorkspaceStore((s) => s.mode);
  const wsRefId = useWorkspaceStore((s) => s.refId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // subscribe to draft updates for register mode UI
  const draftSnapshot = useRegisterDraftStore((s) => s.draft?.data);

  useEffect(() => {
    if (!ctx || ctx.mode === 'register' || !ctx.refId) return;
    if (wsMode === ctx.mode && wsRefId === ctx.refId && committedWs) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const job = await mockApi.getJob(ctx.refId!);
        if (!alive) return;
        if (!job) {
          setError('공고를 찾을 수 없습니다.');
          return;
        }
        useWorkspaceStore.getState().ensureLoaded(ctx.mode as 'edit' | 'reregister', ctx.refId!, job.data);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : '로드 실패');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ctx, wsMode, wsRefId, committedWs]);

  if (!ctx) return <Navigate to="/" replace />;

  if (ctx.mode === 'register') {
    const data = getDraftData();
    const empty = !data.name && data.age === '' && !data.gender && !data.carePlace && !data.carePeriod;
    if (!draft && empty) return <Navigate to="/register/step1" replace />;
  }

  const committed: JobForm | null =
    ctx.mode === 'register' ? (draftSnapshot ?? getDraftData()) : committedWs;

  const title =
    ctx.mode === 'register' ? '등록 미리보기' : ctx.mode === 'edit' ? '수정' : '공고 재등록';

  const goPlace = () => {
    const ws = useWorkspaceStore.getState();
    if (ctx.mode === 'register') ws.beginRegisterWorking();
    else ws.beginWorkspaceWorking();
    navigate(ctx.placePath);
  };

  const goPeriod = () => {
    const ws = useWorkspaceStore.getState();
    if (ctx.mode === 'register') ws.beginRegisterWorking();
    else ws.beginWorkspaceWorking();
    navigate(ctx.periodPath);
  };

  const handleCancel = () => {
    if (ctx.mode === 'register') {
      navigate('/register/step2');
      return;
    }
    useWorkspaceStore.getState().clear();
    navigate(ctx.mode === 'edit' ? `/jobs/${ctx.refId}` : '/jobs');
  };

  const handleSubmit = async () => {
    if (!committed) return;
    const parsed = jobFormSchema.safeParse(committed);
    if (!parsed.success) {
      setError('입력값이 부족합니다.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      if (ctx.mode === 'register') {
        const record = await mockApi.createJob(parsed.data);
        clearDraft();
        useWorkspaceStore.getState().clear();
        navigate(`/jobs/${record.id}`);
        return;
      }
      if (ctx.mode === 'edit' && ctx.refId) {
        await mockApi.updateJob(ctx.refId, parsed.data);
        useWorkspaceStore.getState().clear();
        navigate(`/jobs/${ctx.refId}`);
        return;
      }
      if (ctx.mode === 'reregister') {
        const created = await mockApi.createJob(parsed.data);
        useWorkspaceStore.getState().clear();
        navigate(`/jobs/${created.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel =
    ctx.mode === 'edit' ? '수정완료' : ctx.mode === 'reregister' ? '등록완료 (새 공고)' : '등록완료';

  return (
    <main>
      <p>
        <Link to={ctx.backLink.to}>{ctx.backLink.label}</Link>
        {ctx.mode === 'register' && (
          <>
            {' '}
            | <Link to="/">Home</Link>
          </>
        )}
      </p>
      <h1>{title}</h1>
      <p>
        <small>
          UI 공용 · mode=<strong>{ctx.mode}</strong>
          {ctx.mode === 'reregister' && ' · RegisterDraft와 분리 · 최종 create'}
          {ctx.mode === 'edit' && ' · 최종 update'}
          {ctx.mode === 'register' && ' · 최종 create 후 Draft 삭제'}
        </small>
      </p>

      {loading && <p>불러오는 중…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {committed && !loading && (
        <>
          <JobSummary data={committed} title="committed / Draft" />

          <fieldset>
            <legend>기본정보</legend>
            <p>
              {committed.name || '-'} / {committed.age === '' ? '-' : committed.age} /{' '}
              {genderLabel(committed.gender)}
            </p>
            {ctx.mode === 'register' ? (
              <button type="button" onClick={() => navigate('/register/step1')}>
                Step1로 수정
              </button>
            ) : (
              <p>
                <small>데모: Step1 세부수정 없음</small>
              </p>
            )}
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
              {ctx.mode === 'register' ? 'Step2로' : '취소'}
            </button>{' '}
            <button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '처리 중…' : submitLabel}
            </button>
          </p>
        </>
      )}
    </main>
  );
}
