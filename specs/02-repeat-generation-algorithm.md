# 반복 일정 생성 알고리즘

## 개요

`generateRecurringEvents()` 함수의 구현 명세와 날짜 계산 로직을 정의합니다.

---

## 함수 시그니처

```typescript
/**
 * 반복 일정 인스턴스를 생성합니다.
 *
 * @param baseEvent - 원본 일정 (템플릿)
 * @returns 생성된 반복 일정 배열
 *
 * @throws {Error} 반복 종료일이 2025-12-31을 초과하는 경우
 * @throws {Error} 반복 종료일이 시작일보다 빠른 경우
 */
function generateRecurringEvents(baseEvent: EventForm): Event[]
```

---

## 알고리즘 플로우

### 1. 입력 검증

```typescript
// 단계 1: 반복 유형 확인
if (baseEvent.repeat.type === 'none') {
  return [createSingleEvent(baseEvent)];
}

// 단계 2: 종료일 검증
const endDate = baseEvent.repeat.endDate || '2025-12-31';
const MAX_END_DATE = '2025-12-31';

if (endDate > MAX_END_DATE) {
  throw new Error('반복 종료일은 2025-12-31을 초과할 수 없습니다');
}

if (baseEvent.date > endDate) {
  throw new Error('반복 종료일은 시작일보다 늦어야 합니다');
}
```

### 2. 반복 ID 생성

```typescript
// 모든 반복 일정이 공유할 고유 ID
const repeatId = crypto.randomUUID();
// 또는
const repeatId = `repeat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
```

### 3. 날짜 배열 생성

반복 유형에 따라 날짜 배열 생성:

```typescript
let dates: string[] = [];

switch (baseEvent.repeat.type) {
  case 'daily':
    dates = generateDailyDates(baseEvent.date, endDate);
    break;
  case 'weekly':
    dates = generateWeeklyDates(baseEvent.date, endDate);
    break;
  case 'monthly':
    dates = generateMonthlyDates(baseEvent.date, endDate);
    break;
  case 'yearly':
    dates = generateYearlyDates(baseEvent.date, endDate);
    break;
}
```

### 4. Event 객체 생성

```typescript
const events: Event[] = dates.map(date => ({
  id: crypto.randomUUID(),           // 각 일정 고유 ID
  ...baseEvent,                      // 나머지 필드 복사
  date,                              // 날짜만 변경
  repeat: {
    ...baseEvent.repeat,
    id: repeatId,                    // 반복 그룹 ID
    endDate
  }
}));

return events;
```

---

## 날짜 생성 알고리즘

### generateDailyDates

**시나리오**:
```
Given: startDate = '2025-10-01', endDate = '2025-10-07'
When: generateDailyDates() 호출
Then: ['2025-10-01', '2025-10-02', '2025-10-03', ..., '2025-10-07']
```

**구현**:
```typescript
function generateDailyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(formatDate(current)); // YYYY-MM-DD 형식
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
```

**테스트 케이스**:
```typescript
describe('generateDailyDates', () => {
  it('시작일부터 종료일까지 매일 날짜 생성', () => {
    const result = generateDailyDates('2025-10-01', '2025-10-07');
    expect(result).toHaveLength(7);
    expect(result[0]).toBe('2025-10-01');
    expect(result[6]).toBe('2025-10-07');
  });

  it('시작일과 종료일이 같으면 1개 반환', () => {
    const result = generateDailyDates('2025-10-01', '2025-10-01');
    expect(result).toEqual(['2025-10-01']);
  });
});
```

---

### generateWeeklyDates

**시나리오**:
```
Given: startDate = '2025-10-06' (월요일), endDate = '2025-10-27'
When: generateWeeklyDates() 호출
Then: ['2025-10-06', '2025-10-13', '2025-10-20', '2025-10-27']
      (매주 월요일)
```

**구현**:
```typescript
function generateWeeklyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 7); // 7일 추가
  }

  return dates;
}
```

**테스트 케이스**:
```typescript
describe('generateWeeklyDates', () => {
  it('같은 요일에 주 단위로 날짜 생성', () => {
    const result = generateWeeklyDates('2025-10-06', '2025-10-27');
    expect(result).toEqual([
      '2025-10-06', // 월요일
      '2025-10-13', // 월요일
      '2025-10-20', // 월요일
      '2025-10-27'  // 월요일
    ]);
  });

  it('종료일이 정확히 주 단위가 아니면 마지막 주는 제외', () => {
    const result = generateWeeklyDates('2025-10-06', '2025-10-25');
    expect(result).toEqual([
      '2025-10-06',
      '2025-10-13',
      '2025-10-20'
      // 2025-10-27은 제외 (종료일 초과)
    ]);
  });
});
```

---

### generateMonthlyDates

**시나리오 1: 일반 날짜**
```
Given: startDate = '2025-01-15', endDate = '2025-06-30'
When: generateMonthlyDates() 호출
Then: ['2025-01-15', '2025-02-15', '2025-03-15', '2025-04-15', '2025-05-15', '2025-06-15']
```

**시나리오 2: 31일 (특수 케이스)**
```
Given: startDate = '2025-01-31', endDate = '2025-06-30'
When: generateMonthlyDates() 호출
Then: ['2025-01-31', '2025-03-31', '2025-05-31']
      (2월, 4월, 6월은 31일이 없어서 제외)
```

**구현**:
```typescript
function generateMonthlyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const targetDay = start.getDate(); // 31일 등 목표 날짜

  let year = start.getFullYear();
  let month = start.getMonth();

  while (true) {
    const candidateDate = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 31일 특수 처리: 해당 달에 31일이 있는지 확인
    if (targetDay <= daysInMonth) {
      const eventDate = new Date(year, month, targetDay);

      if (eventDate > end) break;

      dates.push(formatDate(eventDate));
    }

    // 다음 달로 이동
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }

    // 종료 조건: 연도가 종료일을 초과
    if (new Date(year, month, 1) > end) break;
  }

  return dates;
}
```

**테스트 케이스**:
```typescript
describe('generateMonthlyDates', () => {
  it('일반 날짜는 모든 달에 생성', () => {
    const result = generateMonthlyDates('2025-01-15', '2025-06-30');
    expect(result).toEqual([
      '2025-01-15',
      '2025-02-15',
      '2025-03-15',
      '2025-04-15',
      '2025-05-15',
      '2025-06-15'
    ]);
  });

  it('31일은 31일이 있는 달에만 생성', () => {
    const result = generateMonthlyDates('2025-01-31', '2025-06-30');
    expect(result).toEqual([
      '2025-01-31', // 1월: 31일 있음
      '2025-03-31', // 3월: 31일 있음
      '2025-05-31'  // 5월: 31일 있음
      // 2월: 28일까지 → 제외
      // 4월: 30일까지 → 제외
      // 6월: 30일까지 → 제외
    ]);
  });

  it('30일은 30일 이상인 달에만 생성', () => {
    const result = generateMonthlyDates('2025-01-30', '2025-04-30');
    expect(result).toEqual([
      '2025-01-30', // 1월: 31일 있음
      '2025-03-30', // 3월: 31일 있음
      '2025-04-30'  // 4월: 30일 있음
      // 2월: 28일까지 → 제외
    ]);
  });
});
```

---

### generateYearlyDates

**시나리오 1: 일반 날짜**
```
Given: startDate = '2025-03-15', endDate = '2027-12-31'
When: generateYearlyDates() 호출
Then: ['2025-03-15', '2026-03-15', '2027-03-15']
```

**시나리오 2: 윤년 2월 29일 (특수 케이스)**
```
Given: startDate = '2024-02-29', endDate = '2028-12-31'
When: generateYearlyDates() 호출
Then: ['2024-02-29', '2028-02-29']
      (2025, 2026, 2027은 평년이라 제외)
```

**구현**:
```typescript
function generateYearlyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const targetMonth = start.getMonth();
  const targetDay = start.getDate();

  let year = start.getFullYear();

  while (true) {
    // 윤년 2월 29일 특수 처리
    if (targetMonth === 1 && targetDay === 29) {
      if (!isLeapYear(year)) {
        year++;
        continue;
      }
    }

    const eventDate = new Date(year, targetMonth, targetDay);

    if (eventDate > end) break;

    dates.push(formatDate(eventDate));
    year++;
  }

  return dates;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
```

**테스트 케이스**:
```typescript
describe('generateYearlyDates', () => {
  it('일반 날짜는 매년 생성', () => {
    const result = generateYearlyDates('2025-03-15', '2027-12-31');
    expect(result).toEqual([
      '2025-03-15',
      '2026-03-15',
      '2027-03-15'
    ]);
  });

  it('윤년 2월 29일은 윤년에만 생성', () => {
    const result = generateYearlyDates('2024-02-29', '2028-12-31');
    expect(result).toEqual([
      '2024-02-29', // 윤년
      '2028-02-29'  // 윤년
      // 2025, 2026, 2027은 평년 → 제외
    ]);
  });
});

describe('isLeapYear', () => {
  it('4의 배수이고 100의 배수가 아니면 윤년', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2028)).toBe(true);
  });

  it('100의 배수이지만 400의 배수가 아니면 평년', () => {
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
  });

  it('400의 배수면 윤년', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2400)).toBe(true);
  });

  it('4의 배수가 아니면 평년', () => {
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2026)).toBe(false);
  });
});
```

---

## 유틸리티 함수

### formatDate

```typescript
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

### getDaysInMonth

```typescript
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}
```

---

## 전체 테스트 시나리오

### 통합 테스트

```typescript
describe('generateRecurringEvents', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-10-01'));
  });

  describe('매일 반복', () => {
    it('지정된 날짜까지 매일 일정 생성', () => {
      const baseEvent: EventForm = {
        title: '매일 운동',
        date: '2025-10-01',
        startTime: '06:00',
        endTime: '07:00',
        description: '',
        location: '',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-10-07'
        },
        notificationTime: 10
      };

      const result = generateRecurringEvents(baseEvent);

      expect(result).toHaveLength(7);
      expect(result[0].date).toBe('2025-10-01');
      expect(result[6].date).toBe('2025-10-07');

      // 모든 일정이 같은 repeat.id를 가짐
      const repeatIds = result.map(e => e.repeat.id);
      expect(new Set(repeatIds).size).toBe(1);
    });
  });

  describe('매주 반복', () => {
    it('같은 요일에 주 단위로 일정 생성', () => {
      const baseEvent: EventForm = {
        title: '주간 회의',
        date: '2025-10-06', // 월요일
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-27'
        },
        notificationTime: 10
      };

      const result = generateRecurringEvents(baseEvent);

      expect(result).toHaveLength(4);
      const dates = result.map(e => e.date);
      expect(dates).toEqual([
        '2025-10-06',
        '2025-10-13',
        '2025-10-20',
        '2025-10-27'
      ]);
    });
  });

  describe('매월 반복', () => {
    it('31일 반복은 31일이 있는 달에만 생성', () => {
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

      const result = generateRecurringEvents(baseEvent);

      expect(result).toHaveLength(3);
      const dates = result.map(e => e.date);
      expect(dates).toEqual([
        '2025-01-31',
        '2025-03-31',
        '2025-05-31'
      ]);
    });
  });

  describe('매년 반복', () => {
    it('윤년 2월 29일은 윤년에만 생성', () => {
      const baseEvent: EventForm = {
        title: '윤년 기념일',
        date: '2024-02-29',
        startTime: '12:00',
        endTime: '13:00',
        description: '',
        location: '',
        category: '기타',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2028-12-31'
        },
        notificationTime: 10
      };

      const result = generateRecurringEvents(baseEvent);

      expect(result).toHaveLength(2);
      const dates = result.map(e => e.date);
      expect(dates).toEqual([
        '2024-02-29',
        '2028-02-29'
      ]);
    });
  });

  describe('에러 처리', () => {
    it('종료일이 2025-12-31을 초과하면 에러', () => {
      const baseEvent: EventForm = {
        title: '테스트',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2026-01-01' // 초과
        },
        notificationTime: 10
      };

      expect(() => generateRecurringEvents(baseEvent)).toThrow(
        '반복 종료일은 2025-12-31을 초과할 수 없습니다'
      );
    });

    it('종료일이 시작일보다 빠르면 에러', () => {
      const baseEvent: EventForm = {
        title: '테스트',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-10-01' // 시작일보다 빠름
        },
        notificationTime: 10
      };

      expect(() => generateRecurringEvents(baseEvent)).toThrow(
        '반복 종료일은 시작일보다 늦어야 합니다'
      );
    });
  });
});
```

---

## 참조

- **구현 파일**: `src/utils/repeatUtils.ts`
- **테스트 파일**: `src/__tests__/unit/hard.repeatUtils.spec.ts`
- **타입 정의**: `src/types.ts`

---

**정확한 날짜 계산이 반복 일정의 핵심입니다! 📅**
