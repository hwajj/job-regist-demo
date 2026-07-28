import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import type { FormMode } from '../store/workspace';

export type FormRouteContext = {
  mode: FormMode;
  /** edit jobId / reregister sourceJobId */
  refId?: string;
  mainPath: string;
  placePath: string;
  periodPath: string;
  backLink: { to: string; label: string };
};

/**
 * URL로 mode를 결정 — care의 isEdit/reFlag처럼 화면은 같고 진입 맥락만 다름.
 */
export function useFormRouteContext(): FormRouteContext | null {
  const { pathname } = useLocation();
  const params = useParams<{ id?: string; sourceJobId?: string }>();

  return useMemo(() => {
    if (pathname.startsWith('/register/preview')) {
      return {
        mode: 'register',
        mainPath: '/register/preview',
        placePath: '/register/preview/place',
        periodPath: '/register/preview/period',
        backLink: { to: '/register/step2', label: '← Step2' },
      };
    }

    if (params.id && pathname.includes('/edit')) {
      const id = params.id;
      return {
        mode: 'edit',
        refId: id,
        mainPath: `/jobs/${id}/edit`,
        placePath: `/jobs/${id}/edit/place`,
        periodPath: `/jobs/${id}/edit/period`,
        backLink: { to: `/jobs/${id}`, label: '← 상세' },
      };
    }

    if (params.sourceJobId && pathname.includes('/reregister')) {
      const id = params.sourceJobId;
      return {
        mode: 'reregister',
        refId: id,
        mainPath: `/reregister/${id}`,
        placePath: `/reregister/${id}/place`,
        periodPath: `/reregister/${id}/period`,
        backLink: { to: '/jobs', label: '← 목록' },
      };
    }

    return null;
  }, [pathname, params.id, params.sourceJobId]);
}
