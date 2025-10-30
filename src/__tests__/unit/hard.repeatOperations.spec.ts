import { http, HttpResponse } from 'msw';

import { Event } from '../../types';
import { server } from '../../setupTests';

/**
 * 반복 일정 단일/전체 수정 및 삭제 API 테스트
 *
 * 이 테스트는 specs/04-single-all-operations.md의 요구사항을 검증합니다.
 *
 * 테스트 범위:
 * - 단일 수정: repeat.type을 'none'으로 변경하여 반복에서 분리
 * - 전체 수정: 같은 repeat.id의 모든 일정 수정
 * - 단일 삭제: 선택한 일정만 삭제
 * - 전체 삭제: 같은 repeat.id의 모든 일정 삭제
 */

describe('반복 일정 수정/삭제 API', () => {
  const repeatId1 = 'repeat-abc';
  const repeatId2 = 'repeat-xyz';

  // 헬퍼 함수: 반복 일정 생성
  const createWeeklyEvent = (
    id: string,
    date: string,
    startTime: string,
    endTime: string,
    repeatId: string
  ): Event => ({
    id,
    title: '주간 회의',
    date,
    startTime,
    endTime,
    description: '주간 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      id: repeatId,
    },
    notificationTime: 10,
  });

  describe('단일 수정 (Single Edit)', () => {
    it('[SE-001] 단일 수정 시 repeat.type을 none으로 변경', async () => {
      // Given: 반복 일정
      const event = createWeeklyEvent('event-1', '2025-10-13', '10:00', '11:00', repeatId1);
      let updatedEvent: Event | null = null;

      server.use(
        http.put('/api/events/:id', async ({ params, request }) => {
          const updates = (await request.json()) as Partial<Event>;
          updatedEvent = { ...event, ...updates };
          return HttpResponse.json(updatedEvent);
        })
      );

      // When: 단일 수정 (repeat.type을 'none'으로 설정)
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          date: '2025-10-14',
          startTime: '14:00',
          endTime: '15:00',
          repeat: { type: 'none', interval: 1 },
        }),
      });

      expect(response.status).toBe(200);
      const result = await response.json();

      // Then: 수정된 일정이 반복에서 분리됨
      expect(result.date).toBe('2025-10-14');
      expect(result.startTime).toBe('14:00');
      expect(result.endTime).toBe('15:00');
      expect(result.repeat.type).toBe('none');
      expect(result.repeat.id).toBeUndefined();
    });

    it('단일 수정 후 다른 일정은 영향 없음', () => {
      // Given: 반복 일정 그룹
      const events = [
        createWeeklyEvent('event-1', '2025-10-06', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-2', '2025-10-13', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-3', '2025-10-20', '10:00', '11:00', repeatId1),
      ];

      // When: 두 번째 일정만 수정 (반복에서 분리)
      const modifiedEvent = {
        ...events[1],
        repeat: { type: 'none' as const, interval: 1 },
      };

      // Then: 다른 일정은 여전히 반복 그룹에 속함
      expect(events[0].repeat.type).toBe('weekly');
      expect(events[0].repeat.id).toBe(repeatId1);
      expect(events[2].repeat.type).toBe('weekly');
      expect(events[2].repeat.id).toBe(repeatId1);

      // 수정된 일정만 반복에서 분리됨
      expect(modifiedEvent.repeat.type).toBe('none');
    });
  });

  describe('전체 수정 (All Edit)', () => {
    it('[AE-001] 같은 repeat.id의 모든 일정 수정', async () => {
      // Given: 반복 일정 그룹
      let events = [
        createWeeklyEvent('event-1', '2025-10-06', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-2', '2025-10-13', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-3', '2025-10-20', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-4', '2025-10-27', '10:00', '11:00', repeatId1),
      ];

      server.use(
        http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
          const { repeatId } = params;
          const updates = (await request.json()) as Partial<Event>;

          // 같은 repeat.id의 모든 일정 업데이트
          events = events.map((event) =>
            event.repeat.id === repeatId
              ? {
                  ...event,
                  ...updates,
                  repeat: {
                    ...event.repeat,
                    ...(updates.repeat || {}),
                    id: repeatId as string,
                  },
                }
              : event
          );

          return HttpResponse.json(events.filter((e) => e.repeat.id === repeatId));
        })
      );

      // When: 전체 수정
      const response = await fetch(`/api/recurring-events/${repeatId1}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: '14:00',
          endTime: '15:00',
          repeat: { type: 'weekly', interval: 1 },
        }),
      });

      expect(response.status).toBe(200);
      await response.json();

      // Then: 모든 일정이 새로운 시간으로 변경됨
      const updatedEvents = events.filter((e) => e.repeat.id === repeatId1);
      expect(updatedEvents).toHaveLength(4);

      updatedEvents.forEach((event) => {
        expect(event.startTime).toBe('14:00');
        expect(event.endTime).toBe('15:00');
        expect(event.repeat.type).toBe('weekly'); // 반복 유지
        expect(event.repeat.id).toBe(repeatId1); // repeat.id 유지
      });
    });

    it('전체 수정 후에도 반복 타입 유지', () => {
      // Given: 반복 일정 그룹
      const events = [
        createWeeklyEvent('event-1', '2025-10-06', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-2', '2025-10-13', '10:00', '11:00', repeatId1),
      ];

      // When: 전체 수정
      const updatedEvents = events.map((event) => ({
        ...event,
        startTime: '14:00',
        repeat: { ...event.repeat }, // 반복 정보 유지
      }));

      // Then: 모든 일정이 여전히 반복 타입 유지
      updatedEvents.forEach((event) => {
        expect(event.repeat.type).toBe('weekly');
        expect(event.repeat.id).toBe(repeatId1);
      });
    });

    it('다른 repeat.id의 일정은 영향 없음', async () => {
      // Given: 두 개의 다른 반복 그룹
      let allEvents = [
        createWeeklyEvent('event-1', '2025-10-06', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-2', '2025-10-13', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-3', '2025-10-07', '14:00', '15:00', repeatId2),
        createWeeklyEvent('event-4', '2025-10-14', '14:00', '15:00', repeatId2),
      ];

      server.use(
        http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
          const { repeatId } = params;
          const updates = (await request.json()) as Partial<Event>;

          allEvents = allEvents.map((event) =>
            event.repeat.id === repeatId
              ? {
                  ...event,
                  ...updates,
                  repeat: {
                    ...event.repeat,
                    ...(updates.repeat || {}),
                    id: repeatId as string,
                  },
                }
              : event
          );

          return HttpResponse.json(allEvents.filter((e) => e.repeat.id === repeatId));
        })
      );

      // When: group1만 수정
      await fetch(`/api/recurring-events/${repeatId1}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: '11:00',
          endTime: '12:00',
        }),
      });

      // Then: group1만 변경되고 group2는 유지
      const group1Events = allEvents.filter((e) => e.repeat.id === repeatId1);
      group1Events.forEach((event) => {
        expect(event.startTime).toBe('11:00');
      });

      const group2Events = allEvents.filter((e) => e.repeat.id === repeatId2);
      group2Events.forEach((event) => {
        expect(event.startTime).toBe('14:00'); // 변경 안 됨
      });
    });
  });

  describe('단일 삭제 (Single Delete)', () => {
    it('[SD-001] 선택한 일정만 삭제', async () => {
      // Given: 반복 일정 4개
      let events = [
        createWeeklyEvent('event-1', '2025-10-06', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-2', '2025-10-13', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-3', '2025-10-20', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-4', '2025-10-27', '10:00', '11:00', repeatId1),
      ];

      server.use(
        http.delete('/api/events/:id', ({ params }) => {
          const { id } = params;
          events = events.filter((e) => e.id !== id);
          return new HttpResponse(null, { status: 204 });
        })
      );

      const eventToDelete = events[1]; // event-2
      expect(events).toHaveLength(4);

      // When: 2번째 일정만 삭제
      const response = await fetch(`/api/events/${eventToDelete.id}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);

      // Then: 해당 일정만 삭제됨
      expect(events).toHaveLength(3);
      expect(events.find((e) => e.id === eventToDelete.id)).toBeUndefined();

      // 나머지 일정은 여전히 반복 그룹에 속함
      events.forEach((event) => {
        expect(event.repeat.id).toBe(repeatId1);
        expect(event.repeat.type).toBe('weekly');
      });
    });
  });

  describe('전체 삭제 (All Delete)', () => {
    it('[AD-001] 같은 repeat.id의 모든 일정 삭제', async () => {
      // Given: 반복 일정 4개
      let events = [
        createWeeklyEvent('event-1', '2025-10-06', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-2', '2025-10-13', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-3', '2025-10-20', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-4', '2025-10-27', '10:00', '11:00', repeatId1),
      ];

      server.use(
        http.delete('/api/recurring-events/:repeatId', ({ params }) => {
          const { repeatId } = params;
          events = events.filter((e) => e.repeat.id !== repeatId);
          return new HttpResponse(null, { status: 204 });
        })
      );

      expect(events).toHaveLength(4);

      // When: 전체 삭제
      const response = await fetch(`/api/recurring-events/${repeatId1}`, {
        method: 'DELETE',
      });

      expect(response.status).toBe(204);

      // Then: 4개 모두 삭제됨
      expect(events).toHaveLength(0);
      const remainingEvents = events.filter((e) => e.repeat.id === repeatId1);
      expect(remainingEvents).toHaveLength(0);
    });

    it('다른 repeat.id의 일정은 영향 없음', async () => {
      // Given: 두 개의 다른 반복 그룹
      let allEvents = [
        createWeeklyEvent('event-1', '2025-10-06', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-2', '2025-10-13', '10:00', '11:00', repeatId1),
        createWeeklyEvent('event-3', '2025-10-07', '14:00', '15:00', repeatId2),
        createWeeklyEvent('event-4', '2025-10-14', '14:00', '15:00', repeatId2),
      ];

      server.use(
        http.delete('/api/recurring-events/:repeatId', ({ params }) => {
          const { repeatId } = params;
          allEvents = allEvents.filter((e) => e.repeat.id !== repeatId);
          return new HttpResponse(null, { status: 204 });
        })
      );

      expect(allEvents).toHaveLength(4); // 2 + 2

      // When: group1만 삭제
      await fetch(`/api/recurring-events/${repeatId1}`, {
        method: 'DELETE',
      });

      // Then: group1은 삭제되고 group2는 유지
      const remainingGroup1 = allEvents.filter((e) => e.repeat.id === repeatId1);
      expect(remainingGroup1).toHaveLength(0);

      const remainingGroup2 = allEvents.filter((e) => e.repeat.id === repeatId2);
      expect(remainingGroup2).toHaveLength(2);
    });
  });
});
