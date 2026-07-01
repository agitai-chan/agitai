# AGIT

**AGIT (AI-Guided Interactive Training)** — AI 프롬프트 기반 창업·AI 리터러시 학습 플랫폼.
강사가 코스/모듈/태스크를 설계하면, 학습자가 팀을 이뤄 AI 프롬프트를 작성하고 AI가 프롬프트 품질을 평가·피드백하는 교육용 SaaS.

## 모노레포 구조

```
agitai/
├── backend/    NestJS 10 + Prisma + Supabase (REST API)
└── frontend/   React 18 + Vite + Zustand + TanStack Query
```

## 개발 명령어

### Backend (`backend/`)
```bash
npm install
npm run start:dev        # 개발 서버 (watch, 기본 포트 5000)
npm run build            # nest build
npm run lint             # eslint --fix
npm run test             # jest (단위 테스트)
npm run test:e2e         # e2e 테스트
npm run prisma:generate  # Prisma 클라이언트 생성
npm run prisma:migrate   # 마이그레이션 (dev)
npm run prisma:studio    # Prisma Studio
```
- 환경변수: `.env.local` 또는 `.env` (템플릿은 `.env.example` 참고). Supabase URL/키, `DATABASE_URL`, `DIRECT_URL`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `JWT_SECRET` 필요.
- API 전역 프리픽스: `v1` (예: `/v1/workspaces`). Swagger 문서 자동 생성.

### Frontend (`frontend/`)
```bash
npm install
npm run dev              # Vite 개발 서버 (포트 3000)
npm run build            # tsc && vite build
npm run lint             # eslint (max-warnings 0)
npm run generate-api     # OpenAPI 스펙 → TS 타입 생성
```
- API 베이스: `VITE_API_BASE_URL` (기본 `https://api.agit.io/v1`).

## 도메인 모델 (핵심)

계층 구조가 이 서비스의 뼈대다. 3계층마다 **별도의 역할(enum)** 을 가진다.

```
Workspace (Owner / Member)
  └─ Course (Manager / Expert / Participant) — CourseType 7종
      ├─ Module (순서 있는 학습 단위)
      │    └─ Task (템플릿) ── Guide
      └─ Team (CEO / CPO / CMO / COO / CTO / CFO)
           └─ TeamTask (팀별 실제 수행) ─ Guide / Prompt / Product
```

**태스크 3탭 구조** (도메인 핵심 개념):
- **Guide**: 강사가 제공하는 가이드 + 첨부파일
- **Prompt**: 학습자 프롬프트 + AI 응답 + `AIFeedback` (clarity/specificity/context/format/PIQ 점수)
- **Product**: 최종 산출물, 버전관리(`ProductVersion`) + Manager 리뷰(점수/랭킹/피드백)

**Task 상태 전이**: `Todo → Doing → Review → Done`

전체 스키마: @backend/prisma/schema.prisma

## Backend 아키텍처 (`backend/src`)

표준 NestJS 모듈 패턴 — 각 도메인은 `*.controller.ts` / `*.service.ts` / `*.module.ts` (+ `dto/`)로 구성.

- **기능 모듈**: `auth`, `users`, `workspaces`, `courses`, `modules`, `teams`, `tasks`, `guides`, `prompts`, `products`, `comments`, `ai`, `files`
- **`ai/`**: OpenAI/Anthropic 통합. 모델명 prefix(`gpt`/`claude`)로 provider 자동 라우팅. `evaluatePrompt()`가 PIQ 기반 프롬프트 품질 평가.
- **`files/`**: Supabase Storage 업로드 (multer).
- **`common/`**: 글로벌 인프라
  - Filter: `HttpExceptionFilter`
  - Interceptor: `TransformInterceptor`(응답 표준화), `LoggingInterceptor`
  - Guard: `supabase-auth`, `workspace-role`, `course-role`, `team-member`
  - Decorator: `@Public`, `@CurrentUser`, `@Roles`
- 인증: Supabase Auth 기반 Bearer JWT.

## Frontend 아키텍처 (`frontend/src`)

- **`api/`**: axios 인스턴스(`axios.ts`, 토큰 refresh 인터셉터 포함) + 도메인별 `endpoints/` + `types/`
- **`stores/`**: Zustand — `authStore`(persist로 토큰 저장), `uiStore`
- **서버 상태**: TanStack Query (`lib/queryClient.ts`)
- **`components/`**: `ui/`(디자인 시스템: Button/Card/Input/Tabs/Badge/FileUpload) + 도메인별 컴포넌트
- **`pages/`**: 라우트별 페이지. `routes/`의 React Router v6 설정, `ProtectedRoute`로 인증 가드
- **`hooks/`**: `useFileUpload`, `useDebounce`, `useOnClickOutside`, `useMediaQuery` 등

## 코드 컨벤션

- **언어**: 백/프론트 모두 TypeScript. 주석·문서는 한국어 사용.
- **Backend**: controller는 얇게, 비즈니스 로직은 service에. 응답은 `TransformInterceptor`가 표준화하므로 raw 데이터를 반환. 입력 검증은 `class-validator` DTO로. 권한은 컨트롤러에서 Guard로 강제.
- **Frontend**: 새 UI는 `components/ui/`의 기존 프리미티브를 우선 재사용. 서버 데이터는 TanStack Query, 클라이언트 전역 상태는 Zustand. import alias `@/` = `src/`.
- 커밋 메시지는 한국어 관례(`feat:`, `fix:`, `refactor:` prefix) 사용.

## 참고 / 주의사항

- 테스트는 e2e 2건(auth, workspace)만 존재 — 서비스 단위 테스트 커버리지 낮음.
- `ai.service`의 `evaluatePrompt`는 파싱 실패 시 하드코딩 fallback 점수를 반환하므로, AI 평가 로직 수정 시 fallback 경로 확인 필요.
- 프론트에 `socket.io-client` 의존성이 있으나 백엔드 WebSocket 게이트웨이는 아직 없음(실시간 코멘트 미완성 가능성).
