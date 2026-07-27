import { Link, useNavigate } from 'react-router-dom';
import { useRegisterDraftStore } from '../store/registerDraft';

export function HomePage() {
  const navigate = useNavigate();
  const hasDraft = useRegisterDraftStore((s) => s.hasDraft);
  const clearDraft = useRegisterDraftStore((s) => s.clearDraft);
  const draft = useRegisterDraftStore((s) => s.draft);

  const startRegister = () => {
    if (hasDraft()) {
      const ok = window.confirm(
        '작성 중이던 내용이 있습니다. 이어서 작성할까요?\n\n확인: 이어서 작성\n취소: 새로 작성',
      );
      if (ok) {
        navigate('/register/step1');
        return;
      }
      clearDraft();
    }
    navigate('/register/step1');
  };

  return (
    <main>
      <h1>job-regist-demo</h1>
      <p>학습용: 등록 Draft / 수정 Session / 재등록 Session 분리</p>
      <hr />
      <p>
        <button type="button" onClick={startRegister}>
          공고 등록
        </button>
      </p>
      <p>
        <Link to="/jobs">공고 목록</Link>
      </p>
      {draft ? (
        <p>
          <small>RegisterDraft 있음 (updatedAt: {draft.updatedAt})</small>
        </p>
      ) : (
        <p>
          <small>RegisterDraft 없음</small>
        </p>
      )}
    </main>
  );
}
