# AGIT Server

AGIT(AI-Guided Interactive Training) 솔루션의 백엔드 API 서버입니다.

## 기술 스택

- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS 10
- **Database**: Supabase (PostgreSQL + Realtime + Auth + Storage)
- **ORM**: Prisma
- **Validation**: class-validator, class-transformer
- **Documentation**: @nestjs/swagger (OpenAPI 자동 생성)
- **Testing**: Jest
- **AI Integration**: OpenAI SDK, Anthropic SDK

## 주요 기능

- **User**: 회원가입, 로그인, 프로필 관리
- **Workspace**: 워크스페이스 생성/관리 (System 허가 Owner만 생성 가능)
- **Course**: 코스 생성/관리, Expert/Participant 초대
- **Module**: 모듈 생성/관리, 팀으로 내보내기
- **Team**: 팀 생성, Participant 역할 배정 (CEO/CPO/CMO/COO/CTO/CFO)
- **Task**: 태스크 관리, Guide/Prompt/Product 3탭 구조
- **Comments**: 태스크별 코멘트 (채팅형 우측 패널)

## 상태 전이

```
Task Status: Todo -> Doing -> Review -> Done
```

## 역할 계층

- **Workspace**: Owner, Member
- **Course**: Manager, Expert, Participant
- **Team**: CEO, CPO, CMO, COO, CTO, CFO

## 설치 및 실행

### 사전 요구사항

- Node.js 20 LTS
- npm 또는 yarn
- Supabase 프로젝트

### 환경 변수 설정

```bash
cp .env.example .env.local
# .env.local 파일을 편집하여 환경 변수 설정
```

### 설치

```bash
npm install
```

### Prisma 설정

```bash
# Prisma Client 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:migrate

# (선택) 시드 데이터 삽입
npm run db:seed
```

### 개발 서버 실행

```bash
npm run start:dev
```

서버가 실행되면:
- API: http://localhost:5000/v1
- Swagger 문서: http://localhost:5000/api-docs

### 프로덕션 빌드

```bash
npm run build
npm run start:prod
```

### Docker 실행

```bash
docker-compose up -d
```

## API 문서

서버 실행 후 `/api-docs` 경로에서 Swagger UI를 통해 API 문서를 확인할 수 있습니다.

## 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 테스트 커버리지
npm run test:cov
```

## 프로젝트 구조

```
agit-server/
├── prisma/
│   ├── schema.prisma           # Prisma 스키마
│   ├── migrations/             # 마이그레이션 파일
│   └── seed.ts                 # 시드 데이터
│
├── src/
│   ├── main.ts                 # 앱 진입점
│   ├── app.module.ts           # 루트 모듈
│   │
│   ├── config/                 # 설정
│   │   ├── app.config.ts
│   │   ├── supabase.config.ts
│   │   └── ai.config.ts
│   │
│   ├── common/                 # 공통 모듈
│   │   ├── decorators/
│   │   ├── guards/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── dto/
│   │
│   ├── modules/
│   │   ├── auth/               # 인증
│   │   ├── users/              # 사용자 프로필
│   │   ├── workspaces/         # 워크스페이스
│   │   ├── courses/            # 코스
│   │   ├── modules/            # 모듈
│   │   ├── teams/              # 팀
│   │   ├── tasks/              # 태스크
│   │   ├── guides/             # 가이드 탭
│   │   ├── prompts/            # 프롬프트 탭
│   │   ├── products/           # 프로덕트 탭
│   │   ├── comments/           # 코멘트
│   │   ├── ai/                 # AI 서비스
│   │   └── files/              # 파일 업로드
│   │
│   ├── prisma/                 # Prisma 서비스
│   └── supabase/               # Supabase 클라이언트
│
├── test/
│   ├── e2e/
│   └── unit/
│
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── nest-cli.json
├── package.json
└── tsconfig.json
```

## 라이센스

UNLICENSED - Private
