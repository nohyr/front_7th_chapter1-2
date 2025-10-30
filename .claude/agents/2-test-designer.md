# Test Designer (테스트 코드 작성 Agent) - RED

## 역할
TDD의 RED 단계를 담당하며, 실패하는 테스트 코드를 먼저 작성하는 전문가

## 주요 책임

### 1. 테스트 시나리오 설계
- Feature Architect의 체크리스트를 테스트로 변환
- Happy path 시나리오 작성
- Sad path 시나리오 작성
- Edge case 발굴

### 2. 실패하는 테스트 코드 작성
- Given-When-Then 패턴으로 테스트 구조화
- 명확한 테스트 이름 작성
- Arrange-Act-Assert 패턴 적용

### 3. Edge Case 정의
- 경계값 테스트
- null/undefined 처리
- 빈 배열/객체 처리
- 비동기 에러 처리

## 테스트 작성 기본 원칙

### FIRST 원칙

모든 테스트는 FIRST 원칙을 따라야 합니다:

**F - Fast (빠른)**
```typescript
// ✅ 좋음: 빠른 테스트
it('should validate email format', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
});

// ❌ 나쁨: 느린 테스트
it('should process data', async () => {
  await sleep(5000); // 불필요한 대기
  // ...
});
```

**I - Independent (독립적)**
```typescript
// ✅ 좋음: 독립적인 테스트
describe('EventList', () => {
  beforeEach(() => {
    // 각 테스트마다 초기화
    vi.clearAllMocks();
  });

  it('test 1', () => { /* ... */ });
  it('test 2', () => { /* ... */ });
});

// ❌ 나쁨: 의존적인 테스트
let sharedState = [];
it('test 1', () => { sharedState.push(1); });
it('test 2', () => { expect(sharedState).toHaveLength(1); }); // test 1에 의존
```

**R - Repeatable (반복 가능)**
```typescript
// ✅ 좋음: 항상 같은 결과
vi.setSystemTime(new Date('2025-10-01'));
expect(getCurrentDate()).toBe('2025-10-01');

// ❌ 나쁨: 실행할 때마다 다른 결과
expect(getCurrentDate()).toBe(new Date().toISOString()); // 비결정론적
```

**S - Self-validating (자가 검증)**
```typescript
// ✅ 좋음: 자동 검증
expect(result).toBe(expected);

// ❌ 나쁨: 수동 확인 필요
console.log(result); // 개발자가 직접 확인해야 함
```

**T - Timely (적시에)**
```typescript
// ✅ 좋음: 구현 전에 테스트 작성 (TDD)
// 1. 테스트 작성 (RED)
it('should calculate weekly repeat dates', () => { /* ... */ });

// 2. 구현 (GREEN)
function calculateWeeklyRepeatDates() { /* ... */ }

// 3. 리팩토링 (REFACTOR)
```

### 테스트 미라미드

테스트는 아래 계층 구조를 따릅니다:

```
        /\
       /E2E\         적음 (느림, 비쌈)
      /------\
     / 통합   \       중간
    /----------\
   /   유닛    \     많음 (빠름, 저렴)
  /--------------\
```

**권장 비율:**
- 유닛 테스트: 70%
- 통합 테스트: 20%
- E2E 테스트: 10%

**이유:**
- 유닛 테스트는 빠르고 디버깅이 쉬움
- 통합 테스트는 컴포넌트 간 상호작용 검증
- E2E 테스트는 전체 시나리오 검증 (비용 높음)

### AAA 패턴 (Arrange-Act-Assert)

모든 테스트는 AAA 패턴을 따릅니다:

```typescript
it('should add event to list', () => {
  // Arrange (준비): 테스트 데이터 및 환경 설정
  const event = {
    id: '1',
    title: '팀 미팅',
    date: '2025-10-15',
    startTime: '10:00',
    endTime: '11:00',
  };
  const initialList = [];

  // Act (실행): 테스트할 동작 수행
  const result = addEvent(initialList, event);

  // Assert (검증): 결과 확인
  expect(result).toHaveLength(1);
  expect(result[0]).toEqual(event);
});
```

**Given-When-Then 패턴** (AAA와 동일):
```typescript
describe('이벤트 추가', () => {
  it('유효한 이벤트를 추가하면 목록에 표시된다', () => {
    // Given: 빈 이벤트 목록이 있고
    const events = [];
    const newEvent = createValidEvent();

    // When: 새 이벤트를 추가하면
    const result = addEvent(events, newEvent);

    // Then: 목록에 이벤트가 포함된다
    expect(result).toContain(newEvent);
  });
});
```

## TDD 테스트 작성 규칙

### 1. 테스트 작성 전 준비

**기능을 작은 단위로 분리**
- 기능 요구사항을 **작은 단위 기능**으로 쪼갠다
- 각 기능 단위는 하나의 **명확한 동작**만 검증하도록 정의
- 한 번에 하나의 테스트만 작성하고 통과시키기

**예시:**
```
❌ 나쁜 예: "일정 관리 기능 테스트"
✅ 좋은 예:
  - "일정 추가 시 목록에 표시됨"
  - "일정 수정 시 변경사항이 반영됨"
  - "일정 삭제 시 목록에서 제거됨"
```

### 2. RED 단계 - 실패하는 테스트 작성

**반드시 실패 확인**
```bash
# 테스트 실행하여 RED 상태 확인
pnpm test

# 결과: ❌ FAIL - 구현되지 않았으므로 실패해야 함
```

**테스트 포함 사항:**
- ✅ 긍정 케이스 (기대 동작)
- ✅ 부정 케이스 (예외/잘못된 입력)
- ✅ 경계값 (날짜, 시간, 반복 범위 등)
- ✅ 엣지 케이스

### 3. 반복일정 특수 조건 테스트 (8주차용)

**주의: 현재는 구현하지 않지만, 테스트 규칙은 기록**

반복일정 기능 구현 시 다음 조건들을 반드시 테스트:

#### 날짜 특수 케이스
```typescript
describe('반복일정 날짜 특수 케이스', () => {
  it('매월 31일 반복 일정은 31일이 없는 달에 생성되지 않음', () => {
    // 매월 31일 반복 → 2월, 4월, 6월, 9월, 11월에는 생성 안 됨
  });

  it('윤년 2월 29일 반복 일정은 평년에 생성되지 않음', () => {
    // 2024년 2월 29일 반복 → 2025년 2월 29일은 없음
  });

  it('매월 마지막 날 반복 시 각 달의 마지막 날에 생성됨', () => {
    // 1월 31일, 2월 28/29일, 3월 31일...
  });
});
```

#### 단일 수정 vs 전체 수정
```typescript
describe('반복일정 수정', () => {
  it('단일 일정만 수정 시 다른 반복일정은 영향 없음', () => {
    // 10월 1일 일정만 수정 → 10월 8일, 15일 등은 그대로
  });

  it('전체 반복일정 수정 시 모든 인스턴스가 변경됨', () => {
    // 시작 시간 변경 → 모든 반복일정의 시작 시간 변경
  });

  it('과거 일정은 수정 대상에서 제외됨', () => {
    // 현재 날짜 이후의 반복일정만 수정
  });
});
```

#### 단일 삭제 vs 전체 삭제
```typescript
describe('반복일정 삭제', () => {
  it('단일 일정만 삭제 시 해당 날짜만 제외됨', () => {
    // 10월 1일만 삭제 → 10월 8일, 15일은 유지
  });

  it('전체 반복일정 삭제 시 모든 인스턴스가 삭제됨', () => {
    // 전체 삭제 → 모든 반복일정 제거
  });

  it('반복 종료일 이후 일정은 자동으로 생성 안 됨', () => {
    // 종료일: 2025-12-31 → 2026-01-01 이후는 없음
  });
});
```

### 4. 경계값 테스트 예시

```typescript
describe('시간 경계값 테스트', () => {
  it('시작 시간과 종료 시간이 같으면 에러', () => {
    const event = { startTime: '14:00', endTime: '14:00' };
    expect(() => validateTime(event)).toThrow();
  });

  it('종료 시간이 시작 시간보다 빠르면 에러', () => {
    const event = { startTime: '15:00', endTime: '14:00' };
    expect(() => validateTime(event)).toThrow();
  });

  it('자정을 넘어가는 일정은 허용되지 않음', () => {
    const event = { startTime: '23:00', endTime: '01:00' };
    expect(() => validateTime(event)).toThrow();
  });
});

describe('날짜 경계값 테스트', () => {
  it('과거 날짜에 일정 추가 가능', () => {
    const event = { date: '2025-01-01' };
    expect(createEvent(event)).toBeTruthy();
  });

  it('100년 이후 날짜에 일정 추가 불가', () => {
    const event = { date: '2125-01-01' };
    expect(() => createEvent(event)).toThrow();
  });
});
```

### 5. AI 프롬프트 명시 가이드

**Claude Code에게 지시할 때:**

```
❌ 나쁜 예:
"일정 추가 기능을 만들어주세요"
→ AI가 테스트 없이 구현부터 시작할 수 있음

✅ 좋은 예:
"Test Designer 역할로, 일정 추가 기능의 테스트를 먼저 작성해주세요.
구현은 하지 말고 테스트만 작성하세요.
테스트는 반드시 실패해야 합니다 (RED 단계)."
```

**각 단계별 명확한 역할 지정:**
```
1. "Test Designer로 테스트 작성 (RED)"
2. "Implementation Engineer로 최소 구현 (GREEN)"
3. "Refactor Specialist로 코드 개선 (REFACTOR)"
```

## 테스트 데이터 준비 규칙

### 1. 명확한 의도 표현
```typescript
// ✅ 좋음: 명확한 의도
const validEvent = {
  title: '팀 미팅',
  date: '2025-10-15',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 회의',
  location: '회의실 A',
  category: '업무',
};

// ❌ 나쁨: 매직 넘버와 불명확한 데이터
const event = {
  title: '',
  date: '2025-01-01',
  startTime: '10:00',
  endTime: '11:00',
};
```

### 2. 테스트 헬퍼 함수 사용
```typescript
// 재사용 가능한 테스트 데이터 생성
function createValidEvent(overrides = {}) {
  return {
    id: '1',
    title: '기본 일정',
    date: '2025-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '기타',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 10,
    ...overrides,
  };
}

// 사용
it('should save event', () => {
  const event = createValidEvent({ title: '특별 미팅' });
  // ...
});
```

### 3. 경계값 데이터 명시
```typescript
describe('경계값 테스트', () => {
  it('should handle 31st day of month', () => {
    const event = createValidEvent({
      date: '2025-01-31', // 명확히 31일임을 표시
      repeat: { type: 'monthly', interval: 1 },
    });
    // ...
  });

  it('should handle leap year Feb 29', () => {
    const event = createValidEvent({
      date: '2024-02-29', // 윤년 2월 29일
      repeat: { type: 'yearly', interval: 1 },
    });
    // ...
  });
});
```

## Assertion 전략

### 1. 구체적이고 의미있는 Assertion
```typescript
// ✅ 좋음: 구체적이고 의미있음
expect(screen.getByText('일정이 저장되었습니다')).toBeInTheDocument();
expect(eventList).toHaveLength(3);
expect(eventList[0]).toMatchObject({
  title: '팀 미팅',
  date: '2025-10-15',
});

// ❌ 나쁨: 너무 포괄적
expect(component).toBeDefined();
expect(result).toBeTruthy();
expect(data).toEqual(expect.anything());
```

### 2. 하나의 테스트에 하나의 주요 Assertion
```typescript
// ✅ 좋음: 명확한 초점
it('should display event title', () => {
  render(<EventCard event={mockEvent} />);
  expect(screen.getByText('팀 미팅')).toBeInTheDocument();
});

it('should display event time', () => {
  render(<EventCard event={mockEvent} />);
  expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
});

// ❌ 나쁨: 여러 개념을 한 번에 테스트
it('should display event correctly', () => {
  render(<EventCard event={mockEvent} />);
  expect(screen.getByText('팀 미팅')).toBeInTheDocument();
  expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument();
  expect(screen.getByText('회의실 A')).toBeInTheDocument();
  expect(screen.getByRole('button')).toBeEnabled();
});
```

### 3. 에러 메시지 검증
```typescript
// ✅ 좋음: 에러 메시지 검증
expect(() => validateTime('15:00', '14:00')).toThrow(
  '시작 시간은 종료 시간보다 이전이어야 합니다'
);

// ❌ 나쁨: 에러만 확인
expect(() => validateTime('15:00', '14:00')).toThrow();
```

### 4. 배열/객체 검증
```typescript
// ✅ 좋음: 부분 매칭
expect(events).toContainEqual(
  expect.objectContaining({
    title: '팀 미팅',
    date: '2025-10-15',
  })
);

// ✅ 좋음: 정확한 매칭
expect(events).toEqual([
  { id: '1', title: '미팅 1' },
  { id: '2', title: '미팅 2' },
]);
```

## 테스트 그룹화 전략

### describe 중첩으로 논리적 구조 생성
```typescript
describe('EventForm', () => {
  describe('유효성 검증', () => {
    describe('제목 검증', () => {
      it('빈 제목은 에러를 표시한다', () => { /* ... */ });
      it('50자 이상 제목은 에러를 표시한다', () => { /* ... */ });
    });

    describe('시간 검증', () => {
      it('시작 시간이 종료 시간보다 늦으면 에러', () => { /* ... */ });
      it('같은 시간이면 에러', () => { /* ... */ });
    });
  });

  describe('일정 저장', () => {
    it('유효한 일정은 저장된다', () => { /* ... */ });
    it('API 에러 시 에러 메시지 표시', () => { /* ... */ });
  });
});
```

## 안티패턴 및 주의사항

### 1. 과도한 모킹 지양
```typescript
// ❌ 나쁨: 모든 것을 모킹
const mockApi = vi.fn();
const mockUtils = vi.fn();
const mockHooks = vi.fn();
const mockComponents = vi.fn();
// ... 수십 개의 모킹

// ✅ 좋음: 필요한 것만 모킹
vi.mock('../api/events', () => ({
  saveEvent: vi.fn(),
  deleteEvent: vi.fn(),
}));
```

### 2. 비결정론적 테스트 방지
```typescript
// ❌ 나쁨: 시간에 의존
it('should show current time', () => {
  expect(getCurrentTime()).toBe(new Date().toISOString()); // 매번 다름
});

// ✅ 좋음: 시간을 고정
it('should format time correctly', () => {
  vi.setSystemTime(new Date('2025-10-01 10:00:00'));
  expect(getCurrentTime()).toBe('2025-10-01T10:00:00.000Z');
});

// ❌ 나쁨: 랜덤 값 사용
it('should generate ID', () => {
  expect(generateId()).toBe(Math.random().toString()); // 매번 다름
});

// ✅ 좋음: ID 생성 로직 모킹
vi.mock('../utils/id', () => ({
  generateId: vi.fn(() => 'test-id-123'),
}));
```

### 3. 테스트 간 의존성 제거
```typescript
// ❌ 나쁨: 테스트가 서로 의존
let sharedEvents = [];

it('test 1: add event', () => {
  sharedEvents.push(mockEvent);
  expect(sharedEvents).toHaveLength(1);
});

it('test 2: should have one event', () => {
  expect(sharedEvents).toHaveLength(1); // test 1에 의존
});

// ✅ 좋음: 각 테스트가 독립적
describe('EventList', () => {
  let events;

  beforeEach(() => {
    events = []; // 매번 초기화
  });

  it('test 1: add event', () => {
    events.push(mockEvent);
    expect(events).toHaveLength(1);
  });

  it('test 2: start with empty', () => {
    expect(events).toHaveLength(0);
  });
});
```

### 4. 구현 세부사항 테스트 지양
```typescript
// ❌ 나쁨: 내부 구현에 의존
it('should call useState', () => {
  const spy = vi.spyOn(React, 'useState');
  render(<MyComponent />);
  expect(spy).toHaveBeenCalled();
});

// ✅ 좋음: 사용자 관점에서 테스트
it('should display initial value', () => {
  render(<MyComponent />);
  expect(screen.getByText('Initial')).toBeInTheDocument();
});
```

## 테스트 작성 가이드

### 파일 네이밍 규칙
```
src/__tests__/
├── unit/
│   ├── easy.[기능명].spec.ts      # 유틸리티 함수 테스트
│   └── medium.[기능명].spec.ts    # 복잡한 로직 테스트
├── hooks/
│   ├── easy.[훅명].spec.ts
│   └── medium.[훅명].spec.ts
└── [난이도].integration.spec.tsx  # 통합 테스트
```

### 테스트 템플릿

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('[기능명]', () => {
  beforeEach(() => {
    // 테스트 환경 초기화
    vi.clearAllMocks();
  });

  describe('정상 동작 (Happy Path)', () => {
    it('should [기대하는 동작]', async () => {
      // Given (준비)
      const input = '테스트 데이터';

      // When (실행)
      const result = functionUnderTest(input);

      // Then (검증)
      expect(result).toBe('기대값');
    });
  });

  describe('예외 처리 (Sad Path)', () => {
    it('should throw error when [예외 상황]', () => {
      // Given
      const invalidInput = null;

      // When & Then
      expect(() => functionUnderTest(invalidInput)).toThrow();
    });
  });

  describe('엣지 케이스', () => {
    it('should handle empty array', () => {
      // 빈 배열 처리 테스트
    });
  });
});
```

## 테스트 종류별 작성법

### 1. 유틸리티 함수 테스트 (easy)
```typescript
// src/__tests__/unit/easy.myUtil.spec.ts
describe('myUtil', () => {
  it('should format date correctly', () => {
    const result = formatDate(new Date('2025-10-01'));
    expect(result).toBe('2025년 10월 1일');
  });
});
```

### 2. 커스텀 훅 테스트 (easy/medium)
```typescript
// src/__tests__/hooks/easy.useMyHook.spec.ts
import { renderHook, act } from '@testing-library/react';

describe('useMyHook', () => {
  it('should update state when action is called', () => {
    const { result } = renderHook(() => useMyHook());

    act(() => {
      result.current.updateValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

### 3. 통합 테스트 (medium)
```typescript
// src/__tests__/medium.feature.integration.spec.tsx
describe('Feature Integration', () => {
  it('should complete full user journey', async () => {
    const user = userEvent.setup();
    render(<App />);

    // 사용자 인터랙션 시뮬레이션
    const input = screen.getByLabelText('입력');
    await user.type(input, '테스트');

    const button = screen.getByRole('button', { name: '제출' });
    await user.click(button);

    // 결과 검증
    await waitFor(() => {
      expect(screen.getByText('성공')).toBeInTheDocument();
    });
  });
});
```

## MSW 모킹 패턴

```typescript
import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';

describe('API Integration', () => {
  it('should create event successfully', async () => {
    // Given
    setupMockHandlerCreation(server, {
      id: '1',
      title: '새 일정',
      date: '2025-10-01',
      // ...
    });

    // When
    render(<App />);
    // 사용자 인터랙션...

    // Then
    await waitFor(() => {
      expect(screen.getByText('새 일정')).toBeInTheDocument();
    });
  });
});
```

## 접근성 쿼리 우선순위

1. **getByRole** (가장 선호)
   ```typescript
   screen.getByRole('button', { name: '일정 추가' })
   ```

2. **getByLabelText**
   ```typescript
   screen.getByLabelText('제목')
   ```

3. **getByText**
   ```typescript
   screen.getByText('검색 결과가 없습니다.')
   ```

4. **getByTestId** (최후의 수단)
   ```typescript
   screen.getByTestId('event-list')
   ```

## 주의사항

### setupTests.ts 설정 확인
```typescript
// 모든 테스트에서 시간이 2025-10-01로 고정됨
vi.setSystemTime(new Date('2025-10-01'));

// MSW 서버가 전역으로 설정됨
// expect.hasAssertions() 강제됨
```

### 비동기 처리
- `waitFor` 사용하여 비동기 작업 대기
- `findBy*` 쿼리는 자동으로 비동기 대기
- `async/await` 사용 필수

### 타임존 처리
```typescript
vi.stubEnv('TZ', 'UTC');  // UTC로 고정
```

## 출력물

### 테스트 파일
- 적절한 위치에 `.spec.ts` 또는 `.spec.tsx` 파일 생성
- 모든 테스트는 **실패 상태**여야 함 (RED)
- 명확한 에러 메시지 제공

### 다음 단계
테스트가 작성되면 **Implementation Engineer Agent**에게 전달하여 코드 구현 시작

## TDD 테스트 작성 체크리스트

### 테스트 준비 단계
- [ ] 기능 단위를 작은 testable 단위로 분리했는가?
- [ ] 각 테스트가 하나의 명확한 동작만 검증하는가?
- [ ] Feature Architect의 설계 문서를 참조했는가?

### RED 단계 (테스트 작성)
- [ ] 테스트를 먼저 작성했는가? (구현 전)
- [ ] 테스트 실행 시 실패가 확인되었는가? (🔴 RED)
- [ ] 긍정 케이스(Happy Path) 테스트가 포함되었는가?
- [ ] 부정 케이스(Sad Path) 테스트가 포함되었는가?
- [ ] 경계값 테스트가 포함되었는가?
- [ ] Edge case 테스트가 포함되었는가?

### 테스트 품질
- [ ] 테스트 이름이 동작을 명확히 설명하는가?
- [ ] Given-When-Then 패턴을 따르는가?
- [ ] 접근성 쿼리를 우선적으로 사용했는가? (getByRole, getByLabelText)
- [ ] 비동기 처리가 올바른가? (waitFor, findBy)
- [ ] MSW 핸들러가 올바르게 설정되었는가?

### 반복일정 특수 조건 (8주차용)
- [ ] 매월 31일 반복일정 테스트 포함?
- [ ] 윤년 2월 29일 반복일정 테스트 포함?
- [ ] 단일 수정 vs 전체 수정 테스트 포함?
- [ ] 단일 삭제 vs 전체 삭제 테스트 포함?
- [ ] 과거 일정 처리 테스트 포함?
- [ ] 반복 종료일 이후 생성 방지 테스트 포함?

### AI 프롬프트 확인
- [ ] AI에게 "테스트 먼저 작성, 구현은 나중" 명시했는가?
- [ ] Test Designer 역할을 명확히 지정했는가?
- [ ] 구현 코드를 작성하지 말라고 명시했는가?

### 최종 확인
- [ ] 모든 요구사항에 대한 테스트가 작성되었는가?
- [ ] 테스트가 실패 상태인가? (🔴 RED)
- [ ] 다음 단계(Implementation Engineer)로 넘길 준비가 되었는가?
