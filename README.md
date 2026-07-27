# job-regist-demo

공고 **등록 / 재등록 / 수정** 상태 설계를 학습하기 위한 미니 앱입니다.  
실제 `care` 앱의 registRenewal·상세 수정 동선을 **단순화**해 같은 개념만 드러냅니다.

- CSS 없음 (구조·데이터 흐름에만 집중)
- mock API + localStorage (백엔드 없음)
- 기존 `care` / protector 코드와 **무관** (독립 실행)

---

## 실행

```bash
cd job-regist-demo
npm install
npm run dev
```

브라우저: http://127.0.0.1:5173/

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 + 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |

> Node 16+ 권장. (Vite 4 기준)

---

## 이 데모가 풀려는 문제

care 공고등록이 복잡해 보이는 핵심은 UI가 아니라 **상태가 여러 lifecycle을 가진다**는 점입니다.

| 모드 | 질문 | 이 데모의 답 |
|------|------|--------------|
| 등록 | 작성 중 이탈해도 이어쓸 수 있나? | `RegisterDraft` (localStorage 1곳) |
| 등록 미리보기 | 장소만 고쳤다 취소하면? | working → 적용 시에만 Draft 반영 |
| 수정 | 적용 전 새로고침하면? | EditSession은 메모리 → 미적용 유실 |
| 재등록 | 신규 Draft랑 섞이나? | **안 섞임**. ReRegisterSession 별도 |
| 상세 | 뭐가 진실인가? | mock DB만 표시 |

---

## 전체 동선

```
Home
 ├─ 공고 등록 ──► Step1 → Step2 → Preview ──► (섹션 수정) ──► 등록완료 → Detail
 │                              │
 │                              ├─ /register/preview/place   (이전/적용)
 │                              └─ /register/preview/period  (이전/적용)
 │
 └─ 공고 목록 /jobs
      ├─ 아이템 클릭 → Detail (보기)
      │                 └─ 수정 → Edit Main
      │                              ├─ place  (이전/적용)
      │                              ├─ period (이전/적용)
      │                              └─ 수정완료 → update API → Detail
      │
      └─ [재등록] → ReRegister Main
                       ├─ place / period (이전/적용)
                       └─ 등록완료 → create API (새 id) → Detail
```

care 대응:

| care | demo |
|------|------|
| `/care/newRegist/...` 스텝 | `/register/step1`, `step2` |
| `/care/detail/register` 미리보기 | `/register/preview` |
| `location?isEdit&returnUrl` | `/register/preview/place`, `/jobs/:id/edit/place`, … |
| 리스트 재등록 (`reFlag`) | `/reregister/:sourceJobId` |
| 상세 수정 (`detailType=edit`) | `/jobs/:id/edit` |

---

## 핵심 개념: Draft / Session / DB

```
┌─────────────────────┐
│ RegisterDraft       │  신규 작성 중 초안 (persist)
│ localStorage 1키    │  재등록·수정과 절대 공유하지 않음
└─────────────────────┘

┌─────────────────────┐
│ *Session.working    │  세부수정 화면의 임시값 (메모리)
│ *Session.committed  │  메인(미리보기)에 보이는 확정분
└─────────────────────┘
        │ 적용
        ▼
   committed / Draft 갱신
        │ 등록완료·수정완료
        ▼
┌─────────────────────┐
│ mock DB             │  서버 역할 (persist)
│ 상세는 여기만 읽음  │
└─────────────────────┘
```

### 이전 vs 적용 vs 완료

| 버튼 | 의미 |
|------|------|
| **이전** | working 버림 → 메인으로. committed/Draft/DB 불변 |
| **적용** | working의 해당 필드만 committed(또는 Draft)에 merge |
| **등록완료 / 수정완료** | API 호출. 등록·재등록은 `create`, 수정은 `update` |

### 등록 vs 수정 vs 재등록

| | 최종 API | 원본 job | RegisterDraft |
|--|----------|----------|---------------|
| 신규 등록 | `create` | 없음 | 사용 (완료 시 삭제) |
| 수정 | `update` (같은 id) | 유지 | 무관 |
| 재등록 | `create` (새 id) | 유지 | **무관 (안 건드림)** |

시나리오: 신규 작성 중단 → 재등록 → 다시 신규 등록 → **이어쓰기 가능**  
이유는 Draft와 ReRegisterSession이 분리되어 있기 때문입니다.

---

## 라우트 목록

| Path | 화면 |
|------|------|
| `/` | Home (등록 시작 / 이어쓰기 confirm / 목록 링크) |
| `/jobs` | 공고 목록 (상세 · 재등록 버튼) |
| `/register/step1` | 이름, 나이, 성별 |
| `/register/step2` | 간병장소, 간병기간 |
| `/register/preview` | 등록 미리보기 (섹션 수정) |
| `/register/preview/place` | 장소 세부수정 |
| `/register/preview/period` | 기간 세부수정 |
| `/jobs/:id` | 상세 (DB만) |
| `/jobs/:id/edit` | 수정 메인 |
| `/jobs/:id/edit/place` | 수정 — 장소 |
| `/jobs/:id/edit/period` | 수정 — 기간 |
| `/reregister/:sourceJobId` | 재등록 메인 |
| `/reregister/:sourceJobId/place` | 재등록 — 장소 |
| `/reregister/:sourceJobId/period` | 재등록 — 기간 |

---

## 폴더 구조

```
job-regist-demo/
├── README.md
├── package.json
├── src/
│   ├── App.tsx                 # 라우터
│   ├── types.ts                # JobForm, Session, JobRecord
│   ├── schema.ts               # zod (step1/2, place, period)
│   ├── mock/
│   │   ├── db.ts               # localStorage DB
│   │   └── api.ts              # delay 있는 mock API
│   ├── store/
│   │   ├── registerDraft.ts    # 신규 Draft (persist)
│   │   ├── registerSection.ts  # 등록 미리보기 working
│   │   ├── editSession.ts      # 수정 committed/working
│   │   └── reRegisterSession.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── JobList.tsx
│   │   ├── Detail.tsx
│   │   ├── register/           # step + preview + 섹션 수정
│   │   ├── edit/
│   │   └── reregister/
│   └── components/
│       ├── JobSummary.tsx
│       └── FieldError.tsx
```

---

## localStorage 키

| 키 | 내용 |
|----|------|
| `job-regist-demo:register-draft` | Zustand persist — 신규 작성 초안 |
| `job-regist-demo:db` | mock 서버 DB (공고 배열) |

Edit / ReRegister / RegisterSection 의 **working은 메모리만**입니다.  
세부수정 중 새로고침하면 working이 사라지고 메인으로 돌아가며, **미적용 내용은 반영되지 않습니다.**

브라우저에서 초기화하려면 DevTools → Application → Local Storage에서 위 키를 지우면 됩니다.

---

## 기술 스택과 선택 이유

| 기술 | 이유 |
|------|------|
| Vite + React + TS | 독립 실행·빠른 피드백 |
| React Router | care와 같이 URL로 스텝/세부수정 분리 |
| Zustand (+ persist) | “Draft 하나”를 코드로 한눈에 |
| react-hook-form + zod | 필드 검증·에러를 스키마로 |
| mock delay | 비동기 제출 UX만 흉내 |

---

## 추천 체험 시나리오

### 1) 등록 + 섹션 이전/적용

1. Home → 공고 등록 → Step1·Step2 입력 → **미리보기**
2. 간병장소 「수정」→ 값 변경 → **이전** → 미리보기 값 그대로
3. 다시 「수정」→ 변경 → **적용** → 미리보기에 반영
4. 등록완료 → 상세에 DB 값 표시

### 2) Draft 이어쓰기

1. Step1만 입력 후 Home으로
2. 다시 「공고 등록」→ confirm에서 이어서 작성
3. 새로고침 후에도 Draft 유지되는지 확인

### 3) Draft ⊥ 재등록

1. 신규 Draft를 남겨 둔 채 목록에서 **재등록**
2. 재등록 완료(또는 취소)
3. 다시 「공고 등록」→ **아까 Draft로 이어쓰기** 가능한지 확인

### 4) 수정 + 새로고침

1. 상세 → 수정 → 장소 「수정」→ 값만 바꾸고 **새로고침**
2. 수정 메인으로 돌아가고, 바꾼 값은 **미반영**

### 5) 재등록은 새 id

1. 목록에서 재등록 → 등록완료
2. 목록에 **새 id** 공고가 생기고, 원본 id 공고는 그대로

---

## care 실제 코드와 비교할 때

데모는 개념만 같고, care에는 추가로 있습니다.

- Redux slice 여러 개 + 스텝별 localStorage 키
- 레거시 `CareType` ↔ slice 어댑터 (`useAdaptDetailData`)
- 연장(extend)·결제·암호화 등 Period에 섞인 부가 플로우
- `isEdit` / `returnUrl` / `jobIdZero` / `reFlag` 쿼리 분기

이 데모에서 먼저 익힌 뒤 care를 보면, “왜 `if (!isEdit) dispatch`가 반복되는지”가 **세션 규칙의 복붙 구현**으로 읽힙니다.

---

## 범위 밖 (의도적으로 없음)

- 실제 API / 인증
- CSS·디자인 시스템
- Step1 섹션 세부수정
- 공고 연장·결제
- 서버 Draft 동기화
