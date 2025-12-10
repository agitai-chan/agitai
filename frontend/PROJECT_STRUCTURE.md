# AGIT Frontend Project Structure

AI-Guided Interactive Training 웹 애플리케이션 프론트엔드

## 기술 스택

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand (전역), TanStack Query (서버)
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Form**: React Hook Form + Zod

## 디렉토리 구조

```
agit-frontend/
├── src/
│   ├── api/                      # API 레이어
│   │   ├── axios.ts              # Axios 인스턴스
│   │   ├── endpoints/            # API 호출 함수
│   │   │   ├── auth.ts
│   │   │   ├── workspace.ts
│   │   │   ├── course.ts
│   │   │   ├── module.ts
│   │   │   ├── team.ts
│   │   │   └── task.ts
│   │   └── types/                # TypeScript 타입
│   │
│   ├── components/               # 컴포넌트
│   │   ├── ui/                   # Button, Input, Badge, Tabs, Card
│   │   ├── layout/               # MainLayout, AuthLayout, Header, Sidebar
│   │   ├── auth/                 # GoogleLoginButton
│   │   ├── workspace/            # WorkspaceCard, CreateWorkspaceModal, InviteMemberModal
│   │   ├── course/               # CreateCourseModal, CreateModuleModal, CreateTeamModal
│   │   ├── task/                 # TaskHeader, GuideTab, PromptTab, ProductTab
│   │   └── comment/              # CommentPanel
│   │
│   ├── pages/                    # 페이지
│   │   ├── auth/                 # Login, Signup, PasswordReset
│   │   ├── dashboard/            # Dashboard
│   │   ├── workspace/            # List, Detail, Settings
│   │   ├── course/               # Detail, Settings
│   │   ├── team/                 # Detail
│   │   ├── task/                 # TaskDetail, TeamTaskDetail
│   │   ├── profile/              # Profile
│   │   └── error/                # NotFound, Error
│   │
│   ├── hooks/                    # 커스텀 훅
│   ├── stores/                   # Zustand 스토어
│   ├── routes/                   # 라우팅
│   ├── lib/                      # queryClient
│   ├── utils/                    # 유틸리티
│   └── styles/                   # 글로벌 스타일
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 시작하기

```bash
npm install
cp .env.example .env.local
npm run dev
```

## 파일 통계

- TypeScript/TSX 파일: **85개**
- 컴포넌트: 35개
- 페이지: 15개
