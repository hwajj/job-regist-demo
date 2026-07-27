import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { placeSchema, type PlaceValues } from '../../schema';
import { useRegisterSectionStore } from '../../store/registerSection';
import { FieldError } from '../../components/FieldError';

export function RegisterPlaceEditPage() {
  const navigate = useNavigate();
  const working = useRegisterSectionStore((s) => s.working);
  const patchWorking = useRegisterSectionStore((s) => s.patchWorking);
  const applyToDraft = useRegisterSectionStore((s) => s.applyToDraft);
  const discard = useRegisterSectionStore((s) => s.discard);

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
    let w = useRegisterSectionStore.getState().working;
    if (!w) {
      // 새로고침 → working 없음 → 미리보기로 (Draft 미변경)
      navigate('/register/preview', { replace: true });
      return;
    }
    reset({ carePlace: w.carePlace });
  }, [navigate, reset]);

  useEffect(() => {
    const sub = watch((values) => {
      patchWorking({ carePlace: values.carePlace ?? '' });
    });
    return () => sub.unsubscribe();
  }, [watch, patchWorking]);

  const onApply = (values: PlaceValues) => {
    patchWorking(values);
    applyToDraft(['carePlace']);
    navigate('/register/preview');
  };

  const onBack = () => {
    discard();
    navigate('/register/preview');
  };

  if (!working) {
    return (
      <main>
        <p>세션 없음 — 미리보기로 이동합니다…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>등록 미리보기 — 간병장소 세부수정</h1>
      <p>
        <small>적용 전까지 RegisterDraft 미반영. 이전/새로고침 = 버림.</small>
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
