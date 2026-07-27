import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { jobFormSchema, step2Schema, type Step2Values } from '../../schema';
import { useRegisterDraftStore } from '../../store/registerDraft';
import { FieldError } from '../../components/FieldError';

export function RegisterStep2Page() {
  const navigate = useNavigate();
  const getData = useRegisterDraftStore((s) => s.getData);
  const patchDraft = useRegisterDraftStore((s) => s.patchDraft);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: { carePlace: '', carePeriod: '' },
  });

  useEffect(() => {
    const d = getData();
    reset({ carePlace: d.carePlace, carePeriod: d.carePeriod });
  }, [getData, reset]);

  useEffect(() => {
    const sub = watch((values) => {
      patchDraft({
        carePlace: values.carePlace ?? '',
        carePeriod: values.carePeriod ?? '',
      });
    });
    return () => sub.unsubscribe();
  }, [watch, patchDraft]);

  const onNext = (values: Step2Values) => {
    patchDraft(values);
    const full = { ...getData(), ...values };
    const parsed = jobFormSchema.safeParse(full);
    if (!parsed.success) {
      setError('Step1 정보가 부족합니다. 이전으로 돌아가 입력해 주세요.');
      return;
    }
    // care처럼 최종 제출 전 미리보기(섹션 수정 가능)
    navigate('/register/preview');
  };

  return (
    <main>
      <p>
        <Link to="/">← Home</Link>
      </p>
      <h1>등록 Step2 — 간병정보</h1>
      <p>
        <small>RegisterDraft에 즉시 저장. 다음 = 등록 미리보기.</small>
      </p>
      <form onSubmit={handleSubmit(onNext)}>
        <fieldset>
          <legend>Step2</legend>
          <p>
            <label>
              간병장소 <input type="text" {...register('carePlace')} />
            </label>
            <FieldError message={errors.carePlace?.message} />
          </p>
          <p>
            <label>
              간병기간{' '}
              <input type="text" placeholder="예: 2026-08-01 ~ 2026-08-07" {...register('carePeriod')} />
            </label>
            <FieldError message={errors.carePeriod?.message} />
          </p>
        </fieldset>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <p>
          <button type="button" onClick={() => navigate('/register/step1')}>
            이전
          </button>{' '}
          <button type="submit">다음 (미리보기)</button>
        </p>
      </form>
    </main>
  );
}
