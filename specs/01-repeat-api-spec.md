# 반복 일정 API 명세서

## 개요

반복 일정 기능을 위한 REST API 엔드포인트와 데이터 형식을 정의합니다.

---

## Base Configuration

### Base URL
- **개발 환경**: `http://localhost:3000`
- **Vite 프록시**: `/api` → `http://localhost:3000`

### 인증
- **현재 버전**: 인증 없음
- 모든 엔드포인트는 공개

### 데이터 형식
- **Request Body**: `application/json`
- **Response Body**: `application/json`
- **날짜 형식**: ISO 8601 (`YYYY-MM-DD`)
- **시간 형식**: 24시간제 (`HH:mm`)

### Character Encoding
- **UTF-8** 사용

---

## 데이터 타입 정의

### RepeatInfo 타입

```typescript
interface RepeatInfo {
  id?: string;              // 반복 그룹 ID (같은 반복 일정끼리 공유)
  type: RepeatType;         // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number;         // 반복 간격 (1 = 매일/매주/매월/매년)
  endDate?: string;         // 종료일 (YYYY-MM-DD, 최대 2025-12-31)
}
```

**필드 설명**:
- `id`: 같은 반복 그룹의 모든 일정이 공유하는 고유 식별자 (UUID 형식)
- `type`: 반복 유형
  - `'none'`: 반복 없음 (일반 일정)
  - `'daily'`: 매일 반복
  - `'weekly'`: 매주 반복 (같은 요일)
  - `'monthly'`: 매월 반복 (같은 날짜)
  - `'yearly'`: 매년 반복 (같은 월, 같은 날짜)
- `interval`: 반복 간격 (현재 버전에서는 항상 `1`)
- `endDate`: 반복 종료일 (옵션, 없으면 `2025-12-31` 기본값)

---

## 엔드포인트 목록

### GET /api/events
전체 일정 목록 조회 (반복 일정 포함)

#### 요청
```http
GET /api/events
```

#### 응답 (200 OK)
```json
{
  "events": [
    {
      "id": "evt-123",
      "title": "주간 팀 회의",
      "date": "2025-10-06",
      "startTime": "14:00",
      "endTime": "15:00",
      "description": "매주 월요일 정기 회의",
      "location": "회의실 A",
      "category": "업무",
      "repeat": {
        "id": "repeat-abc",
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-12-31"
      },
      "notificationTime": 10
    },
    {
      "id": "evt-124",
      "title": "주간 팀 회의",
      "date": "2025-10-13",
      "startTime": "14:00",
      "endTime": "15:00",
      "description": "매주 월요일 정기 회의",
      "location": "회의실 A",
      "category": "업무",
      "repeat": {
        "id": "repeat-abc",    // 같은 repeat.id
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-12-31"
      },
      "notificationTime": 10
    }
  ]
}
```

**특징**:
- 반복 일정은 각 날짜별로 개별 Event 객체로 저장됨
- 같은 반복 그룹은 `repeat.id`로 식별 가능

---

### POST /api/events
단일 일정 생성 (반복 없음)

#### 요청
```http
POST /api/events
Content-Type: application/json

{
  "title": "일회성 회의",
  "date": "2025-10-15",
  "startTime": "10:00",
  "endTime": "11:00",
  "description": "",
  "location": "",
  "category": "업무",
  "repeat": {
    "type": "none",
    "interval": 1
  },
  "notificationTime": 10
}
```

#### 응답 (201 Created)
```json
{
  "id": "evt-456",
  "title": "일회성 회의",
  "date": "2025-10-15",
  // ... 요청 데이터 전체
}
```

---

### POST /api/events-list
여러 일정 동시 생성 (반복 일정용)

#### 요청
```http
POST /api/events-list
Content-Type: application/json

{
  "events": [
    {
      "title": "매주 회의",
      "date": "2025-10-06",
      "startTime": "14:00",
      "endTime": "15:00",
      "description": "",
      "location": "",
      "category": "업무",
      "repeat": {
        "id": "repeat-xyz",
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-10-27"
      },
      "notificationTime": 10
    },
    {
      "title": "매주 회의",
      "date": "2025-10-13",
      "startTime": "14:00",
      "endTime": "15:00",
      // ... 동일한 repeat.id
      "repeat": {
        "id": "repeat-xyz",
        "type": "weekly",
        "interval": 1,
        "endDate": "2025-10-27"
      },
      // ...
    }
    // ... 추가 일정들
  ]
}
```

#### 응답 (201 Created)
```json
{
  "events": [
    {
      "id": "evt-101",
      "title": "매주 회의",
      "date": "2025-10-06",
      // ... 생성된 전체 데이터
    },
    {
      "id": "evt-102",
      "title": "매주 회의",
      "date": "2025-10-13",
      // ...
    }
  ]
}
```

**사용 시나리오**:
- 프론트엔드에서 `generateRecurringEvents()` 함수로 모든 반복 일정 생성
- 생성된 배열을 이 엔드포인트로 한 번에 전송
- 서버는 각 일정에 고유 `id` 할당

---

### PUT /api/events/:id
단일 일정 수정

#### 요청 (단일 수정)
```http
PUT /api/events/evt-123
Content-Type: application/json

{
  "id": "evt-123",
  "title": "수정된 회의",
  "date": "2025-10-07",      // 날짜 변경됨
  "startTime": "15:00",
  "endTime": "16:00",
  "description": "",
  "location": "",
  "category": "업무",
  "repeat": {
    "type": "none",          // 반복에서 분리됨
    "interval": 1
  },
  "notificationTime": 10
}
```

#### 응답 (200 OK)
```json
{
  "id": "evt-123",
  "title": "수정된 회의",
  // ... 수정된 전체 데이터
}
```

**특징**:
- 단일 수정 시 `repeat.type = 'none'`으로 변경
- 해당 일정은 반복 그룹에서 독립됨
- 다른 반복 일정은 영향 없음

---

### PUT /api/recurring-events/:repeatId
반복 일정 시리즈 전체 수정

#### 요청
```http
PUT /api/recurring-events/repeat-abc
Content-Type: application/json

{
  "title": "새로운 제목",
  "startTime": "15:00",
  "endTime": "16:00",
  // ... 변경할 필드들
}
```

#### 응답 (200 OK)
```json
{
  "updated": 12,           // 수정된 일정 개수
  "events": [
    // ... 수정된 Event 배열
  ]
}
```

**프론트엔드 구현**:
```typescript
// 같은 repeat.id를 가진 모든 일정 찾기
const eventsToUpdate = events.filter(e => e.repeat.id === repeatId);

// 각 일정을 개별적으로 수정
await Promise.all(
  eventsToUpdate.map(event =>
    fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...event, ...changes })
    })
  )
);
```

---

### DELETE /api/events/:id
단일 일정 삭제

#### 요청
```http
DELETE /api/events/evt-123
```

#### 응답
```http
204 No Content
```

**특징**:
- 선택한 일정만 삭제
- 같은 반복 그룹의 다른 일정은 유지

---

### DELETE /api/recurring-events/:repeatId
반복 일정 시리즈 전체 삭제

#### 요청
```http
DELETE /api/recurring-events/repeat-abc
```

#### 응답 (200 OK)
```json
{
  "deleted": 12            // 삭제된 일정 개수
}
```

**프론트엔드 구현**:
```typescript
// 같은 repeat.id를 가진 모든 일정 찾기
const eventsToDelete = events.filter(e => e.repeat.id === repeatId);

// 각 일정을 개별적으로 삭제
await Promise.all(
  eventsToDelete.map(event =>
    fetch(`/api/events/${event.id}`, { method: 'DELETE' })
  )
);
```

---

## 에러 응답

### 에러 형식
```json
{
  "error": "에러 메시지"
}
```

### 상태 코드

| 코드 | 설명 | 예시 |
|------|------|------|
| 200 | 성공 (조회, 수정) | - |
| 201 | 생성 성공 | POST 요청 |
| 204 | 성공 (응답 본문 없음) | DELETE 요청 |
| 400 | 잘못된 요청 | 필수 필드 누락, 날짜 형식 오류 |
| 404 | 리소스 없음 | 존재하지 않는 일정 ID |
| 500 | 서버 오류 | DB 오류, 파일 시스템 오류 |

### 에러 예시

#### 400 Bad Request
```json
{
  "error": "반복 종료일은 2025-12-31을 초과할 수 없습니다"
}
```

#### 404 Not Found
```json
{
  "error": "일정을 찾을 수 없습니다"
}
```

---

## 데이터 저장소

### JSON 파일 구조

**개발 환경**: `src/__mocks__/response/realEvents.json`
```json
{
  "events": [
    { /* Event 1 */ },
    { /* Event 2 */ }
  ]
}
```

**테스트 환경**: `src/__mocks__/response/events.json`
- MSW 핸들러가 이 파일을 사용
- 테스트 중 실제 서버 호출 없이 모킹됨

---

## 참조

- **서버 구현**: `server.js`
- **클라이언트 사용**: `src/hooks/useEventOperations.ts`
- **타입 정의**: `src/types.ts`
- **MSW 핸들러**: `src/__mocks__/handlers.ts`

---

## 구현 체크리스트

### 프론트엔드
- [ ] `generateRecurringEvents()` 함수 구현
- [ ] `POST /api/events-list` 호출 로직
- [ ] 단일/전체 수정 다이얼로그 UI
- [ ] 단일/전체 삭제 다이얼로그 UI
- [ ] `repeat.id` 기반 필터링 로직

### 백엔드 (이미 구현됨)
- [x] `POST /api/events-list` 엔드포인트
- [x] JSON 파일 저장 로직
- [x] 에러 처리

### 테스트
- [ ] API 호출 테스트 (MSW 사용)
- [ ] 단일/전체 수정 통합 테스트
- [ ] 단일/전체 삭제 통합 테스트

---

**API 명세를 바탕으로 일관된 인터페이스를 구현하세요! 🔌**
