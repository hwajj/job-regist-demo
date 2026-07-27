import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { placeSchema, type PlaceValues } from '../../schema';
import { useEditSessionStore } from '../../store/editSession';
import { mockApi } from '../../mock/api';
import { FieldError } from '../../components/FieldError';

/** care의 location?isEdit 동선: 장소만 수정 → 적용/이전 */
export function EditPlacePage() {
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
  } = useForm<PlaceValues>({
    resolver: zodResolver(placeSchema),
    defaultValues: { carePlace: '' },
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
        // 새로고침 → working 유실, 수정 메인으로 (미적용)
        ensureFromJob(job.id, job.data);
        navigate(`/jobs/${id}/edit`, { replace: true });
        return;
      }
      if (!s.working) {
        beginWorking();
        s = useEditSessionStore.getState().session;
      }
      if (s?.working) {
        reset({ carePlace: s.working.carePlace });
      }
    })();

    return () => {
      alive = false;
    };
  }, [id, navigate, ensureFromJob, beginWorking, reset]);

  useEffect(() => {
    const sub = watch((values) => {
      patchWorking({ carePlace: values.carePlace ?? '' });
    });
    return () => sub.unsubscribe();
  }, [watch, patchWorking]);

  const onApply = (values: PlaceValues) => {
    patchWorking(values);
    applyWorking(['carePlace']);
    navigate(`/jobs/${id}/edit`);
  };

  const onBack = () => {
    discardWorking();
    navigate(`/jobs/${id}/edit`);
  };

  if (!session || session.jobId !== id || !session.working) {
    return (
      <main>
        <p>세션 준비 중… (새로고침 시 미적용 → 수정 메인)</p>
      </main>
    );
  }

  return (
    <main>
      <h1>수정 — 간병장소 세부수정</h1>
      <p>
        <small>care location isEdit과 동일: 적용 전 committed/DB 미반영. 이전 = 버림.</small>
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
