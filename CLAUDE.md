# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 가이드를 제공합니다.

## 프로젝트 개요
React 19 + TypeScript로 구축된 일정 관리 애플리케이션입니다. 테스트 주도 개발 방식의 캘린더 스케줄링 앱으로 일정 관리, 알림, 겹침 감지 기능을 제공합니다.

**기술 스택**: React 19, TypeScript, Material UI, Vitest, MSW, Vite, Express

## 아키텍처 패턴

**커스텀 훅 패턴**을 사용한 상태 관리 - Redux/Zustand 사용하지 않음. 비즈니스 로직은 전문화된 훅으로 분리됩니다:

- `useEventForm` - 폼 상태, 유효성 검증, 수정 모드 관리
- `useEventOperations` - CRUD 작업 및 API 통신
- `useCalendarView` - 뷰 모드(주간/월간), 네비게이션, 공휴일 API
- `useNotifications` - 1초 간격 폴링으로 임박한 일정 알림
- `useSearch` - 검색어 필터링과 날짜 범위 필터링 결합

**데이터 흐름**:
```
App.tsx → 훅들 → fetch() → Express (포트 3000) → JSON 파일 저장소
                              ↓ (테스트 환경)
                            MSW 핸들러
```

## 프로젝트 파일 구조

```
front_7th_chapter1-2/
├── .claude/
│   └── agents/                    # AI 에이전트 설정
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   ├── __mocks__/                 # API 모킹
│   │   ├── handlers.ts            # MSW 요청 핸들러
│   │   ├── handlersUtils.ts       # 테스트용 모킹 헬퍼 함수
│   │   └── response/
│   │       ├── events.json        # 테스트용 이벤트 데이터
│   │       └── realEvents.json    # 개발용 실제 이벤트 데이터
│   ├── __tests__/                 # 테스트 파일 (난이도별 구조)
│   │   ├── hooks/                 # 훅 테스트
│   │   │   ├── easy.useCalendarView.spec.ts
│   │   │   ├── easy.useSearch.spec.ts
│   │   │   ├── medium.useEventOperations.spec.ts
│   │   │   └── medium.useNotifications.spec.ts
│   │   ├── unit/                  # 유닛 테스트
│   │   │   ├── easy.dateUtils.spec.ts
│   │   │   ├── easy.eventOverlap.spec.ts
│   │   │   ├── easy.eventUtils.spec.ts
│   │   │   ├── easy.fetchHolidays.spec.ts
│   │   │   ├── easy.notificationUtils.spec.ts
│   │   │   └── easy.timeValidation.spec.ts
│   │   ├── medium.integration.spec.tsx  # 통합 테스트
│   │   └── utils.ts               # 테스트 유틸리티
│   ├── apis/                      # API 호출
│   │   └── fetchHolidays.ts       # 공휴일 조회 API
│   ├── hooks/                     # 커스텀 훅
│   │   ├── useCalendarView.ts
│   │   ├── useEventForm.ts
│   │   ├── useEventOperations.ts
│   │   ├── useNotifications.ts
│   │   └── useSearch.ts
│   ├── utils/                     # 유틸리티 함수
│   │   ├── dateUtils.ts           # 날짜 계산 및 포맷팅 (ISO 주 표준)
│   │   ├── eventOverlap.ts        # 일정 겹침 감지
│   │   ├── eventUtils.ts          # 일정 관련 유틸리티
│   │   ├── notificationUtils.ts   # 알림 처리
│   │   └── timeValidation.ts      # 시간 유효성 검증
│   ├── App.tsx                    # 메인 애플리케이션 컴포넌트
│   ├── main.tsx                   # 애플리케이션 진입점
│   ├── setupTests.ts              # 테스트 환경 설정
│   ├── types.ts                   # TypeScript 타입 정의
│   └── vite-env.d.ts              # Vite 환경 타입
├── CLAUDE.md                      # 이 파일
├── README.md                      # 프로젝트 설명
├── report.md                      # 과제 리포트
├── eslint.config.js               # ESLint 설정
├── package.json                   # 의존성 및 스크립트
├── server.js                      # Express 백엔드 서버
├── tsconfig.json                  # TypeScript 기본 설정
├── tsconfig.app.json              # 앱용 TypeScript 설정
├── tsconfig.node.json             # Node용 TypeScript 설정
└── vite.config.ts                 # Vite 빌드 설정
```

## 개발 명령어

```bash
# 주요 개발 워크플로우
pnpm dev                # 프론트엔드(Vite) + 백엔드(Express) 동시 실행 (watch 모드)

# 개별 서비스
pnpm start              # 프론트엔드만 실행 (포트 5173)
pnpm server:watch       # 백엔드만 실행 with --watch (포트 3000)

# 테스트
pnpm test               # Vitest watch 모드
pnpm test:ui            # Vitest UI 인터페이스
pnpm test:coverage      # 커버리지 리포트

# 린팅
pnpm lint               # ESLint + TypeScript 타입 체크
pnpm lint:eslint        # ESLint만 실행
pnpm lint:tsc           # TypeScript 체크만 실행
```

**참고**: Vite 개발 서버는 `/api/*` 요청을 `http://localhost:3000`으로 프록시합니다 (vite.config.ts 참조)

## 테스트 아키텍처

### 난이도별 테스트 구조
- `easy.*.spec.ts` - 유틸리티 단위 테스트 (dateUtils, eventOverlap, timeValidation)
- `medium.*.spec.ts` - 훅 테스트 및 통합 테스트
- `hard.*.spec.ts` - 복잡한 사용자 시나리오 테스트

### 중요한 테스트 설정 (setupTests.ts)
```typescript
// 모든 테스트에서 시간이 2025-10-01로 모킹됨
vi.useFakeTimers();
vi.setSystemTime(new Date('2025-10-01'));
vi.stubEnv('TZ', 'UTC');

// MSW 서버가 전역으로 설정됨
// expect.hasAssertions()가 beforeEach에서 강제됨
```

### 테스트 패턴
1. **MSW를 사용한 API 모킹** - 모든 HTTP 요청이 `__mocks__/handlers.ts`의 핸들러로 가로채짐
2. **헬퍼 함수** `__mocks__/handlersUtils.ts`에 위치:
   - `setupMockHandlerCreation(server, newEvent)` - 생성 모킹
   - `setupMockHandlerUpdating(server, editedEvent)` - 수정 모킹
   - `setupMockHandlerDeletion(server, eventId)` - 삭제 모킹
3. **이중 JSON 데이터베이스**:
   - `realEvents.json` - 개발용 데이터
   - `e2e.json` - E2E 테스트 데이터 (`TEST_ENV` 환경변수로 구분)
4. **접근성 쿼리 우선** - `data-testid`보다 `getByRole`, `getByLabelText` 사용 권장

## 비자명한 구현 세부사항

### 1. 알림 폴링 시스템
- **1초마다** `setInterval` 실행 (useNotifications.ts)
- `notifiedEvents` 배열로 중복 알림 방지
- 알림된 일정은 빨간색으로 표시되며 `<Notifications/>` 아이콘 표시

### 2. 주 계산 로직
- **ISO 주 표준** 사용 (주는 해당 목요일이 속한 월에 포함)
- dateUtils.ts의 `formatWeek()` 참조
- 월간 뷰에서 어떤 주를 어느 월에 표시할지 결정하는 데 영향

### 3. 일정 겹침 감지
- **비차단 경고 다이얼로그** - 사용자가 겹침에도 불구하고 진행 가능
- eventOverlap.ts의 `findOverlappingEvents(eventData, existingEvents)` 사용
- 같은 날짜 + 시간 범위 교차 확인

### 4. 반복 기능 (중요)
- **UI가 주석 처리됨** App.tsx (441-478줄)
- 주석 내용: "반복은 8주차 과제에 포함됩니다"
- **아직 반복 기능을 구현하지 말 것**
- 백엔드 엔드포인트는 `/api/recurring-events/:repeatId`에 이미 존재

### 5. 시간 유효성 검증
- 시작 시간은 종료 시간보다 이전이어야 함
- timeValidation.ts의 `getTimeErrorMessage()`에서 검증 수행
- blur 이벤트 발생 시 Tooltip으로 에러 표시

### 6. JSON 임포트 패턴
```javascript
// handlers.ts에서 import assertion 사용
import eventsData from './response/events.json' assert { type: 'json' };
```

## API 엔드포인트

```
GET    /api/events                    # 모든 일정 조회
POST   /api/events                    # 일정 생성 (body: EventForm)
PUT    /api/events/:id                # 일정 수정 (body: Event)
DELETE /api/events/:id                # 일정 삭제
GET    /api/recurring-events/:repeatId # (8주차 - 아직 미사용)
```

**데이터 저장소**: Express 서버가 JSON 파일에 기록:
- 개발 환경: `src/__mocks__/response/realEvents.json`
- E2E 테스트: `src/__mocks__/response/e2e.json` (`TEST_ENV` 설정 시)

## 데이터 모델

```typescript
interface Event {
  id: string;
  title: string;
  date: string;              // YYYY-MM-DD 형식
  startTime: string;         // HH:MM 형식
  endTime: string;           // HH:MM 형식
  description: string;
  location: string;
  category: string;          // '업무' | '개인' | '가족' | '기타'
  repeat: RepeatInfo;
  notificationTime: number;  // 분 단위: 1, 10, 60, 120, 1440
}

interface RepeatInfo {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
}
```

## 코드 구성

### 훅 책임사항
- `useEventForm` - 폼 상태 관리, 유효성 검증(시작/종료 시간), 수정 모드
- `useEventOperations` - API를 통한 일정 조회, 생성, 수정, 삭제
- `useCalendarView` - 뷰 모드(주간/월간), 날짜 네비게이션, 공휴일 조회
- `useNotifications` - 1초마다 임박한 일정 폴링, 알림 상태 관리
- `useSearch` - 검색어 + 현재 뷰의 날짜 범위로 일정 필터링

### 유틸리티 파일
- `dateUtils.ts` - 날짜 포맷팅, 주/월 계산 (ISO 주 표준)
- `eventOverlap.ts` - 일정 간 시간 충돌 감지
- `timeValidation.ts` - 시작 시간 < 종료 시간 검증

### 컴포넌트 구조
- `App.tsx` - 단일 모놀리식 컴포넌트 (컴포넌트 분리 없음)
- Material UI를 `sx` prop 스타일링과 함께 광범위하게 사용
- main.tsx에서 Notistack을 토스트 알림용으로 래핑

## 코딩 컨벤션

### 파일 명명 규칙
- **컴포넌트**: PascalCase (예: `UserProfile.tsx`, `EventCard.tsx`)
- **유틸리티**: camelCase (예: `formatDate.ts`, `repeatUtils.ts`, `dateUtils.ts`)
- **상수**: UPPER_SNAKE_CASE (예: `API_ENDPOINTS.ts`, `MAX_DATE.ts`)
- **스타일**: kebab-case (예: `user-profile.module.css`)
- **테스트**: `[난이도].[기능명].spec.ts`
  - easy: 단순 유틸리티 (`easy.dateUtils.spec.ts`)
  - medium: 훅, 통합 테스트 (`medium.useEventOperations.spec.ts`)
  - hard: 복잡한 시나리오 (`hard.repeatUtils.spec.ts`)

### 주석 작성 규칙
- 코드가 **'무엇을'** 하는지가 아닌 **'왜'** 하는지 설명
- JSDoc 형식으로 함수 문서화:
  ```typescript
  /**
   * 반복 일정 인스턴스를 생성합니다.
   *
   * @param baseEvent - 원본 일정 (템플릿)
   * @param endDate - 반복 종료일 (최대 2025-12-31)
   * @returns 생성된 반복 일정 배열
   */
  function generateRecurringEvents(baseEvent: Event, endDate: string): Event[]
  ```
- TODO 주석은 이슈 번호와 함께:
  ```typescript
  // TODO(#123): 31일 매월 반복 최적화 필요
  ```

### 에러 처리
- **모든 비동기 함수는 try-catch 사용**
- 에러 반환 형식을 일관되게 유지:
  ```typescript
  async function saveEvent(event: Event): Promise<{
    success: boolean;
    data?: Event;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(event)
      });

      if (!response.ok) {
        throw new Error('일정 저장에 실패했습니다');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error saving event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      };
    }
  }
  ```

### Import 순서
```typescript
// 1. React 관련
import { useState, useEffect } from 'react';

// 2. 외부 라이브러리
import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';

// 3. 내부 모듈
import { useEventForm } from './hooks/useEventForm';
import { Event } from './types';
import { formatDate } from './utils/dateUtils';
```

## 추가 참고 문서
- 상세 코드 리뷰 규칙: `.claude/agents/CODE_REVIEW_RULES.md`
- Git 브랜치 전략: `.claude/agents/GIT_BRANCH_STRATEGY.md`
- 성능 최적화 가이드: `.claude/agents/PERFORMANCE_OPTIMIZATION.md`
- TDD 워크플로우: `.claude/agents/README.md`
