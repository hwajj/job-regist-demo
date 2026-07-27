import { z } from 'zod';

export const step1Schema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  age: z.coerce
    .number({ invalid_type_error: '나이를 입력하세요' })
    .int('나이는 정수여야 합니다')
    .min(1, '나이는 1 이상')
    .max(120, '나이는 120 이하'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: '성별을 선택하세요' }),
  }),
});

export const step2Schema = z.object({
  carePlace: z.string().min(1, '간병장소를 입력하세요'),
  carePeriod: z.string().min(1, '간병기간을 입력하세요'),
});

export const placeSchema = z.object({
  carePlace: z.string().min(1, '간병장소를 입력하세요'),
});

export const periodSchema = z.object({
  carePeriod: z.string().min(1, '간병기간을 입력하세요'),
});

export const jobFormSchema = step1Schema.merge(step2Schema);

export type Step1Values = z.infer<typeof step1Schema>;
export type Step2Values = z.infer<typeof step2Schema>;
export type PlaceValues = z.infer<typeof placeSchema>;
export type PeriodValues = z.infer<typeof periodSchema>;
export type JobFormValues = z.infer<typeof jobFormSchema>;
