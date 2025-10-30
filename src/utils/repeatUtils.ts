import { Event, EventForm } from '../types';

// 상수 정의
const DAYS_PER_WEEK = 7;
const DEFAULT_END_DATE = '2025-12-31';

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷팅합니다.
 *
 * @param date - Date 객체
 * @returns YYYY-MM-DD 형식의 문자열
 *
 * @example
 * formatDate(new Date('2025-01-15')) // '2025-01-15'
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 특정 연도가 윤년인지 확인합니다.
 * 윤년 조건: 4의 배수이면서 100의 배수가 아니거나, 400의 배수인 경우
 *
 * @param year - 확인할 연도
 * @returns 윤년이면 true, 아니면 false
 *
 * @example
 * isLeapYear(2024) // true (4의 배수, 100의 배수 아님)
 * isLeapYear(2000) // true (400의 배수)
 * isLeapYear(1900) // false (100의 배수, 400의 배수 아님)
 * isLeapYear(2025) // false (4의 배수 아님)
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 특정 연도와 월의 일수를 반환합니다.
 *
 * @param year - 연도
 * @param month - 월 (1-12)
 * @returns 해당 월의 일수
 *
 * @example
 * getDaysInMonth(2024, 2) // 29 (윤년 2월)
 * getDaysInMonth(2025, 2) // 28 (평년 2월)
 * getDaysInMonth(2025, 4) // 30 (4월)
 * getDaysInMonth(2025, 1) // 31 (1월)
 */
function getDaysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

/**
 * 매일 반복 날짜를 생성합니다.
 *
 * @param startDate - 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns 날짜 배열 (YYYY-MM-DD 형식)
 *
 * @example
 * generateDailyDates('2025-10-01', '2025-10-03')
 * // ['2025-10-01', '2025-10-02', '2025-10-03']
 */
function generateDailyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * 매주 반복 날짜를 생성합니다.
 *
 * @param startDate - 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns 날짜 배열 (YYYY-MM-DD 형식)
 *
 * @example
 * generateWeeklyDates('2025-10-06', '2025-10-27')
 * // ['2025-10-06', '2025-10-13', '2025-10-20', '2025-10-27']
 */
function generateWeeklyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const current = new Date(start);
  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + DAYS_PER_WEEK);
  }

  return dates;
}

/**
 * 매월 반복 날짜를 생성합니다.
 * 특수 케이스: 31일은 31일이 있는 달에만, 30일은 30일 이상인 달에만 생성
 *
 * @param startDate - 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns 날짜 배열 (YYYY-MM-DD 형식)
 *
 * @example
 * // 31일 반복: 31일이 있는 달에만 생성
 * generateMonthlyDates('2025-01-31', '2025-06-30')
 * // ['2025-01-31', '2025-03-31', '2025-05-31']
 * // 2월, 4월, 6월은 31일이 없어 제외
 *
 * @example
 * // 일반 날짜(1-28일): 모든 달에 생성
 * generateMonthlyDates('2025-01-15', '2025-03-31')
 * // ['2025-01-15', '2025-02-15', '2025-03-15']
 */
function generateMonthlyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startDay = start.getDate();

  let currentYear = start.getFullYear();
  let currentMonth = start.getMonth() + 1;

  while (true) {
    const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);

    // 해당 월에 startDay가 존재하는 경우만 추가
    if (startDay <= daysInCurrentMonth) {
      const currentDate = new Date(currentYear, currentMonth - 1, startDay);

      if (currentDate > end) {
        break;
      }

      dates.push(formatDate(currentDate));
    }

    // 다음 달로 이동
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }

    // 종료일을 넘어선 경우 종료
    const nextDate = new Date(currentYear, currentMonth - 1, 1);
    if (nextDate > end) {
      break;
    }
  }

  return dates;
}

/**
 * 매년 반복 날짜를 생성합니다.
 * 특수 케이스: 2월 29일은 윤년에만 생성
 *
 * @param startDate - 시작 날짜 (YYYY-MM-DD)
 * @param endDate - 종료 날짜 (YYYY-MM-DD)
 * @returns 날짜 배열 (YYYY-MM-DD 형식)
 *
 * @example
 * // 일반 날짜: 매년 생성
 * generateYearlyDates('2025-03-15', '2027-12-31')
 * // ['2025-03-15', '2026-03-15', '2027-03-15']
 *
 * @example
 * // 2월 29일: 윤년에만 생성
 * generateYearlyDates('2024-02-29', '2028-12-31')
 * // ['2024-02-29', '2028-02-29']
 * // 2025, 2026, 2027은 평년이라 제외
 */
function generateYearlyDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startMonth = start.getMonth() + 1;
  const startDay = start.getDate();

  let currentYear = start.getFullYear();

  while (true) {
    // 2월 29일의 경우 윤년만 생성
    if (startMonth === 2 && startDay === 29) {
      if (isLeapYear(currentYear)) {
        const currentDate = new Date(currentYear, 1, 29);
        if (currentDate > end) {
          break;
        }
        dates.push(formatDate(currentDate));
      }
    } else {
      const currentDate = new Date(currentYear, startMonth - 1, startDay);
      if (currentDate > end) {
        break;
      }
      dates.push(formatDate(currentDate));
    }

    currentYear++;
  }

  return dates;
}

/**
 * 반복 일정 인스턴스를 생성합니다.
 *
 * @param baseEvent - 원본 일정 (템플릿)
 * @returns 생성된 반복 일정 배열
 * @throws 종료일이 시작일보다 이전인 경우 에러
 *
 * @example
 * const events = generateRecurringEvents({
 *   title: '주간 회의',
 *   date: '2025-01-01',
 *   repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' }
 * });
 */
export function generateRecurringEvents(baseEvent: EventForm): Event[] {
  const { repeat, date: startDate } = baseEvent;

  // repeat.type이 'none'이면 단일 일정만 반환
  if (repeat.type === 'none') {
    return [
      {
        ...baseEvent,
        id: crypto.randomUUID(),
        repeat: { ...repeat },
      } as Event,
    ];
  }

  // endDate 기본값 설정
  const endDate = repeat.endDate || DEFAULT_END_DATE;

  // 유효성 검증: 종료일이 시작일보다 이전인지 확인
  if (endDate < startDate) {
    throw new Error('반복 종료일은 시작일보다 늦어야 합니다');
  }

  // repeat.id 생성 (모든 반복 일정이 공유)
  const repeatId = crypto.randomUUID();

  // 반복 유형에 따라 날짜 생성
  let dates: string[] = [];

  switch (repeat.type) {
    case 'daily':
      dates = generateDailyDates(startDate, endDate);
      break;
    case 'weekly':
      dates = generateWeeklyDates(startDate, endDate);
      break;
    case 'monthly':
      dates = generateMonthlyDates(startDate, endDate);
      break;
    case 'yearly':
      dates = generateYearlyDates(startDate, endDate);
      break;
    default:
      dates = [startDate];
  }

  // 각 날짜에 대해 Event 객체 생성
  return dates.map((date) => ({
    ...baseEvent,
    id: crypto.randomUUID(),
    date,
    repeat: {
      ...repeat,
      id: repeatId,
    },
  })) as Event[];
}
