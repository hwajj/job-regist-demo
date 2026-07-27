import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { placeSchema, type PlaceValues } from '../../schema';
import { useReRegisterSessionStore } from '../../store/reRegisterSession';
import { mockApi } from '../../mock/api';
import { FieldError } from '../../components/FieldError';

export function ReRegisterPlacePage() {
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
  } = useForm<PlaceValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: { carePlace: '' },
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
        reset({ carePlace: s.working.carePlace });
      }
    })();

    return () => {
      alive = false;
    };
  }, [sourceJobId, navigate, ensureFromJob, beginWorking, reset]);

  useEffect(() => {
    const sub = watch((values) => {
      patchWorking({ carePlace: values.carePlace ?? '' });
    });
    return () => sub.unsubscribe();
  }, [watch, patchWorking]);

  const onApply = (values: PlaceValues) => {
    patchWorking(values);
    applyWorking(['carePlace']);
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
      <h1>재등록 — 간병장소 세부수정</h1>
      <p>
        <small>RegisterDraft와 무관. 적용 시에만 재등록 committed 반영.</small>
      </p>
      <form onSubmit={handleSubmit(onApply)}>
        <fieldset>
          <legend>간병장소 (working)</legend>
          <p>
            <label>
              간병장소 <input type="text" {...register('carePlace')} />
            </label>
            <FieldError message={errors.carePlace?.message} />
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
