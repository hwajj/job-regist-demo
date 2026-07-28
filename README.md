# job-regist-demo

학습용: care처럼 **같은 화면을 등록 미리보기 / 수정 / 재등록이 재사용**.

## 실행

```bash
cd job-regist-demo
npm install
npm run dev
```

## UI 공용 (핵심)

| 화면 | 파일 | 쓰이는 곳 |
|------|------|-----------|
| 미리보기/수정 메인 | `pages/shared/PreviewMain.tsx` | register / edit / reregister |
| 장소 세부수정 | `pages/shared/PlaceEdit.tsx` | 동일 |
| 기간 세부수정 | `pages/shared/PeriodEdit.tsx` | 동일 |

mode는 URL로 결정 (`hooks/useFormRouteContext.ts`).  
UI를 고치면 **한곳만** 고치면 됩니다.

| mode | 최종 API | Draft |
|------|----------|-------|
| register | create 후 Draft 삭제 | RegisterDraft 사용 |
| edit | update | 무관 |
| reregister | create (새 id) | **건드리지 않음** |

## 저장소

| 저장소 | persist | 용도 |
|--------|---------|------|
| RegisterDraft | localStorage | 신규 등록 이어쓰기만 |
| Workspace | 메모리 | edit/reregister committed·working + 등록 섹션 working |
| mock DB | localStorage | 서버 |

## 라우트

- `/register/preview` (+ `/place`, `/period`)
- `/jobs/:id/edit` (+ `/place`, `/period`)
- `/reregister/:sourceJobId` (+ `/place`, `/period`)  
  → 전부 같은 3개 컴포넌트
