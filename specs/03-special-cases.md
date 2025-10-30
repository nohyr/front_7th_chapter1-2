# 반복 일정 특수 케이스

## 개요

31일 매월 반복, 윤년 2월 29일, 30일 처리 등 특수한 날짜 조건에 대한 명세를 정의합니다.

---

## 비즈니스 규칙

### 핵심 원칙

1. **31일 매월 반복**: 31일이 **있는 달에만** 생성
   - ❌ "매월 마지막 날"로 해석하지 않음
   - ✅ 정확히 31일에만 생성

2. **윤년 2월 29일 매년 반복**: **윤년에만** 생성
   - ❌ "2월 마지막 날"로 해석하지 않음
   - ✅ 정확히 2월 29일에만 생성

3. **30일 매월 반복**: 30일 **이상인 달**에만 생성
   - 2월(28/29일)은 제외
   - 나머지 모든 달에 생성

---

## Case 1: 매월 31일 반복

### 비즈니스 가치
사용자가 "매월 급여일(31일)" 또는 "매월 월말 결산(31일)"같은 일정을 설정할 때, 31일이 없는 달(2월, 4월, 6월, 9월, 11월)에는 일정이 생성되지 않아야 합니다.

### 시나리오

#### SC-31-001: 기본 케이스
```
Given: 매월 31일 반복 일정
       시작일: 2025-01-31
       종료일: 2025-12-31
When: generateRecurringEvents() 호출
Then: 7개 일정 생성 (31일이 있는 달만)
      - 2025-01-31 (1월, 31일)
      - 2025-03-31 (3월, 31일)
      - 2025-05-31 (5월, 31일)
      - 2025-07-31 (7월, 31일)
      - 2025-08-31 (8월, 31일)
      - 2025-10-31 (10월, 31일)
      - 2025-12-31 (12월, 31일)

      생성되지 않는 달:
      - 2월 (28일까지)
      - 4월 (30일까지)
      - 6월 (30일까지)
      - 9월 (30일까지)
      - 11월 (30일까지)
```

#### SC-31-002: 윤년 2월도 제외
```
Given: 매월 31일 반복 일정
       시작일: 2024-01-31 (윤년)
       종료일: 2024-03-31
When: generateRecurringEvents() 호출
Then: 2개 일정 생성
      - 2024-01-31 (1월, 31일)
      - 2024-03-31 (3월, 31일)

      생성되지 않는 달:
      - 2024-02-29 (윤년이지만 29일까지)
```

#### SC-31-003: 부분 기간
```
Given: 매월 31일 반복 일정
       시작일: 2025-01-31
       종료일: 2025-06-30
When: generateRecurringEvents() 호출
Then: 3개 일정 생성
      - 2025-01-31 (1월)
      - 2025-03-31 (3월)
      - 2025-05-31 (5월)

      제외:
      - 2월, 4월, 6월
```

### 구현 로직

```typescript
function shouldCreateMonthly31(year: number, month: number, day: number): boolean {
  // 31일을 요구하는 경우
  if (day === 31) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return daysInMonth === 31; // 정확히 31일이 있는 달만
  }
  return true;
}
```

### 테스트 케이스

```typescript
describe('매월 31일 반복 특수 케이스', () => {
  it('31일이 있는 달에만 일정 생성', () => {
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
        endDate: '2025-12-31'
      },
      notificationTime: 10
    };

    const result = generateRecurringEvents(baseEvent);

    // 7개 생성 (1, 3, 5, 7, 8, 10, 12월)
    expect(result).toHaveLength(7);

    const dates = result.map(e => e.date);
    expect(dates).toEqual([
      '2025-01-31',
      '2025-03-31',
      '2025-05-31',
      '2025-07-31',
      '2025-08-31',
      '2025-10-31',
      '2025-12-31'
    ]);

    // 2, 4, 6, 9, 11월은 포함되지 않음
    expect(dates).not.toContain('2025-02-28');
    expect(dates).not.toContain('2025-04-30');
    expect(dates).not.toContain('2025-06-30');
    expect(dates).not.toContain('2025-09-30');
    expect(dates).not.toContain('2025-11-30');
  });

  it('윤년 2월도 31일이 없으므로 제외', () => {
    const baseEvent: EventForm = {
      title: '월말 보고',
      date: '2024-01-31',
      startTime: '15:00',
      endTime: '16:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-03-31'
      },
      notificationTime: 10
    };

    const result = generateRecurringEvents(baseEvent);

    expect(result).toHaveLength(2);
    expect(result.map(e => e.date)).toEqual([
      '2024-01-31',
      '2024-03-31'
    ]);

    // 윤년 2월(29일)도 제외
    expect(result.map(e => e.date)).not.toContain('2024-02-29');
  });
});
```

---

## Case 2: 매월 30일 반복

### 비즈니스 규칙
30일은 **30일 이상**인 달에 생성됩니다. 2월만 제외하고 모든 달에 생성됩니다.

### 시나리오

#### SC-30-001: 기본 케이스
```
Given: 매월 30일 반복 일정
       시작일: 2025-01-30
       종료일: 2025-12-31
When: generateRecurringEvents() 호출
Then: 11개 일정 생성 (2월 제외)
      - 2025-01-30, 2025-03-30, ..., 2025-12-30

      제외:
      - 2025-02-28 (2월은 28일까지)
```

### 테스트 케이스

```typescript
describe('매월 30일 반복', () => {
  it('2월을 제외한 모든 달에 생성', () => {
    const baseEvent: EventForm = {
      title: '월말 정산',
      date: '2025-01-30',
      startTime: '16:00',
      endTime: '17:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-12-31'
      },
      notificationTime: 10
    };

    const result = generateRecurringEvents(baseEvent);

    // 11개 생성 (2월 제외)
    expect(result).toHaveLength(11);

    const dates = result.map(e => e.date);

    // 2월은 포함되지 않음
    expect(dates).not.toContain('2025-02-28');
    expect(dates).not.toContain('2025-02-30'); // 애초에 없음

    // 나머지 모든 달은 포함
    expect(dates).toContain('2025-01-30');
    expect(dates).toContain('2025-03-30');
    expect(dates).toContain('2025-04-30');
  });

  it('윤년 2월도 29일까지라 30일은 제외', () => {
    const baseEvent: EventForm = {
      title: '월말 정산',
      date: '2024-01-30',
      startTime: '16:00',
      endTime: '17:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2024-03-31'
      },
      notificationTime: 10
    };

    const result = generateRecurringEvents(baseEvent);

    expect(result).toHaveLength(2);
    expect(result.map(e => e.date)).toEqual([
      '2024-01-30',
      '2024-03-30'
    ]);

    // 윤년 2월(29일)도 30일은 없음
    expect(result.map(e => e.date)).not.toContain('2024-02-29');
  });
});
```

---

## Case 3: 윤년 2월 29일 매년 반복

### 비즈니스 가치
사용자가 윤년 생일(2월 29일)이나 기념일을 설정할 때, **윤년에만** 일정이 생성되어야 합니다.

### 윤년 계산 규칙

```
윤년 조건:
1. 4의 배수이고
2. 100의 배수가 아니거나
3. 400의 배수

예시:
- 2024 윤년 (4의 배수, 100의 배수 아님)
- 2028 윤년 (4의 배수, 100의 배수 아님)
- 2000 윤년 (400의 배수)
- 2100 평년 (100의 배수, 400의 배수 아님)
```

### 시나리오

#### SC-LEAP-001: 기본 케이스
```
Given: 매년 2월 29일 반복 일정
       시작일: 2024-02-29
       종료일: 2033-12-31
When: generateRecurringEvents() 호출
Then: 3개 일정 생성 (윤년만)
      - 2024-02-29 (윤년)
      - 2028-02-29 (윤년)
      - 2032-02-29 (윤년)

      제외:
      - 2025, 2026, 2027, 2029, 2030, 2031, 2033 (평년)
```

#### SC-LEAP-002: 2025년 시작 케이스
```
Given: 매년 2월 29일 반복 일정
       시작일: 2025-02-29 (불가능한 날짜)
When: 일정 생성 시도
Then: 에러 또는 다음 윤년부터 시작
```

### 구현 로직

```typescript
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

function shouldCreateYearly229(year: number, month: number, day: number): boolean {
  // 2월 29일을 요구하는 경우
  if (month === 1 && day === 29) {
    return isLeapYear(year); // 윤년만
  }
  return true;
}
```

### 테스트 케이스

```typescript
describe('윤년 2월 29일 매년 반복', () => {
  it('윤년에만 일정 생성', () => {
    const baseEvent: EventForm = {
      title: '윤년 생일',
      date: '2024-02-29',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '개인',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2033-12-31'
      },
      notificationTime: 10
    };

    const result = generateRecurringEvents(baseEvent);

    // 2024, 2028, 2032만 윤년
    expect(result).toHaveLength(3);

    const dates = result.map(e => e.date);
    expect(dates).toEqual([
      '2024-02-29',
      '2028-02-29',
      '2032-02-29'
    ]);

    // 평년은 포함되지 않음
    expect(dates).not.toContain('2025-02-29');
    expect(dates).not.toContain('2026-02-29');
    expect(dates).not.toContain('2027-02-29');
  });

  it('평년(2월 28일)은 모든 해에 생성', () => {
    const baseEvent: EventForm = {
      title: '2월 마지막 전날',
      date: '2025-02-28',
      startTime: '12:00',
      endTime: '13:00',
      description: '',
      location: '',
      category: '개인',
      repeat: {
        type: 'yearly',
        interval: 1,
        endDate: '2028-12-31'
      },
      notificationTime: 10
    };

    const result = generateRecurringEvents(baseEvent);

    // 2025, 2026, 2027, 2028 모두 생성
    expect(result).toHaveLength(4);

    const dates = result.map(e => e.date);
    expect(dates).toEqual([
      '2025-02-28',
      '2026-02-28',
      '2027-02-28',
      '2028-02-28'
    ]);
  });
});

describe('isLeapYear 유틸리티', () => {
  it('4의 배수이고 100의 배수가 아니면 윤년', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2028)).toBe(true);
    expect(isLeapYear(2032)).toBe(true);
  });

  it('100의 배수이지만 400의 배수가 아니면 평년', () => {
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2200)).toBe(false);
  });

  it('400의 배수면 윤년', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2400)).toBe(true);
  });

  it('4의 배수가 아니면 평년', () => {
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(2027)).toBe(false);
  });
});
```

---

## Case 4: 일반 날짜 (1-28일)

### 비즈니스 규칙
1-28일은 **모든 달**에 존재하므로 예외 없이 생성됩니다.

### 테스트 케이스

```typescript
describe('일반 날짜 반복', () => {
  it('1일부터 28일까지는 모든 달에 생성', () => {
    const baseEvent: EventForm = {
      title: '매월 15일 회의',
      date: '2025-01-15',
      startTime: '14:00',
      endTime: '15:00',
      description: '',
      location: '',
      category: '업무',
      repeat: {
        type: 'monthly',
        interval: 1,
        endDate: '2025-12-31'
      },
      notificationTime: 10
    };

    const result = generateRecurringEvents(baseEvent);

    // 12개 모두 생성 (모든 달)
    expect(result).toHaveLength(12);

    const dates = result.map(e => e.date);
    expect(dates).toEqual([
      '2025-01-15',
      '2025-02-15', // 2월도 포함
      '2025-03-15',
      '2025-04-15',
      '2025-05-15',
      '2025-06-15',
      '2025-07-15',
      '2025-08-15',
      '2025-09-15',
      '2025-10-15',
      '2025-11-15',
      '2025-12-15'
    ]);
  });
});
```

---

## 참조 테이블

### 각 월의 일수

| 월 | 평년 | 윤년 | 30일 가능 | 31일 가능 |
|----|------|------|-----------|-----------|
| 1월 | 31 | 31 | ✅ | ✅ |
| 2월 | 28 | 29 | ❌ | ❌ |
| 3월 | 31 | 31 | ✅ | ✅ |
| 4월 | 30 | 30 | ✅ | ❌ |
| 5월 | 31 | 31 | ✅ | ✅ |
| 6월 | 30 | 30 | ✅ | ❌ |
| 7월 | 31 | 31 | ✅ | ✅ |
| 8월 | 31 | 31 | ✅ | ✅ |
| 9월 | 30 | 30 | ✅ | ❌ |
| 10월 | 31 | 31 | ✅ | ✅ |
| 11월 | 30 | 30 | ✅ | ❌ |
| 12월 | 31 | 31 | ✅ | ✅ |

### 윤년 목록 (2020-2040)

| 연도 | 윤년 여부 | 2월 29일 |
|------|-----------|----------|
| 2020 | ✅ | 가능 |
| 2024 | ✅ | 가능 |
| 2028 | ✅ | 가능 |
| 2032 | ✅ | 가능 |
| 2036 | ✅ | 가능 |
| 2040 | ✅ | 가능 |
| 2025-2027 | ❌ | 불가능 |
| 2029-2031 | ❌ | 불가능 |
| 2033-2035 | ❌ | 불가능 |

---

## 엣지 케이스 체크리스트

- [ ] 매월 31일 반복 - 31일이 있는 달만 생성
- [ ] 매월 30일 반복 - 2월 제외 모든 달
- [ ] 매월 29일 반복 - 윤년 2월 포함 모든 달
- [ ] 매월 1-28일 반복 - 모든 달
- [ ] 윤년 2월 29일 매년 반복 - 윤년만
- [ ] 평년 2월 28일 매년 반복 - 모든 해
- [ ] 윤년이지만 매월 반복 시 2월 31일은 제외
- [ ] 종료일이 중간 달일 때 마지막 일정 포함 여부

---

## 참조

- **구현 파일**: `src/utils/repeatUtils.ts`
- **테스트 파일**: `src/__tests__/unit/hard.repeatUtils.spec.ts`
- **참고 자료**: [Leap Year Algorithm](https://en.wikipedia.org/wiki/Leap_year)

---

**날짜 계산의 정확성이 사용자 신뢰의 핵심입니다! 🗓️**
