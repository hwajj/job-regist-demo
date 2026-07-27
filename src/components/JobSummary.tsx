import type { JobForm } from '../types';
import { genderLabel } from '../types';

type Props = {
  data: JobForm;
  title?: string;
};

/** CSS 없이 폼 내용 표시 */
export function JobSummary({ data, title }: Props) {
  return (
    <section>
      {title ? <h3>{title}</h3> : null}
      <ul>
        <li>이름: {data.name || '-'}</li>
        <li>나이: {data.age === '' ? '-' : data.age}</li>
        <li>성별: {genderLabel(data.gender)}</li>
        <li>간병장소: {data.carePlace || '-'}</li>
        <li>간병기간: {data.carePeriod || '-'}</li>
      </ul>
    </section>
  );
}
