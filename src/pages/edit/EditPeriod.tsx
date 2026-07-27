import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { periodSchema, type PeriodValues } from '../../schema';
import { useEditSessionStore } from '../../store/editSession';
import { mockApi } from '../../mock/api';
import { FieldError } from '../../components/FieldError';

export function EditPeriodPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = useEditSessionStore((s) => s.session);
  const ensureFromJob = useEditSessionStore((s) => s.ensureFromJob);
  const beginWorking = useEditSessionStore((s) => s.beginWorking);
  const patchWorking = useEditSessionStore((s) => s.patchWorking);
  const applyWorking = useEditSessionStore((s) => s.applyWorking);
  const discardWorking = useEditSessionStore((s) => s.discardWorking);

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
    if (!id) return;
    let alive = true;

    (async () => {
      let s = useEditSessionStore.getState().session;
      if (!s || s.jobId !== id) {
        const job = await mockApi.getJob(id);
        if (!alive) return;
        if (!job) {
          navigate(`/jobs/${id}/edit`, { replace: true });
          return;
        }
        ensureFromJob(job.id, job.data);
        navigate(`/jobs/${id}/edit`, { replace: true });
        return;
      }
      if (!s.working) {
        beginWorking();
        s = useEditSessionStore.getState().session;
      }
      if (s?.working) {
        reset({ carePeriod: s.working.carePeriod });
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, navigate, ensureFromJob, beginWorking, reset]);

  useEffect(() => {
    const sub = watch((values) => {
      patchWorking({ carePeriod: values.carePeriod ?? '' });
    });
    return () => sub.unsubscribe();
  }, [watch, patchWorking]);

  const onApply = (values: PeriodValues) => {
    patchWorking(values);
    applyWorking(['carePeriod']);
    navigate(`/jobs/${id}/edit`);
  };

  const onBack = () => {
    discardWorking();
    navigate(`/jobs/${id}/edit`);
  };

  if (!session || session.jobId !== id || !session.working) {
    return (
      <main>
        <p>세션 준비 중…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>수정 — 간병기간 세부수정</h1>
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
