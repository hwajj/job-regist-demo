import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { placeSchema, type PlaceValues } from '../../schema';
import { useFormRouteContext } from '../../hooks/useFormRouteContext';
import { useWorkspaceStore } from '../../store/workspace';
import { mockApi } from '../../mock/api';
import { FieldError } from '../../components/FieldError';

/** 등록/수정/재등록 공용 — 간병장소 세부수정 */
export function PlaceEditPage() {
  const ctx = useFormRouteContext();
  const navigate = useNavigate();
  const working = useWorkspaceStore((s) => s.working);
  const mode = useWorkspaceStore((s) => s.mode);
  const refId = useWorkspaceStore((s) => s.refId);
  const ensureLoaded = useWorkspaceStore((s) => s.ensureLoaded);
  const beginWorkspaceWorking = useWorkspaceStore((s) => s.beginWorkspaceWorking);
  const patchWorking = useWorkspaceStore((s) => s.patchWorking);
  const applyWorking = useWorkspaceStore((s) => s.applyWorking);
  const discardWorking = useWorkspaceStore((s) => s.discardWorking);

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
    if (!ctx) return;
    let alive = true;

    (async () => {
      if (ctx.mode === 'register') {
        const w = useWorkspaceStore.getState().working;
        if (!w) {
          navigate(ctx.mainPath, { replace: true });
          return;
        }
        reset({ carePlace: w.carePlace });
        return;
      }

      // edit / reregister
      let s = useWorkspaceStore.getState();
      if (s.mode !== ctx.mode || s.refId !== ctx.refId || !s.committed) {
        if (!ctx.refId) {
          navigate(ctx.mainPath, { replace: true });
          return;
        }
        const job = await mockApi.getJob(ctx.refId);
        if (!alive) return;
        if (!job) {
          navigate(ctx.mainPath, { replace: true });
          return;
        }
        // 새로고침 → working 유실, 메인으로
        ensureLoaded(ctx.mode, ctx.refId, job.data);
        navigate(ctx.mainPath, { replace: true });
        return;
      }

      if (!s.working) {
        beginWorkspaceWorking();
        s = useWorkspaceStore.getState();
      }
      if (s.working) reset({ carePlace: s.working.carePlace });
    })();

    return () => {
      alive = false;
    };
  }, [ctx, navigate, reset, ensureLoaded, beginWorkspaceWorking]);

  useEffect(() => {
    const sub = watch((values) => {
      patchWorking({ carePlace: values.carePlace ?? '' });
    });
    return () => sub.unsubscribe();
  }, [watch, patchWorking]);

  if (!ctx) return <Navigate to="/" replace />;

  const onApply = (values: PlaceValues) => {
    patchWorking(values);
    applyWorking(ctx.mode, ['carePlace']);
    navigate(ctx.mainPath);
  };

  const onBack = () => {
    discardWorking();
    navigate(ctx.mainPath);
  };

  const ready =
    ctx.mode === 'register'
      ? !!working
      : mode === ctx.mode && refId === ctx.refId && !!working;

  if (!ready) {
    return (
      <main>
        <p>세션 준비 중… (새로고침 시 미적용 → 메인)</p>
      </main>
    );
  }

  return (
    <main>
      <h1>간병장소 세부수정</h1>
      <p>
        <small>
          UI 공용 · mode=<strong>{ctx.mode}</strong> · 이전=미적용 / 적용=해당 섹션만 commit
        </small>
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
