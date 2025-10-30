# TDD 워크플로우

## 📋 명세서 소개

이 명세서는 **살아있는 문서(Living Documentation)**로, 반복 일정 기능의 모든 요구사항, 비즈니스 로직, 테스트 시나리오를 포함합니다.

---

## 🎯 명세 작성 원칙

### 1. 명확하고 구체적인 표현

**❌ 나쁜 예시**:
```
반복 일정은 올바르게 생성되어야 한다.
```

**✅ 좋은 예시**:
```
매월 31일 반복 일정 생성 시 다음 조건을 만족해야 한다:
- 31일이 있는 달(1월, 3월, 5월, 7월, 8월, 10월, 12월)에만 생성
- 31일이 없는 달(2월, 4월, 6월, 9월, 11월)은 건너뛰기
- 각 일정은 고유한 id를 가짐
- 모든 일정은 동일한 repeat.id를 공유
```

### 2. 실행 가능하고 검증 가능

모든 명세는 다음을 포함합니다:
- **Given** (전제 조건): 테스트 초기 상태
- **When** (동작): 함수 호출 또는 사용자 액션
- **Then** (결과): 예상 결과 및 검증 항목

**예시**:
```
Given: 2025-01-31을 시작일로 하는 매월 반복 일정
      종료일은 2025-06-30
When: generateRecurringEvents() 함수 호출
Then: 3개의 일정이 생성됨
      - 2025-01-31 (1월)
      - 2025-03-31 (3월)
      - 2025-05-31 (5월)
      2월(28일), 4월(30일), 6월(30일)은 생성되지 않음
```

### 3. 비즈니스 가치 명시

각 기능의 **"왜(Why)"**를 설명합니다:

```
## 매월 31일 반복 특수 처리
### 비즈니스 가치
- 사용자가 매월 급여일(31일)에 일정을 설정할 때 혼란 방지
- "31일이 없는 달은 마지막 날"이 아닌 "건너뛰기"로 명확히 정의
### 구현 의도
- 사용자의 예상과 일치하는 직관적인 동작
- 31일 vs 마지막 날의 의미적 차이 반영
```

### 4. 경계 조건 명시

모든 정상 케이스와 함께 경계 조건(Edge Case)도 정의합니다:

```
## 반복 종료일 검증
### 정상 케이스
- endDate: "2025-12-31" → 통과 (최대값)
- endDate: "2025-10-15" → 통과
### 경계 조건
- endDate: "2026-01-01" → 에러: "반복 종료일은 2025-12-31을 초과할 수 없습니다"
- endDate: "" → 기본값 "2025-12-31" 사용
- endDate < startDate → 에러: "종료일은 시작일보다 늦어야 합니다"
```

---

## 🔄 TDD 개발 프로세스

### 핵심 원칙: Test-Driven Development

이 프로젝트는 **TDD(Test-Driven Development)** 방법론을 엄격히 준수합니다. 명세를 읽고 **테스트를 먼저 작성**한 후, 테스트를 통과하는 코드를 구현합니다.

### Red-Green-Refactor 사이클

```
1. 🔴 RED: 실패하는 테스트 작성
   ├─ specs/ 디렉토리의 명세 파일 읽기
   ├─ 명세의 시나리오를 Vitest 테스트로 변환
   ├─ src/__tests__/unit/hard.repeatUtils.spec.ts 작성
   └─ pnpm test → 실패 확인 (함수가 아직 없음)

2. 🟢 GREEN: 테스트를 통과하는 최소 구현
   ├─ src/utils/repeatUtils.ts 생성
   ├─ 명세의 요구사항만 충족하는 코드 작성
   ├─ 불필요한 최적화 하지 않기
   └─ pnpm test → 성공 확인

3. ♻️ REFACTOR: 코드 개선
   ├─ 중복 제거, 가독성 향상
   ├─ 성능 최적화 (필요시)
   ├─ 명세 준수 확인
   └─ pnpm test → 여전히 성공해야 함
```

### Given-When-Then 패턴

이 명세에서 **Given-When-Then**은 테스트를 명확히 구조화하는 패턴입니다.

| 명세 표현 | TDD 의미 | Vitest 코드 |
|-----------|----------|-------------|
| **Given** | 전제 조건 | Arrange (테스트 데이터 준비) |
| **When** | 동작 | Act (함수 호출) |
| **Then** | 결과 검증 | Assert (기댓값 확인) |

### 명세 → 테스트 코드 변환 예시

#### 명세 (specs/02-repeat-generation-algorithm.md)
```gherkin
Given: baseEvent = { date: '2025-01-31', repeat: { type: 'monthly', endDate: '2025-06-30' } }
When: generateRecurringEvents(baseEvent) 호출
Then:
  - 3개의 일정이 반환됨
  - 날짜: ['2025-01-31', '2025-03-31', '2025-05-31']
  - 모든 일정이 동일한 repeat.id를 가짐
  - 각 일정은 고유한 id를 가짐
```

#### TDD 테스트 코드 (Vitest)
```typescript
describe('generateRecurringEvents - 매월 31일 반복', () => {
  it('31일이 있는 달에만 일정을 생성함', () => {
    // Given (Arrange) - 테스트 데이터 준비
    const baseEvent: EventForm = {
      title: '월말 보고',
      date: '2025-01-31',
      startTime: '15:00',
      endTime: '16:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-06-30'
      },
      notificationTime: 10
    };

    // When (Act) - 함수 실행
    const result = generateRecurringEvents(baseEvent);

    // Then (Assert) - 결과 검증
    expect(result).toHaveLength(3); // 1월, 3월, 5월만

    const dates = result.map(e => e.date);
    expect(dates).toEqual([
      '2025-01-31',
      '2025-03-31',
      '2025-05-31'
    ]);

    // 모든 일정이 같은 repeat.id를 가짐
    const repeatIds = result.map(e => e.repeat.id);
    const uniqueRepeatIds = new Set(repeatIds);
    expect(uniqueRepeatIds.size).toBe(1);

    // 각 일정은 고유한 id를 가짐
    const eventIds = result.map(e => e.id);
    const uniqueEventIds = new Set(eventIds);
    expect(uniqueEventIds.size).toBe(3);
  });
});
```

---

## 📝 TDD 워크플로우 전체 과정

### 단계별 실행

```
1. 📋 명세 읽기
   ├─ specs/02-repeat-generation-algorithm.md 확인
   └─ 요구사항과 시나리오 이해

2. 🔴 RED - 실패하는 테스트 작성
   ├─ src/__tests__/unit/hard.repeatUtils.spec.ts 생성
   ├─ 명세의 Given-When-Then을 Vitest 코드로 변환
   ├─ 모든 시나리오에 대한 테스트 작성
   └─ pnpm test → 실패 (함수가 아직 없음)

3. 🟢 GREEN - 최소 구현
   ├─ src/utils/repeatUtils.ts 생성
   ├─ generateRecurringEvents 함수 구현
   │   ├─ 반복 유형별 날짜 계산
   │   ├─ 31일 특수 처리
   │   ├─ 윤년 특수 처리
   │   └─ repeat.id 생성 및 할당
   └─ pnpm test → 성공

4. ♻️ REFACTOR - 코드 개선
   ├─ 중복 로직 함수로 추출
   │   ├─ hasDay31(year, month)
   │   ├─ isLeapYear(year)
   │   └─ addDays/addWeeks/addMonths/addYears
   ├─ 매직 넘버 상수로 추출
   ├─ JSDoc 주석 추가
   └─ pnpm test → 여전히 성공

5. ✅ 커밋
   ├─ git add .
   ├─ git commit -m "[RED] test(repeat): 반복일정 생성 테스트 작성"
   ├─ git commit -m "[GREEN] feat(repeat): 반복일정 생성 최소 구현"
   └─ git commit -m "[REFACTOR] refactor(repeat): 날짜 계산 로직 개선"
```

---

## 🧪 테스트 작성 가이드

### 테스트 파일 구조

```typescript
describe('generateRecurringEvents', () => {
  // 테스트 환경 설정
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-01'));
  });

  describe('매일 반복', () => {
    it('지정된 날짜까지 매일 일정 생성');
    it('종료일이 없으면 2025-12-31까지 생성');
  });

  describe('매주 반복', () => {
    it('같은 요일에 주 단위로 일정 생성');
  });

  describe('매월 반복', () => {
    it('일반적인 날짜(1-28일)는 모든 달에 생성');
    it('31일 반복은 31일이 있는 달에만 생성');
    it('30일 반복은 30일 이상인 달에만 생성');
  });

  describe('매년 반복', () => {
    it('일반적인 날짜는 매년 생성');
    it('윤년 2월 29일은 윤년에만 생성');
  });

  describe('특수 조건', () => {
    it('반복 종료일이 2025-12-31을 초과하면 에러');
    it('반복 종료일이 시작일보다 빠르면 에러');
    it('모든 일정이 동일한 repeat.id를 가짐');
    it('각 일정은 고유한 id를 가짐');
  });
});
```

### 테스트 데이터 준비 패턴

```typescript
// ✅ 좋음: 명확한 의도를 가진 테스트 데이터
const createMonthlyRepeatEvent = (day: number, endDate: string): EventForm => ({
  title: '매월 반복 일정',
  date: `2025-01-${String(day).padStart(2, '0')}`,
  startTime: '10:00',
  endTime: '11:00',
  description: '',
  location: '',
  category: '업무',
  repeat: {
    type: 'monthly',
    interval: 1,
    endDate
  },
  notificationTime: 10
});

// 테스트에서 사용
const event = createMonthlyRepeatEvent(31, '2025-06-30');

// ❌ 나쁨: 매직 넘버와 불명확한 데이터
const event = {
  title: '',
  date: '2025-01-31',
  // ...
};
```

---

## 📚 명세 문서 목록

### 필수 읽기 순서

1. **00-tdd-workflow.md** (이 문서)
   - TDD 프로세스 이해

2. **01-repeat-api-spec.md**
   - API 엔드포인트 명세
   - 요청/응답 형식

3. **02-repeat-generation-algorithm.md**
   - 반복 일정 생성 알고리즘
   - 날짜 계산 로직

4. **03-special-cases.md**
   - 31일 매월 반복 특수 케이스
   - 윤년 2월 29일 처리

5. **04-single-all-operations.md**
   - 단일/전체 수정 명세
   - 단일/전체 삭제 명세

---

## 🎯 개발 체크리스트

### 시작 전
- [ ] 모든 명세 문서 읽기
- [ ] design.md 확인
- [ ] 기존 코드 구조 이해 (CLAUDE.md 참조)

### RED 단계
- [ ] 명세의 모든 시나리오 테스트 작성
- [ ] 정상 케이스 테스트
- [ ] 경계 조건 테스트
- [ ] 예외 상황 테스트
- [ ] `pnpm test` → 모두 실패 확인

### GREEN 단계
- [ ] 최소한의 코드로 테스트 통과
- [ ] 명세의 요구사항만 구현
- [ ] 과도한 최적화 하지 않기
- [ ] `pnpm test` → 모두 성공 확인

### REFACTOR 단계
- [ ] 중복 코드 제거
- [ ] 함수 분리 및 추상화
- [ ] JSDoc 주석 추가
- [ ] 매직 넘버 상수화
- [ ] `pnpm test` → 여전히 성공 확인

### 완료
- [ ] 모든 테스트 통과
- [ ] ESLint 통과 (`pnpm lint`)
- [ ] TypeScript 에러 없음
- [ ] 커밋 메시지 작성 (TDD 형식)

---

## 💡 TDD 모범 사례

### DO ✅
- 테스트를 먼저 작성하고 실패 확인
- 작은 단위로 자주 커밋
- 명세를 엄격히 따르기
- Given-When-Then 구조 사용
- 의미 있는 테스트 이름

### DON'T ❌
- 테스트 없이 구현부터 시작
- 한 번에 많은 기능 구현
- 명세를 임의로 해석
- 테스트가 실패하는데 구현 진행
- 리팩토링 후 테스트 생략

---

**TDD로 품질 높은 코드를 만들어봅시다! 🚀**
