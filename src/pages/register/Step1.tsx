import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { step1Schema, type Step1Values } from '../../schema';
import { useRegisterDraftStore } from '../../store/registerDraft';
import { FieldError } from '../../components/FieldError';

export function RegisterStep1Page() {
  const navigate = useNavigate();
  const getData = useRegisterDraftStore((s) => s.getData);
  const patchDraft = useRegisterDraftStore((s) => s.patchDraft);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      age: undefined as unknown as number,
      gender: undefined as unknown as Step1Values['gender'],
    },
  });

  useEffect(() => {
    const d = getData();
    reset({
      name: d.name,
      age: d.age === '' ? (undefined as unknown as number) : Number(d.age),
      gender: (d.gender || undefined) as Step1Values['gender'],
    });
  }, [getData, reset]);

  // 입력 즉시 Draft persist (단일 저장소)
  useEffect(() => {
    const sub = watch((values) => {
      patchDraft({
        name: values.name ?? '',
        age: values.age === undefined || Number.isNaN(Number(values.age)) ? '' : Number(values.age),
        gender: (values.gender as Step1Values['gender']) || '',
      });
    });
    return () => sub.unsubscribe();
  }, [watch, patchDraft]);

  const onSubmit = (values: Step1Values) => {
    patchDraft({
      name: values.name,
      age: values.age,
      gender: values.gender,
    });
    navigate('/register/step2');
  };

  return (
    <main>
      <p>
        <Link to="/">← Home</Link>
      </p>
      <h1>등록 Step1 — 기본정보</h1>
      <p>
        <small>RegisterDraft에 즉시 저장됩니다. 새로고침해도 유지됩니다.</small>
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <legend>Step1</legend>
          <p>
            <label>
              이름{' '}
              <input type="text" {...register('name')} />
            </label>
            <FieldError message={errors.name?.message} />
          </p>
          <p>
            <label>
              나이{' '}
              <input type="number" {...register('age')} />
            </label>
            <FieldError message={errors.age?.message} />
          </p>
          <p>
            성별{' '}
            <label>
              <input type="radio" value="male" {...register('gender')} /> 남
            </label>{' '}
            <label>
              <input type="radio" value="female" {...register('gender')} /> 여
            </label>{' '}
            <label>
              <input type="radio" value="other" {...register('gender')} /> 기타
            </label>
            <FieldError message={errors.gender?.message} />
          </p>
        </fieldset>
        <p>
          <button type="submit">다음</button>
        </p>
      </form>
    </main>
  );
}
