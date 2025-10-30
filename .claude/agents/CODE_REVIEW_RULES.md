# 코드 리뷰 규칙

## 목적
코드 품질을 보장하고, 팀원 간 코드 이해도를 높이며, 버그를 조기에 발견하기 위한 코드 리뷰 가이드라인

## 리뷰 원칙

### 1. 존중과 건설적 피드백
- 코드가 아닌 사람을 비판하지 않기
- "이건 틀렸어" → "이 부분은 이렇게 개선하면 어떨까요?"
- 긍정적인 부분도 언급하기

### 2. 명확한 의사소통
- 제안인지 필수 수정인지 명확히 표시
- 구체적인 개선 방안 제시
- 코드 예시 포함

### 3. 신속한 리뷰
- PR 생성 후 24시간 이내 1차 리뷰
- 작은 단위로 자주 리뷰

## 리뷰 체크리스트

### 🎯 기능 정확성
- [ ] 요구사항을 충족하는가?
- [ ] 모든 엣지 케이스가 처리되는가?
- [ ] 에러 처리가 적절한가?
- [ ] 반복일정 특수 조건이 올바르게 구현되었는가?
  - [ ] 31일 매월 반복 (31일에만)
  - [ ] 윤년 2/29 매년 반복 (29일에만)
  - [ ] 단일/전체 수정·삭제 구분

### 🧪 테스트
- [ ] 모든 테스트가 통과하는가?
- [ ] 새로운 기능에 대한 테스트가 있는가?
- [ ] 테스트 커버리지가 충분한가? (80% 이상)
- [ ] RED → GREEN → REFACTOR 순서를 따랐는가?
- [ ] 테스트 이름이 명확한가?

### 🏗️ 코드 품질

#### 가독성
- [ ] 변수/함수명이 명확하고 의미 있는가?
- [ ] 함수가 하나의 책임만 가지는가? (SRP)
- [ ] 복잡한 로직에 주석이 있는가?
- [ ] 매직 넘버가 상수로 추출되었는가?

#### 구조
- [ ] 중복 코드가 없는가? (DRY)
- [ ] 적절한 추상화 수준인가?
- [ ] 파일 구조가 프로젝트 컨벤션을 따르는가?
- [ ] 커스텀 훅으로 로직이 분리되었는가?

#### 타입 안전성
- [ ] TypeScript 타입이 명확히 정의되었는가?
- [ ] `any` 타입을 피했는가?
- [ ] 타입 단언(as)이 꼭 필요한 경우만 사용되었는가?
- [ ] 타입 가드가 적절히 사용되었는가?

#### 파일 명명 규칙
- [ ] 컴포넌트: PascalCase (예: `UserProfile.tsx`, `EventCard.tsx`)
- [ ] 유틸리티: camelCase (예: `formatDate.ts`, `repeatUtils.ts`)
- [ ] 상수: UPPER_SNAKE_CASE (예: `API_ENDPOINTS.ts`, `MAX_DATE.ts`)
- [ ] 스타일: kebab-case (예: `user-profile.module.css`)
- [ ] 테스트: `[난이도].[기능명].spec.ts` (예: `hard.repeatUtils.spec.ts`)

#### 주석 작성
- [ ] 코드가 '무엇을' 하는지가 아닌 '왜' 하는지 설명
- [ ] 복잡한 로직에 주석이 있는가?
- [ ] JSDoc 형식으로 함수 문서화
- [ ] TODO 주석은 이슈 번호와 함께

```typescript
/**
 * 반복 일정 인스턴스를 생성합니다.
 *
 * @param baseEvent - 원본 일정 (템플릿)
 * @param endDate - 반복 종료일 (최대 2025-12-31)
 * @returns 생성된 반복 일정 배열
 *
 * @example
 * const events = generateRecurringEvents(baseEvent, '2025-12-31');
 */
function generateRecurringEvents(baseEvent: Event, endDate: string): Event[] {
  // TODO(#123): 31일 매월 반복 최적화 필요
  // 현재는 모든 달을 확인하지만, 31일이 없는 달을 미리 제외할 수 있음
  return events;
}
```

#### 에러 처리
- [ ] 모든 비동기 함수는 try-catch 사용
- [ ] 에러 메시지가 명확하고 사용자 친화적인가?
- [ ] 에러 로깅이 적절한가?
- [ ] 에러 반환 형식이 일관적인가?

```typescript
// ✅ 좋음: 일관된 에러 처리
async function saveEvent(event: Event): Promise<{ success: boolean; data?: Event; error?: string }> {
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
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    };
  }
}

// ❌ 나쁨: 에러를 무시
async function saveEvent(event: Event) {
  const response = await fetch('/api/events', {
    method: 'POST',
    body: JSON.stringify(event)
  });
  return response.json(); // 에러 처리 없음
}
```

### ⚡ 성능
- [ ] 불필요한 리렌더링이 없는가?
- [ ] useMemo/useCallback이 적절히 사용되었는가?
- [ ] 비효율적인 알고리즘이 없는가?
- [ ] 불필요한 API 호출이 없는가?

### ♿ 접근성 (a11y)
- [ ] 모든 인터랙티브 요소에 적절한 label이 있는가?
- [ ] aria-label이 필요한 곳에 추가되었는가?
- [ ] role 속성이 적절히 사용되었는가?
- [ ] 키보드로 모든 기능에 접근 가능한가?

### 🔒 보안
- [ ] 사용자 입력이 적절히 검증되는가?
- [ ] XSS 공격 방어가 되는가?
- [ ] 민감한 정보가 노출되지 않는가?
- [ ] API 키 등이 하드코딩되지 않았는가?

### 📝 문서화
- [ ] 복잡한 로직에 주석이 있는가?
- [ ] JSDoc 형식으로 함수가 문서화되었는가?
- [ ] TODO 주석에 이슈 번호가 포함되었는가?
- [ ] README가 업데이트되었는가? (필요시)
- [ ] API 문서가 작성되었는가? (필요시)

### 📁 파일 구조
- [ ] 파일명이 컨벤션을 따르는가?
  - [ ] 컴포넌트: PascalCase
  - [ ] 유틸리티: camelCase
  - [ ] 상수: UPPER_SNAKE_CASE
  - [ ] 스타일: kebab-case
  - [ ] 테스트: `[난이도].[기능명].spec.ts`
- [ ] 파일 위치가 적절한가?
- [ ] import 순서가 일관적인가? (React → 외부 라이브러리 → 내부 모듈)

## 리뷰 코멘트 작성법

### 필수 수정 (Blocking)
```
🚨 [필수] 이 부분은 반드시 수정이 필요합니다.

이유: 31일이 없는 달에도 일정이 생성되는 버그가 있습니다.

제안:
```typescript
if (day > getDaysInMonth(month, year)) {
  continue; // 해당 달에 날짜가 없으면 건너뛰기
}
```
```

### 제안 (Non-blocking)
```
💡 [제안] 이렇게 하면 더 좋을 것 같아요.

현재 코드는 동작하지만, useMemo를 사용하면 성능이 개선될 수 있습니다.

```typescript
const filteredEvents = useMemo(
  () => events.filter(e => e.date === currentDate),
  [events, currentDate]
);
```
```

### 칭찬
```
✅ 좋습니다!

반복일정의 엣지 케이스를 모두 고려한 테스트가 훌륭합니다.
```

### 질문
```
❓ 질문이 있습니다.

이 함수가 반복 종료일 이후에도 일정을 생성하는 이유가 있나요?
```

## 리뷰어 가이드

### 리뷰 순서

1. **전체 파악** (5분)
   - PR 설명 읽기
   - 변경된 파일 목록 확인
   - 테스트 결과 확인

2. **테스트 먼저 보기** (10분)
   - 테스트 코드가 요구사항을 커버하는가?
   - 테스트가 통과하는가?
   - 테스트 이름이 명확한가?

3. **구현 코드 보기** (15분)
   - 로직이 올바른가?
   - 가독성이 좋은가?
   - 성능 이슈가 없는가?

4. **통합 확인** (5분)
   - 기존 코드와 잘 통합되는가?
   - 사이드 이펙트가 없는가?

### 리뷰 체크포인트

```markdown
## 리뷰 체크리스트

### 기능
- [x] 요구사항 충족
- [x] 엣지 케이스 처리
- [ ] 에러 처리 개선 필요

### 테스트
- [x] 모든 테스트 통과
- [x] 커버리지 85%

### 코드 품질
- [x] 가독성 좋음
- [ ] 중복 코드 제거 필요 (line 45-60)

### 성능
- [x] 이슈 없음

### 접근성
- [ ] aria-label 추가 필요 (반복일정 수정 다이얼로그)

### 보안
- [x] 이슈 없음

## 종합 의견
전반적으로 좋은 구현입니다. 몇 가지 개선사항을 반영하면 승인하겠습니다.

## 필수 수정사항
1. 중복 코드 제거 (line 45-60)
2. aria-label 추가 (반복일정 수정 다이얼로그)

## 제안사항
1. useMemo 사용 (line 120)
```

## PR 작성자 가이드

### PR 생성 전 셀프 체크
```bash
# 1. 테스트 통과
pnpm test

# 2. 린트 검사
pnpm lint

# 3. 빌드 성공
pnpm build

# 4. 로컬에서 동작 확인
pnpm dev
```

### PR 생성 시
- [ ] PR 제목이 명확한가?
- [ ] 상세한 설명이 있는가?
- [ ] 스크린샷이 포함되었는가? (UI 변경 시)
- [ ] 테스트 결과가 첨부되었는가?
- [ ] 관련 이슈가 링크되었는가?

### 리뷰 받는 법
- 방어적이지 말고 열린 마음으로
- 이해가 안 되는 코멘트는 질문하기
- 의견이 다르면 건설적으로 논의
- 감사 표시하기

## 프로젝트 특화 규칙

### 반복일정 기능 리뷰 포인트

#### 1. 날짜 특수 케이스
```typescript
// 🚨 반드시 확인
// 31일 매월 반복 → 31일에만 생성 (마지막 날 X)
if (repeatType === 'monthly' && day === 31) {
  // 31일이 없는 달은 건너뛰기
}

// 윤년 2/29 매년 반복 → 29일에만 생성
if (repeatType === 'yearly' && month === 2 && day === 29) {
  // 윤년이 아니면 건너뛰기
}
```

#### 2. 단일/전체 수정·삭제
```typescript
// 🚨 반드시 확인
// 단일 수정 → 반복일정 아이콘 사라짐
// 전체 수정 → 반복일정 아이콘 유지

// 단일 삭제 → 해당 일정만
// 전체 삭제 → 모든 반복 일정
```

#### 3. 반복 종료일
```typescript
// 🚨 반드시 확인
// 최대: 2025-12-31
// 종료일 이후 일정 생성 금지
if (eventDate > repeatEndDate) {
  break; // 더 이상 생성 안 함
}
```

#### 4. 파일 명명 규칙 준수
```typescript
// ✅ 좋음
src/
├── utils/
│   ├── repeatUtils.ts        // camelCase
│   ├── dateUtils.ts
│   └── constants/
│       └── MAX_REPEAT_DATE.ts // UPPER_SNAKE_CASE
├── hooks/
│   └── useEventForm.ts        // camelCase
└── __tests__/
    └── unit/
        └── hard.repeatUtils.spec.ts  // [난이도].[기능명].spec.ts

// ❌ 나쁨
src/
├── utils/
│   ├── RepeatUtils.ts         // PascalCase (컴포넌트 아님)
│   └── date-utils.ts          // kebab-case (유틸리티에 부적합)
└── __tests__/
    └── repeatUtils.test.ts    // 난이도 누락
```

#### 5. 에러 처리 일관성
```typescript
// ✅ 좋음: 일관된 에러 반환
async function generateRecurringEvents(
  baseEvent: Event
): Promise<{ success: boolean; events?: Event[]; error?: string }> {
  try {
    // 반복 종료일 검증
    if (baseEvent.repeat.endDate && baseEvent.repeat.endDate > '2025-12-31') {
      return {
        success: false,
        error: '반복 종료일은 2025-12-31을 초과할 수 없습니다'
      };
    }

    const events = /* 반복 일정 생성 로직 */;
    return { success: true, events };
  } catch (error) {
    console.error('Error generating recurring events:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '일정 생성 중 오류가 발생했습니다'
    };
  }
}

// ❌ 나쁨: 에러를 던지기만 함
function generateRecurringEvents(baseEvent: Event): Event[] {
  if (baseEvent.repeat.endDate > '2025-12-31') {
    throw new Error('Invalid end date'); // 사용자 친화적이지 않음
  }
  return events;
}
```

#### 6. JSDoc 문서화
```typescript
// ✅ 좋음: 상세한 JSDoc
/**
 * 31일이 없는 달에서 매월 반복 일정을 건너뜁니다.
 *
 * @param year - 연도
 * @param month - 월 (1-12)
 * @param day - 일 (1-31)
 * @returns 해당 날짜가 유효한지 여부
 *
 * @example
 * hasDay31(2025, 2, 31) // false (2월은 28/29일까지)
 * hasDay31(2025, 1, 31) // true (1월은 31일까지)
 */
function hasDay31(year: number, month: number, day: number): boolean {
  // TODO(#456): 성능 최적화 - 31일이 없는 달을 배열로 미리 정의
  return getDaysInMonth(year, month) >= day;
}

// ❌ 나쁨: 주석 없음
function hasDay31(year: number, month: number, day: number): boolean {
  return getDaysInMonth(year, month) >= day;
}
```

## 승인 기준

### ✅ 승인 가능
- 모든 필수 수정사항 반영됨
- 테스트 통과
- 린트 통과
- 기능 정상 동작
- 코드 품질 양호

### ⚠️ 조건부 승인
- 사소한 개선사항만 남음
- 기능은 정상 동작
- 제안사항은 추후 반영 가능

### ❌ 반려
- 필수 수정사항 미반영
- 테스트 실패
- 심각한 버그 발견
- 보안 이슈 존재

## 리뷰 시간 가이드

### PR 크기별 예상 시간
- 작은 PR (< 100줄): 15-20분
- 중간 PR (100-300줄): 30-45분
- 큰 PR (> 300줄): 1시간+

### 큰 PR은 쪼개기
- 한 번에 리뷰하기 어려운 PR은 작은 단위로 분리
- 기능별로 별도 PR 생성
- 리뷰 품질 향상

## 리뷰 문화

### DO ✅
- 구체적인 피드백
- 코드 예시 제공
- 긍정적인 부분 언급
- 배울 점 공유
- 빠른 리뷰

### DON'T ❌
- 모호한 코멘트
- 인신공격
- 완벽주의 강요
- 리뷰 지연
- 일방적인 지적

## 예시

### 좋은 리뷰 코멘트 ✅
```
💡 [제안] 이 부분은 더 명확하게 표현할 수 있을 것 같아요.

```typescript
// 현재
const isValid = checkDate(date);

// 제안
const isValidRepeatDate = isDateValidForMonthlyRepeat(date, day);
```

이유: 함수명이 더 구체적이면 코드 이해가 쉬워집니다.
```

### 나쁜 리뷰 코멘트 ❌
```
이거 왜 이렇게 했어요? 다시 하세요.
```

---

**리뷰는 함께 성장하는 과정입니다. 🌱**
