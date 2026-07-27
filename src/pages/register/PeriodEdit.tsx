import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { periodSchema, type PeriodValues } from '../../schema';
import { useRegisterSectionStore } from '../../store/registerSection';
import { FieldError } from '../../components/FieldError';

export function RegisterPeriodEditPage() {
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
  } = useForm<PeriodValues>({
    resolver: zodResolver(periodSchema),
    defaultValues: { carePeriod: '' },
  });

  useEffect(() => {
    const w = useRegisterSectionStore.getState().working;
    if (!w) {
      navigate('/register/preview', { replace: true });
      return;
    }
    reset({ carePeriod: w.carePeriod });
  }, [navigate, reset]);

  useEffect(() => {
    const sub = watch((values) => {
      patchWorking({ carePeriod: values.carePeriod ?? '' });
    });
    return () => sub.unsubscribe();
  }, [watch, patchWorking]);

  const onApply = (values: PeriodValues) => {
    patchWorking(values);
    applyToDraft(['carePeriod']);
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
      <h1>등록 미리보기 — 간병기간 세부수정</h1>
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
