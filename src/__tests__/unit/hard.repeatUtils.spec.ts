import { describe, it, expect, beforeEach, vi } from 'vitest';

import { EventForm } from '../../types';
import { generateRecurringEvents, isLeapYear } from '../../utils/repeatUtils';

/**
 * 반복 일정 생성 알고리즘 테스트
 *
 * 명세서: specs/02-repeat-generation-algorithm.md
 *         specs/03-special-cases.md
 */

describe('generateRecurringEvents', () => {
  beforeEach(() => {
    // 테스트 환경 시간 고정
    vi.setSystemTime(new Date('2025-10-01'));
  });

  describe('기본 동작', () => {
    it('repeat.type이 "none"이면 단일 일정만 반환', () => {
      // Given: 반복 없는 일정
      const baseEvent: EventForm = {
        title: '단일 회의',
        date: '2025-10-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: 10,
      };

      // When: generateRecurringEvents 호출
      const result = generateRecurringEvents(baseEvent);

      // Then: 1개의 일정만 반환
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-10-15');
      expect(result[0].repeat.type).toBe('none');
    });

    it('모든 일정이 동일한 repeat.id를 가짐', () => {
      // Given: 매주 반복 일정
      const baseEvent: EventForm = {
        title: '주간 회의',
        date: '2025-10-06',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-27',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 모든 일정이 같은 repeat.id를 가짐
      expect(result.length).toBeGreaterThan(1);

      const repeatIds = result.map((e) => e.repeat.id);
      const uniqueRepeatIds = new Set(repeatIds);

      expect(uniqueRepeatIds.size).toBe(1); // 모두 동일한 repeat.id
      expect(repeatIds[0]).toBeDefined();
      expect(repeatIds[0]).not.toBe('');
    });

    it('각 일정은 고유한 id를 가짐', () => {
      // Given: 매주 반복 일정
      const baseEvent: EventForm = {
        title: '주간 회의',
        date: '2025-10-06',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-10-27',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 각 일정이 고유한 id를 가짐
      const eventIds = result.map((e) => e.id);
      const uniqueEventIds = new Set(eventIds);

      expect(uniqueEventIds.size).toBe(result.length);
    });

    it('종료일이 없으면 2025-12-31을 기본값으로 사용', () => {
      // Given: 종료일이 없는 매일 반복 일정
      const baseEvent: EventForm = {
        title: '매일 운동',
        date: '2025-12-28',
        startTime: '06:00',
        endTime: '07:00',
        description: '',
        location: '',
        category: '개인',
        repeat: {
          type: 'daily',
          interval: 1,
          // endDate 없음
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 2025-12-31까지 생성
      expect(result.length).toBeGreaterThan(0);

      const lastDate = result[result.length - 1].date;
      expect(lastDate).toBe('2025-12-31');
    });
  });

  describe('매일 반복 (daily)', () => {
    it('시작일부터 종료일까지 매일 일정 생성', () => {
      // Given: 2025-10-01부터 2025-10-07까지 매일 반복
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
          endDate: '2025-10-07',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 7개 일정 생성
      expect(result).toHaveLength(7);

      const dates = result.map((e) => e.date);
      expect(dates).toEqual([
        '2025-10-01',
        '2025-10-02',
        '2025-10-03',
        '2025-10-04',
        '2025-10-05',
        '2025-10-06',
        '2025-10-07',
      ]);
    });

    it('시작일과 종료일이 같으면 1개만 반환', () => {
      // Given: 시작일 = 종료일
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
          endDate: '2025-10-01',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 1개만 반환
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-10-01');
    });
  });

  describe('매주 반복 (weekly)', () => {
    it('같은 요일에 주 단위로 일정 생성', () => {
      // Given: 매주 월요일 반복 (2025-10-06 ~ 2025-10-27)
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
          endDate: '2025-10-27',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 4개 일정 생성 (매주 월요일)
      expect(result).toHaveLength(4);

      const dates = result.map((e) => e.date);
      expect(dates).toEqual([
        '2025-10-06', // 월요일
        '2025-10-13', // 월요일
        '2025-10-20', // 월요일
        '2025-10-27', // 월요일
      ]);
    });

    it('종료일이 정확히 주 단위가 아니면 마지막 주는 제외', () => {
      // Given: 종료일이 2025-10-25 (월요일 전)
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
          endDate: '2025-10-25', // 토요일 (월요일 전)
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 3개만 생성 (10-27은 종료일 초과)
      expect(result).toHaveLength(3);

      const dates = result.map((e) => e.date);
      expect(dates).toEqual([
        '2025-10-06',
        '2025-10-13',
        '2025-10-20',
        // 2025-10-27은 제외 (종료일 초과)
      ]);
    });
  });

  describe('매월 반복 (monthly)', () => {
    it('일반 날짜(1-28일)는 모든 달에 생성', () => {
      // Given: 매월 15일 반복
      const baseEvent: EventForm = {
        title: '월간 보고',
        date: '2025-01-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-06-30',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 6개 모두 생성 (1-6월)
      expect(result).toHaveLength(6);

      const dates = result.map((e) => e.date);
      expect(dates).toEqual([
        '2025-01-15',
        '2025-02-15', // 2월도 포함
        '2025-03-15',
        '2025-04-15',
        '2025-05-15',
        '2025-06-15',
      ]);
    });

    it('31일 반복은 31일이 있는 달에만 생성', () => {
      // Given: 매월 31일 반복
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
          endDate: '2025-12-31',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 7개 생성 (31일이 있는 달만)
      expect(result).toHaveLength(7);

      const dates = result.map((e) => e.date);
      expect(dates).toEqual([
        '2025-01-31', // 1월 (31일)
        '2025-03-31', // 3월 (31일)
        '2025-05-31', // 5월 (31일)
        '2025-07-31', // 7월 (31일)
        '2025-08-31', // 8월 (31일)
        '2025-10-31', // 10월 (31일)
        '2025-12-31', // 12월 (31일)
        // 2월, 4월, 6월, 9월, 11월은 제외
      ]);

      // 2월, 4월, 6월, 9월, 11월이 포함되지 않았는지 확인
      expect(dates).not.toContain('2025-02-28');
      expect(dates).not.toContain('2025-04-30');
      expect(dates).not.toContain('2025-06-30');
      expect(dates).not.toContain('2025-09-30');
      expect(dates).not.toContain('2025-11-30');
    });

    it('윤년 2월도 31일이 없으므로 제외', () => {
      // Given: 2024년(윤년) 1월 31일부터 3월 31일까지
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
          endDate: '2024-03-31',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 2개만 생성 (1월, 3월)
      expect(result).toHaveLength(2);

      const dates = result.map((e) => e.date);
      expect(dates).toEqual(['2024-01-31', '2024-03-31']);

      // 윤년 2월(29일)도 31일은 없으므로 제외
      expect(dates).not.toContain('2024-02-29');
    });

    it('30일 반복은 2월을 제외한 모든 달에 생성', () => {
      // Given: 매월 30일 반복
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
          endDate: '2025-12-31',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 11개 생성 (2월 제외)
      expect(result).toHaveLength(11);

      const dates = result.map((e) => e.date);

      // 2월은 포함되지 않음
      expect(dates).not.toContain('2025-02-28');
      expect(dates).not.toContain('2025-02-30'); // 애초에 없음

      // 나머지 달은 모두 포함
      expect(dates).toContain('2025-01-30');
      expect(dates).toContain('2025-03-30');
      expect(dates).toContain('2025-04-30');
      expect(dates).toContain('2025-05-30');
      expect(dates).toContain('2025-06-30');
      expect(dates).toContain('2025-07-30');
      expect(dates).toContain('2025-08-30');
      expect(dates).toContain('2025-09-30');
      expect(dates).toContain('2025-10-30');
      expect(dates).toContain('2025-11-30');
      expect(dates).toContain('2025-12-30');
    });

    it('윤년 2월도 29일까지라 30일은 제외', () => {
      // Given: 2024년(윤년) 매월 30일 반복
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
          endDate: '2024-03-31',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 2개만 생성 (1월, 3월)
      expect(result).toHaveLength(2);

      const dates = result.map((e) => e.date);
      expect(dates).toEqual(['2024-01-30', '2024-03-30']);

      // 윤년 2월(29일)도 30일은 없음
      expect(dates).not.toContain('2024-02-29');
      expect(dates).not.toContain('2024-02-30');
    });
  });

  describe('매년 반복 (yearly)', () => {
    it('일반 날짜는 매년 생성', () => {
      // Given: 매년 3월 15일 반복
      const baseEvent: EventForm = {
        title: '기념일',
        date: '2025-03-15',
        startTime: '12:00',
        endTime: '13:00',
        description: '',
        location: '',
        category: '개인',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2027-12-31',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 3개 생성 (2025, 2026, 2027)
      expect(result).toHaveLength(3);

      const dates = result.map((e) => e.date);
      expect(dates).toEqual(['2025-03-15', '2026-03-15', '2027-03-15']);
    });

    it('윤년 2월 29일은 윤년에만 생성', () => {
      // Given: 윤년 2월 29일 매년 반복
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
          endDate: '2033-12-31',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 3개 생성 (2024, 2028, 2032만 윤년)
      expect(result).toHaveLength(3);

      const dates = result.map((e) => e.date);
      expect(dates).toEqual([
        '2024-02-29', // 윤년
        '2028-02-29', // 윤년
        '2032-02-29', // 윤년
      ]);

      // 평년은 포함되지 않음
      expect(dates).not.toContain('2025-02-29');
      expect(dates).not.toContain('2026-02-29');
      expect(dates).not.toContain('2027-02-29');
      expect(dates).not.toContain('2029-02-29');
      expect(dates).not.toContain('2030-02-29');
      expect(dates).not.toContain('2031-02-29');
      expect(dates).not.toContain('2033-02-29');
    });

    it('평년 2월 28일은 모든 해에 생성', () => {
      // Given: 2월 28일 매년 반복
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
          endDate: '2028-12-31',
        },
        notificationTime: 10,
      };

      // When
      const result = generateRecurringEvents(baseEvent);

      // Then: 4개 생성 (2025, 2026, 2027, 2028 모두)
      expect(result).toHaveLength(4);

      const dates = result.map((e) => e.date);
      expect(dates).toEqual([
        '2025-02-28',
        '2026-02-28',
        '2027-02-28',
        '2028-02-28', // 윤년이지만 2월 28일은 존재
      ]);
    });
  });

  describe('에러 처리', () => {
    it('종료일이 시작일보다 빠르면 에러', () => {
      // Given: 종료일 < 시작일
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
          endDate: '2025-10-01', // 시작일보다 빠름
        },
        notificationTime: 10,
      };

      // When & Then: 에러 발생
      expect(() => generateRecurringEvents(baseEvent)).toThrow(
        '반복 종료일은 시작일보다 늦어야 합니다'
      );
    });
  });
});

describe('isLeapYear 유틸리티', () => {
  it('4의 배수이고 100의 배수가 아니면 윤년', () => {
    // Given & When & Then
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2028)).toBe(true);
    expect(isLeapYear(2032)).toBe(true);
  });

  it('100의 배수이지만 400의 배수가 아니면 평년', () => {
    // Given & When & Then
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2100)).toBe(false);
    expect(isLeapYear(2200)).toBe(false);
  });

  it('400의 배수면 윤년', () => {
    // Given & When & Then
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2400)).toBe(true);
  });

  it('4의 배수가 아니면 평년', () => {
    // Given & When & Then
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(2026)).toBe(false);
    expect(isLeapYear(2027)).toBe(false);
  });
});
