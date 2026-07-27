import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { periodSchema, type PeriodValues } from '../../schema';
import { useReRegisterSessionStore } from '../../store/reRegisterSession';
import { mockApi } from '../../mock/api';
import { FieldError } from '../../components/FieldError';

export function ReRegisterPeriodPage() {
  const { sourceJobId } = useParams<{ sourceJobId: string }>();
  const navigate = useNavigate();
  const session = useReRegisterSessionStore((s) => s.session);
  const ensureFromJob = useReRegisterSessionStore((s) => s.ensureFromJob);
  const beginWorking = useReRegisterSessionStore((s) => s.beginWorking);
  const patchWorking = useReRegisterSessionStore((s) => s.patchWorking);
  const applyWorking = useReRegisterSessionStore((s) => s.applyWorking);
  const discardWorking = useReRegisterSessionStore((s) => s.discardWorking);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PeriodValues>({
    resolver: zodResolver(periodSchema),
    defaultValues: { carePeriod: '' },
  });

  useEffect(() => {
    if (!sourceJobId) return;
    let alive = true;

    (async () => {
      let s = useReRegisterSessionStore.getState().session;
      if (!s || s.sourceJobId !== sourceJobId) {
        const job = await mockApi.getJob(sourceJobId);
        if (!alive) return;
        if (!job) {
          navigate('/jobs', { replace: true });
          return;
        }
        ensureFromJob(job.id, job.data);
        navigate(`/reregister/${sourceJobId}`, { replace: true });
        return;
      }
      if (!s.working) {
        beginWorking();
        s = useReRegisterSessionStore.getState().session;
      }
      if (s?.working) {
        reset({ carePeriod: s.working.carePeriod });
      }
    })();

    return () => {
      alive = false;
    };
  }, [sourceJobId, navigate, ensureFromJob, beginWorking, reset]);

  useEffect(() => {
    const sub = watch((values) => {
      patchWorking({ carePeriod: values.carePeriod ?? '' });
    });
    return () => sub.unsubscribe();
  }, [watch, patchWorking]);

  const onApply = (values: PeriodValues) => {
    patchWorking(values);
    applyWorking(['carePeriod']);
    navigate(`/reregister/${sourceJobId}`);
  };

  const onBack = () => {
    discardWorking();
    navigate(`/reregister/${sourceJobId}`);
  };

  if (!session || session.sourceJobId !== sourceJobId || !session.working) {
    return (
      <main>
        <p>세션 준비 중…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>재등록 — 간병기간 세부수정</h1>
      <form onSubmit={handleSubmit(onApply)}>
        <fieldset>
          <legend>간병기간 (working)</legend>
          <p>
            <label>
              간병기간 <input type="text" {...register('carePeriod')} />
            </label>
            <FieldError message={errors.carePeriod?.message} />
          </p>
        </fieldset>
        <p>
          <button type="button" onClick={onBack}>
            이전
          </button>{' '}
          <button type="submit">적용</button>
        </p>
      </form>
    </main>
  );
}
