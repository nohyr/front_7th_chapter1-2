# 단일/전체 수정 및 삭제 명세

## 개요

반복 일정의 단일 수정/삭제와 전체 수정/삭제에 대한 사용자 인터랙션과 구현 로직을 정의합니다.

---

## 비즈니스 규칙

### 핵심 원칙

1. **사용자 선택권 존중**
   - 반복 일정 수정/삭제 시 항상 선택 다이얼로그 표시
   - "이 일정만" vs "모든 반복 일정" 선택 가능

2. **명확한 시각적 구분**
   - 단일 수정된 일정: 반복 아이콘 사라짐 (`repeat.type = 'none'`)
   - 전체 수정된 일정: 반복 아이콘 유지

3. **일관된 동작**
   - 단일 수정/삭제: 선택한 일정만 영향
   - 전체 수정/삭제: 같은 `repeat.id`의 모든 일정 영향

---

## 사용자 플로우

### 수정 플로우

```
1. 사용자가 반복 일정을 클릭하여 수정 시작
   ↓
2. 반복 일정임을 감지 (repeat.type !== 'none')
   ↓
3. 선택 다이얼로그 표시
   ┌────────────────────────────────────┐
   │  일정 수정                          │
   ├────────────────────────────────────┤
   │  이 일정은 반복 일정입니다.         │
   │  어떻게 수정하시겠습니까?           │
   │                                    │
   │  [이 일정만]  [모든 반복 일정]  [취소] │
   └────────────────────────────────────┘
   ↓
4a. "이 일정만" 선택
    → 해당 일정의 repeat.type = 'none'으로 변경
    → 독립적인 일정이 됨
    → 반복 아이콘 사라짐

4b. "모든 반복 일정" 선택
    → 같은 repeat.id의 모든 일정 수정
    → repeat.type 유지
    → 반복 아이콘 유지
```

### 삭제 플로우

```
1. 사용자가 반복 일정의 삭제 버튼 클릭
   ↓
2. 반복 일정임을 감지 (repeat.type !== 'none')
   ↓
3. 확인 다이얼로그 표시
   ┌────────────────────────────────────┐
   │  일정 삭제                          │
   ├────────────────────────────────────┤
   │  이 일정은 반복 일정입니다.         │
   │  어떻게 삭제하시겠습니까?           │
   │                                    │
   │  [이 일정만]  [모든 반복 일정]  [취소] │
   └────────────────────────────────────┘
   ↓
4a. "이 일정만" 선택
    → 해당 일정만 삭제
    → 다른 반복 일정은 유지

4b. "모든 반복 일정" 선택
    → 같은 repeat.id의 모든 일정 삭제
    → 모든 인스턴스 제거
```

---

## 단일 수정 (Single Edit)

### 비즈니스 가치
"이번 주 회의만 시간 변경", "이번 달 보고만 취소" 같은 예외 상황 처리

### 시나리오

#### SE-001: 단일 일정 수정
```
Given: 매주 월요일 10:00-11:00 반복 일정
       - 2025-10-06 (repeat.id = 'repeat-abc')
       - 2025-10-13 (repeat.id = 'repeat-abc')
       - 2025-10-20 (repeat.id = 'repeat-abc')
       - 2025-10-27 (repeat.id = 'repeat-abc')
When: 2025-10-13 일정을 화요일 14:00-15:00로 수정
      사용자가 "이 일정만" 선택
Then:
      - 2025-10-06 10:00-11:00 (월) ✅ 유지, repeat.type = 'weekly'
      - 2025-10-14 14:00-15:00 (화) ✅ 수정됨, repeat.type = 'none'
      - 2025-10-20 10:00-11:00 (월) ✅ 유지, repeat.type = 'weekly'
      - 2025-10-27 10:00-11:00 (월) ✅ 유지, repeat.type = 'weekly'

      수정된 일정의 변경사항:
      - date: '2025-10-13' → '2025-10-14'
      - startTime: '10:00' → '14:00'
      - endTime: '11:00' → '15:00'
      - repeat.type: 'weekly' → 'none'
      - repeat.id: 제거됨
      - UI: 반복 아이콘 사라짐
```

### 구현 로직

```typescript
async function updateSingleEvent(eventId: string, changes: Partial<Event>) {
  // 1. 해당 일정 조회
  const event = events.find(e => e.id === eventId);

  // 2. 반복에서 분리
  const updatedEvent = {
    ...event,
    ...changes,
    repeat: {
      type: 'none',
      interval: 1
    }
  };

  // 3. 서버에 저장
  await fetch(`/api/events/${eventId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedEvent)
  });

  return updatedEvent;
}
```

### 테스트 케이스

```typescript
describe('단일 수정 (Single Edit)', () => {
  it('선택한 일정만 수정하고 반복에서 분리', async () => {
    // Given: 반복 일정 4개
    const repeatId = 'repeat-abc';
    const events: Event[] = [
      createWeeklyEvent('2025-10-06', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-13', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-20', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-27', '10:00', '11:00', repeatId)
    ];

    // When: 2번째 일정(10-13)을 단일 수정
    const changes = {
      date: '2025-10-14',
      startTime: '14:00',
      endTime: '15:00'
    };

    const result = await updateSingleEvent(events[1].id, changes);

    // Then: 수정된 일정 검증
    expect(result.date).toBe('2025-10-14');
    expect(result.startTime).toBe('14:00');
    expect(result.endTime).toBe('15:00');
    expect(result.repeat.type).toBe('none'); // 반복에서 분리
    expect(result.repeat.id).toBeUndefined(); // repeat.id 제거

    // 다른 일정은 영향 없음
    const otherEvents = events.filter(e => e.id !== events[1].id);
    otherEvents.forEach(event => {
      expect(event.repeat.type).toBe('weekly');
      expect(event.repeat.id).toBe(repeatId);
    });
  });

  it('단일 수정 후 반복 아이콘 사라짐', () => {
    const event = createWeeklyEvent('2025-10-13', '10:00', '11:00', 'repeat-abc');

    // 수정 전: 반복 아이콘 표시
    expect(event.repeat.type).not.toBe('none');

    // 단일 수정 후
    const updatedEvent = {
      ...event,
      repeat: { type: 'none', interval: 1 }
    };

    // 수정 후: 반복 아이콘 없음
    expect(updatedEvent.repeat.type).toBe('none');
  });
});
```

---

## 전체 수정 (All Edit)

### 비즈니스 가치
"모든 주간 회의 시간 변경", "모든 월말 보고를 다른 날짜로 이동" 같은 일괄 수정

### 시나리오

#### AE-001: 전체 일정 수정
```
Given: 매주 월요일 10:00-11:00 반복 일정
       - 2025-10-06 (repeat.id = 'repeat-abc')
       - 2025-10-13 (repeat.id = 'repeat-abc')
       - 2025-10-20 (repeat.id = 'repeat-abc')
       - 2025-10-27 (repeat.id = 'repeat-abc')
When: 시작 시간을 14:00-15:00로 변경
      사용자가 "모든 반복 일정" 선택
Then:
      - 2025-10-06 14:00-15:00 (월) ✅ 수정됨, repeat.type = 'weekly'
      - 2025-10-13 14:00-15:00 (월) ✅ 수정됨, repeat.type = 'weekly'
      - 2025-10-20 14:00-15:00 (월) ✅ 수정됨, repeat.type = 'weekly'
      - 2025-10-27 14:00-15:00 (월) ✅ 수정됨, repeat.type = 'weekly'

      모든 일정의 변경사항:
      - startTime: '10:00' → '14:00'
      - endTime: '11:00' → '15:00'
      - repeat.type: 'weekly' 유지
      - repeat.id: 'repeat-abc' 유지
      - UI: 반복 아이콘 유지
```

### 구현 로직

```typescript
async function updateAllEvents(repeatId: string, changes: Partial<Event>) {
  // 1. 같은 repeat.id의 모든 일정 찾기
  const eventsToUpdate = events.filter(e => e.repeat.id === repeatId);

  // 2. 모든 일정을 병렬로 수정
  const updatePromises = eventsToUpdate.map(event => {
    const updatedEvent = {
      ...event,
      ...changes,
      // repeat 정보는 유지
      repeat: {
        ...event.repeat,
        id: repeatId
      }
    };

    return fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvent)
    });
  });

  await Promise.all(updatePromises);

  return eventsToUpdate.length;
}
```

### 테스트 케이스

```typescript
describe('전체 수정 (All Edit)', () => {
  it('같은 repeat.id의 모든 일정 수정', async () => {
    // Given: 반복 일정 4개
    const repeatId = 'repeat-abc';
    const events: Event[] = [
      createWeeklyEvent('2025-10-06', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-13', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-20', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-27', '10:00', '11:00', repeatId)
    ];

    // When: 전체 시간 변경
    const changes = {
      startTime: '14:00',
      endTime: '15:00'
    };

    const updatedCount = await updateAllEvents(repeatId, changes);

    // Then: 4개 모두 수정됨
    expect(updatedCount).toBe(4);

    // 모든 일정이 새로운 시간으로 변경됨
    const updatedEvents = events.filter(e => e.repeat.id === repeatId);
    updatedEvents.forEach(event => {
      expect(event.startTime).toBe('14:00');
      expect(event.endTime).toBe('15:00');
      expect(event.repeat.type).toBe('weekly'); // 유지
      expect(event.repeat.id).toBe(repeatId); // 유지
    });
  });

  it('전체 수정 후에도 반복 아이콘 유지', () => {
    const events = [
      createWeeklyEvent('2025-10-06', '10:00', '11:00', 'repeat-abc'),
      createWeeklyEvent('2025-10-13', '10:00', '11:00', 'repeat-abc')
    ];

    // 전체 수정 전: 반복 아이콘 표시
    events.forEach(event => {
      expect(event.repeat.type).toBe('weekly');
    });

    // 전체 수정 후에도 반복 유형 유지
    const updatedEvents = events.map(event => ({
      ...event,
      startTime: '14:00',
      repeat: { ...event.repeat } // 유지
    }));

    updatedEvents.forEach(event => {
      expect(event.repeat.type).toBe('weekly');
      expect(event.repeat.id).toBe('repeat-abc');
    });
  });

  it('다른 repeat.id의 일정은 영향 없음', async () => {
    // Given: 두 개의 다른 반복 그룹
    const group1Events = [
      createWeeklyEvent('2025-10-06', '10:00', '11:00', 'repeat-aaa'),
      createWeeklyEvent('2025-10-13', '10:00', '11:00', 'repeat-aaa')
    ];

    const group2Events = [
      createWeeklyEvent('2025-10-07', '14:00', '15:00', 'repeat-bbb'),
      createWeeklyEvent('2025-10-14', '14:00', '15:00', 'repeat-bbb')
    ];

    // When: group1만 수정
    await updateAllEvents('repeat-aaa', { startTime: '11:00', endTime: '12:00' });

    // Then: group1만 변경되고 group2는 유지
    group1Events.forEach(event => {
      expect(event.startTime).toBe('11:00');
    });

    group2Events.forEach(event => {
      expect(event.startTime).toBe('14:00'); // 변경 안 됨
    });
  });
});
```

---

## 단일 삭제 (Single Delete)

### 시나리오

#### SD-001: 단일 일정 삭제
```
Given: 매주 월요일 반복 일정
       - 2025-10-06 (repeat.id = 'repeat-abc')
       - 2025-10-13 (repeat.id = 'repeat-abc')
       - 2025-10-20 (repeat.id = 'repeat-abc')
       - 2025-10-27 (repeat.id = 'repeat-abc')
When: 2025-10-13 일정을 삭제
      사용자가 "이 일정만" 선택
Then:
      - 2025-10-06 ✅ 유지
      - 2025-10-13 ❌ 삭제됨
      - 2025-10-20 ✅ 유지
      - 2025-10-27 ✅ 유지
```

### 구현 로직

```typescript
async function deleteSingleEvent(eventId: string) {
  await fetch(`/api/events/${eventId}`, {
    method: 'DELETE'
  });

  return eventId;
}
```

### 테스트 케이스

```typescript
describe('단일 삭제 (Single Delete)', () => {
  it('선택한 일정만 삭제', async () => {
    // Given: 반복 일정 4개
    const repeatId = 'repeat-abc';
    const events: Event[] = [
      createWeeklyEvent('2025-10-06', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-13', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-20', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-27', '10:00', '11:00', repeatId)
    ];

    const eventToDelete = events[1]; // 2025-10-13

    // When: 2번째 일정만 삭제
    await deleteSingleEvent(eventToDelete.id);

    // Then: 해당 일정만 삭제됨
    const remainingEvents = events.filter(e => e.id !== eventToDelete.id);
    expect(remainingEvents).toHaveLength(3);

    // 나머지 일정은 여전히 반복 그룹에 속함
    remainingEvents.forEach(event => {
      expect(event.repeat.id).toBe(repeatId);
      expect(event.repeat.type).toBe('weekly');
    });
  });
});
```

---

## 전체 삭제 (All Delete)

### 시나리오

#### AD-001: 전체 일정 삭제
```
Given: 매주 월요일 반복 일정
       - 2025-10-06 (repeat.id = 'repeat-abc')
       - 2025-10-13 (repeat.id = 'repeat-abc')
       - 2025-10-20 (repeat.id = 'repeat-abc')
       - 2025-10-27 (repeat.id = 'repeat-abc')
When: 임의의 일정에서 삭제 버튼 클릭
      사용자가 "모든 반복 일정" 선택
Then:
      - 2025-10-06 ❌ 삭제됨
      - 2025-10-13 ❌ 삭제됨
      - 2025-10-20 ❌ 삭제됨
      - 2025-10-27 ❌ 삭제됨

      모든 반복 일정이 제거됨
```

### 구현 로직

```typescript
async function deleteAllEvents(repeatId: string) {
  // 1. 같은 repeat.id의 모든 일정 찾기
  const eventsToDelete = events.filter(e => e.repeat.id === repeatId);

  // 2. 모든 일정을 병렬로 삭제
  const deletePromises = eventsToDelete.map(event =>
    fetch(`/api/events/${event.id}`, { method: 'DELETE' })
  );

  await Promise.all(deletePromises);

  return eventsToDelete.length;
}
```

### 테스트 케이스

```typescript
describe('전체 삭제 (All Delete)', () => {
  it('같은 repeat.id의 모든 일정 삭제', async () => {
    // Given: 반복 일정 4개
    const repeatId = 'repeat-abc';
    const events: Event[] = [
      createWeeklyEvent('2025-10-06', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-13', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-20', '10:00', '11:00', repeatId),
      createWeeklyEvent('2025-10-27', '10:00', '11:00', repeatId)
    ];

    // When: 전체 삭제
    const deletedCount = await deleteAllEvents(repeatId);

    // Then: 4개 모두 삭제됨
    expect(deletedCount).toBe(4);

    // 해당 repeat.id의 일정이 모두 사라짐
    const remainingEvents = events.filter(e => e.repeat.id === repeatId);
    expect(remainingEvents).toHaveLength(0);
  });

  it('다른 repeat.id의 일정은 영향 없음', async () => {
    // Given: 두 개의 다른 반복 그룹
    const group1 = [
      createWeeklyEvent('2025-10-06', '10:00', '11:00', 'repeat-aaa'),
      createWeeklyEvent('2025-10-13', '10:00', '11:00', 'repeat-aaa')
    ];

    const group2 = [
      createWeeklyEvent('2025-10-07', '14:00', '15:00', 'repeat-bbb'),
      createWeeklyEvent('2025-10-14', '14:00', '15:00', 'repeat-bbb')
    ];

    // When: group1만 삭제
    await deleteAllEvents('repeat-aaa');

    // Then: group1은 삭제되고 group2는 유지
    const remainingGroup1 = group1.filter(e => e.repeat.id === 'repeat-aaa');
    expect(remainingGroup1).toHaveLength(0);

    const remainingGroup2 = group2.filter(e => e.repeat.id === 'repeat-bbb');
    expect(remainingGroup2).toHaveLength(2);
  });
});
```

---

## UI 구현

### 수정 다이얼로그

```tsx
<Dialog open={showEditDialog}>
  <DialogTitle>일정 수정</DialogTitle>
  <DialogContent>
    <DialogContentText>
      이 일정은 반복 일정입니다. 어떻게 수정하시겠습니까?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => handleEdit('single')} aria-label="이 일정만 수정">
      이 일정만
    </Button>
    <Button onClick={() => handleEdit('all')} aria-label="모든 반복 일정 수정">
      모든 반복 일정
    </Button>
    <Button onClick={handleCancel} aria-label="수정 취소">
      취소
    </Button>
  </DialogActions>
</Dialog>
```

### 삭제 다이얼로그

```tsx
<Dialog open={showDeleteDialog}>
  <DialogTitle>일정 삭제</DialogTitle>
  <DialogContent>
    <DialogContentText>
      이 일정은 반복 일정입니다. 어떻게 삭제하시겠습니까?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button
      onClick={() => handleDelete('single')}
      color="error"
      aria-label="이 일정만 삭제"
    >
      이 일정만
    </Button>
    <Button
      onClick={() => handleDelete('all')}
      color="error"
      aria-label="모든 반복 일정 삭제"
    >
      모든 반복 일정
    </Button>
    <Button onClick={handleCancel} aria-label="삭제 취소">
      취소
    </Button>
  </DialogActions>
</Dialog>
```

---

## 참조

- **구현 파일**: `src/hooks/useEventOperations.ts`, `App.tsx`
- **테스트 파일**: `src/__tests__/unit/hard.repeatUtils.spec.ts`
- **UI 컴포넌트**: `App.tsx` (다이얼로그)

---

## 구현 체크리스트

### UI
- [ ] 수정 다이얼로그 (이 일정만/모든 반복 일정/취소)
- [ ] 삭제 다이얼로그 (이 일정만/모든 반복 일정/취소)
- [ ] 반복 일정 감지 로직 (`repeat.type !== 'none'`)
- [ ] aria-label 추가 (접근성)

### 로직
- [ ] updateSingleEvent 함수
- [ ] updateAllEvents 함수
- [ ] deleteSingleEvent 함수
- [ ] deleteAllEvents 함수
- [ ] repeat.id 기반 필터링

### 테스트
- [ ] 단일 수정 테스트
- [ ] 전체 수정 테스트
- [ ] 단일 삭제 테스트
- [ ] 전체 삭제 테스트
- [ ] 다른 반복 그룹 영향 없음 테스트

---

**사용자에게 선택권을 주는 것이 좋은 UX의 핵심입니다! 🎯**
