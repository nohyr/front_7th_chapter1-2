# 반복 일정 기능 설계 문서

## 🎯 기능 개요

캘린더 앱에 반복 일정 기능을 추가하여, 사용자가 매일/매주/매월/매년 반복되는 일정을 생성하고 관리할 수 있도록 합니다.

## 📋 요구사항 분석

### 1. 반복 유형 지원
- **매일 반복** (daily): 매일 같은 시간에 반복
- **매주 반복** (weekly): 매주 같은 요일, 같은 시간에 반복
- **매월 반복** (monthly): 매월 같은 날짜, 같은 시간에 반복
- **매년 반복** (yearly): 매년 같은 월, 같은 날짜, 같은 시간에 반복

### 2. 반복 종료일
- 반복 종료일은 **최대 2025-12-31**까지만 설정 가능
- 반복 종료일이 설정되지 않으면 2025-12-31을 기본값으로 사용
- 반복 종료일은 반복 시작일보다 이후 날짜여야 함

### 3. 특수 조건 처리

#### 3.1 매월 31일 반복
```
시나리오: 1월 31일에 매월 반복 일정 생성
결과:
  ✅ 1월 31일 - 생성됨
  ✅ 3월 31일 - 생성됨
  ❌ 2월 31일 - 생성 안 됨 (2월은 28/29일까지)
  ❌ 4월 31일 - 생성 안 됨 (4월은 30일까지)
  ✅ 5월 31일 - 생성됨
  ❌ 6월 31일 - 생성 안 됨 (6월은 30일까지)
  ...
```
**규칙**: 31일이 없는 달(2월, 4월, 6월, 9월, 11월)에는 일정을 생성하지 않음

#### 3.2 윤년 2월 29일 반복
```
시나리오: 2024년 2월 29일에 매년 반복 일정 생성
결과:
  ✅ 2024년 2월 29일 - 생성됨 (윤년)
  ❌ 2025년 2월 29일 - 생성 안 됨 (평년)
```
**규칙**: 윤년이 아닌 해에는 2월 29일 일정을 생성하지 않음

### 4. 반복 일정 아이콘 표시
- 캘린더에서 반복 일정은 일반 일정과 시각적으로 구분되어야 함
- 반복 아이콘(🔄) 또는 Material UI의 `<Repeat>` 아이콘 표시
- 반복 유형(daily/weekly/monthly/yearly)을 툴팁으로 표시

### 5. 단일 수정 vs 전체 수정
사용자가 반복 일정을 수정할 때 선택 가능:

#### 5.1 단일 수정 (Single Edit)
- **선택한 일정만** 수정
- 원본 반복 일정은 그대로 유지
- 수정된 일정은 반복 그룹에서 **분리**됨 (독립적인 일정이 됨)
- 예: 매주 월요일 회의를 이번 주만 화요일로 변경

#### 5.2 전체 수정 (All Edit)
- **모든 반복 일정** 수정 (과거 + 미래)
- 같은 `repeat.id`를 가진 모든 일정 수정
- 예: 매주 월요일 회의를 앞으로 모두 화요일로 변경

### 6. 단일 삭제 vs 전체 삭제
사용자가 반복 일정을 삭제할 때 선택 가능:

#### 6.1 단일 삭제 (Single Delete)
- **선택한 일정만** 삭제
- 나머지 반복 일정은 유지
- 예: 이번 주 회의만 취소

#### 6.2 전체 삭제 (All Delete)
- **모든 반복 일정** 삭제
- 같은 `repeat.id`를 가진 모든 일정 삭제
- 예: 매주 회의를 완전히 취소

## 🏗️ 아키텍처 설계

### 데이터 구조

#### Event 타입 (이미 정의됨)
```typescript
interface Event {
  id: string;                    // 개별 일정 고유 ID
  title: string;
  date: string;                  // YYYY-MM-DD
  startTime: string;             // HH:MM
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number;
}

interface RepeatInfo {
  id?: string;                   // 반복 그룹 ID (새로 추가)
  type: RepeatType;              // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number;              // 간격 (1 = 매일/매주/매월/매년)
  endDate?: string;              // 종료일 (YYYY-MM-DD, 최대 2025-12-31)
}
```

**주요 변경사항**:
- `RepeatInfo`에 `id` 필드 추가 (반복 그룹 식별용)
- 같은 반복 그룹의 모든 일정은 동일한 `repeat.id`를 가짐
- 단일 수정 시 `repeat.type = 'none'`으로 변경하여 반복 그룹에서 분리

### 구현 파일 구조

```
src/
├── utils/
│   ├── repeatUtils.ts           # 🆕 반복 일정 생성 로직
│   └── dateUtils.ts             # 기존 날짜 유틸리티 확장
├── hooks/
│   ├── useEventForm.ts          # 반복 UI 상태 관리 (이미 구현됨)
│   └── useEventOperations.ts   # 수정: 반복 일정 CRUD 로직 추가
├── App.tsx                      # UI: 반복 폼 활성화 (주석 해제)
└── __tests__/
    └── unit/
        └── hard.repeatUtils.spec.ts  # 🆕 반복 로직 테스트
```

## 📝 작업 범위

### ✅ 포함 항목

1. **UI 활성화**
   - App.tsx에서 주석 처리된 반복 UI 활성화 (441-478줄)
   - 반복 유형 선택 (매일/매주/매월/매년)
   - 반복 종료일 선택 (DatePicker, max: 2025-12-31)

2. **반복 일정 생성 로직**
   - `repeatUtils.ts` 파일 생성
   - `generateRecurringEvents()` 함수 구현
   - 31일 매월 반복 특수 처리
   - 윤년 2월 29일 특수 처리

3. **반복 일정 표시**
   - 캘린더에 반복 아이콘 표시
   - 반복 유형 툴팁 표시

4. **단일/전체 수정**
   - 수정 다이얼로그에 "이 일정만" / "모든 반복 일정" 선택 추가
   - 단일 수정: 일정을 반복 그룹에서 분리
   - 전체 수정: 같은 `repeat.id`의 모든 일정 수정

5. **단일/전체 삭제**
   - 삭제 확인 다이얼로그에 "이 일정만" / "모든 반복 일정" 선택 추가
   - 단일 삭제: 선택한 일정만 삭제
   - 전체 삭제: 같은 `repeat.id`의 모든 일정 삭제

6. **테스트 작성**
   - 반복 일정 생성 테스트
   - 31일 매월 반복 테스트
   - 윤년 2월 29일 테스트
   - 단일/전체 수정 테스트
   - 단일/전체 삭제 테스트

### ❌ 제외 항목

1. **컴포넌트 분리 금지** - App.tsx 단일 컴포넌트 유지
2. **백엔드 API 변경 최소화** - 기존 `/api/events` 엔드포인트 사용
3. **과거 일정 수정 금지** - 오늘 이전 일정은 수정/삭제 불가
4. **복잡한 반복 패턴 제외**:
   - 매월 마지막 주 월요일 등의 복잡한 패턴
   - 특정 요일만 제외하는 기능
   - 반복 횟수 제한 기능 (종료일로만 제한)

## 📐 상세 설계

### 1. 반복 일정 생성 로직 (`repeatUtils.ts`)

```typescript
/**
 * 반복 일정 인스턴스를 생성합니다.
 *
 * @param baseEvent - 원본 일정 (템플릿)
 * @returns 생성된 반복 일정 배열
 */
export function generateRecurringEvents(baseEvent: EventForm): Event[] {
  // 1. repeat.type이 'none'이면 단일 일정만 반환
  // 2. repeat.endDate가 없으면 2025-12-31 기본값 사용
  // 3. repeat.id 생성 (UUID 또는 timestamp)
  // 4. repeat.type에 따라 날짜 배열 생성
  // 5. 각 날짜에 대해 Event 객체 생성
  // 6. 특수 조건 필터링 (31일, 2월 29일)
}

/**
 * 매월 31일 반복 시 해당 월에 31일이 있는지 확인
 */
function hasDay31(year: number, month: number): boolean {
  return getDaysInMonth(year, month) === 31;
}

/**
 * 윤년인지 확인
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
```

### 2. 단일/전체 수정 로직 (`useEventOperations.ts`)

```typescript
interface UpdateOptions {
  updateType: 'single' | 'all';  // 단일 수정 or 전체 수정
}

async function updateEvent(event: Event, options: UpdateOptions) {
  if (options.updateType === 'single') {
    // 단일 수정: repeat.type = 'none'으로 변경하여 분리
    const updatedEvent = {
      ...event,
      repeat: { type: 'none', interval: 1 }
    };
    await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedEvent)
    });
  } else {
    // 전체 수정: 같은 repeat.id의 모든 일정 수정
    const allEvents = await fetchEvents();
    const eventsToUpdate = allEvents.filter(
      e => e.repeat.id === event.repeat.id
    );
    await Promise.all(
      eventsToUpdate.map(e =>
        fetch(`/api/events/${e.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...e, ...event })
        })
      )
    );
  }
}
```

### 3. 단일/전체 삭제 로직 (`useEventOperations.ts`)

```typescript
interface DeleteOptions {
  deleteType: 'single' | 'all';  // 단일 삭제 or 전체 삭제
}

async function deleteEvent(eventId: string, options: DeleteOptions) {
  const event = events.find(e => e.id === eventId);

  if (options.deleteType === 'single') {
    // 단일 삭제
    await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
  } else {
    // 전체 삭제: 같은 repeat.id의 모든 일정 삭제
    const eventsToDelete = events.filter(
      e => e.repeat.id === event.repeat.id
    );
    await Promise.all(
      eventsToDelete.map(e =>
        fetch(`/api/events/${e.id}`, { method: 'DELETE' })
      )
    );
  }
}
```

## 📊 테스트 시나리오

### 1. 반복 일정 생성

#### 시나리오 1-1: 매일 반복
```
입력:
  - date: 2025-10-01
  - repeatType: 'daily'
  - repeatEndDate: 2025-10-07

출력: 7개 일정
  - 2025-10-01
  - 2025-10-02
  - ...
  - 2025-10-07
```

#### 시나리오 1-2: 매주 반복
```
입력:
  - date: 2025-10-01 (수요일)
  - repeatType: 'weekly'
  - repeatEndDate: 2025-10-22

출력: 4개 일정 (매주 수요일)
  - 2025-10-01
  - 2025-10-08
  - 2025-10-15
  - 2025-10-22
```

#### 시나리오 1-3: 매월 반복 (31일)
```
입력:
  - date: 2025-01-31
  - repeatType: 'monthly'
  - repeatEndDate: 2025-06-30

출력: 3개 일정 (31일이 있는 달만)
  - 2025-01-31 ✅ (1월)
  - 2025-03-31 ✅ (3월)
  - 2025-05-31 ✅ (5월)
  - 2025-02-31 ❌ (2월은 28일까지)
  - 2025-04-31 ❌ (4월은 30일까지)
  - 2025-06-31 ❌ (6월은 30일까지)
```

#### 시나리오 1-4: 매년 반복 (윤년 2/29)
```
입력:
  - date: 2024-02-29
  - repeatType: 'yearly'
  - repeatEndDate: 2026-12-31

출력: 1개 일정 (윤년만)
  - 2024-02-29 ✅ (윤년)
  - 2025-02-29 ❌ (평년)
  - 2026-02-29 ❌ (평년)
```

### 2. 반복 일정 수정

#### 시나리오 2-1: 단일 수정
```
준비:
  - 매주 월요일 회의 (10/06, 10/13, 10/20)

동작:
  - 10/13 회의만 화요일(10/14)로 변경
  - updateType: 'single'

결과:
  - 10/06 월요일 회의 ✅ (유지)
  - 10/14 화요일 회의 ✅ (수정됨, repeat.type = 'none')
  - 10/20 월요일 회의 ✅ (유지)
```

#### 시나리오 2-2: 전체 수정
```
준비:
  - 매주 월요일 회의 (10/06, 10/13, 10/20)

동작:
  - 모든 회의를 화요일로 변경
  - updateType: 'all'

결과:
  - 10/07 화요일 회의 ✅ (수정됨)
  - 10/14 화요일 회의 ✅ (수정됨)
  - 10/21 화요일 회의 ✅ (수정됨)
```

### 3. 반복 일정 삭제

#### 시나리오 3-1: 단일 삭제
```
준비:
  - 매주 월요일 회의 (10/06, 10/13, 10/20)

동작:
  - 10/13 회의만 삭제
  - deleteType: 'single'

결과:
  - 10/06 월요일 회의 ✅ (유지)
  - 10/13 월요일 회의 ❌ (삭제됨)
  - 10/20 월요일 회의 ✅ (유지)
```

#### 시나리오 3-2: 전체 삭제
```
준비:
  - 매주 월요일 회의 (10/06, 10/13, 10/20)

동작:
  - 모든 반복 일정 삭제
  - deleteType: 'all'

결과:
  - 10/06 월요일 회의 ❌ (삭제됨)
  - 10/13 월요일 회의 ❌ (삭제됨)
  - 10/20 월요일 회의 ❌ (삭제됨)
```

## ✅ 체크리스트

### UI 구현
- [ ] App.tsx에서 반복 UI 주석 해제
- [ ] 반복 유형 선택 (매일/매주/매월/매년)
- [ ] 반복 종료일 선택 (max: 2025-12-31)
- [ ] 반복 아이콘 표시 (🔄 또는 Material UI `<Repeat>`)
- [ ] 수정 다이얼로그에 "이 일정만" / "모든 반복 일정" 선택 추가
- [ ] 삭제 다이얼로그에 "이 일정만" / "모든 반복 일정" 선택 추가

### 로직 구현
- [ ] `repeatUtils.ts` 파일 생성
- [ ] `generateRecurringEvents()` 함수 구현
- [ ] 31일 매월 반복 특수 처리
- [ ] 윤년 2월 29일 특수 처리
- [ ] `repeat.id` 자동 생성 로직
- [ ] `useEventOperations`에 단일/전체 수정 로직 추가
- [ ] `useEventOperations`에 단일/전체 삭제 로직 추가

### 테스트 작성
- [ ] 매일 반복 테스트
- [ ] 매주 반복 테스트
- [ ] 매월 반복 테스트
- [ ] 매년 반복 테스트
- [ ] 31일 매월 반복 엣지 케이스 테스트
- [ ] 윤년 2월 29일 엣지 케이스 테스트
- [ ] 단일 수정 테스트
- [ ] 전체 수정 테스트
- [ ] 단일 삭제 테스트
- [ ] 전체 삭제 테스트
- [ ] 반복 종료일 검증 테스트 (max: 2025-12-31)

### 검증
- [ ] 모든 테스트 통과
- [ ] ESLint 통과
- [ ] TypeScript 에러 없음
- [ ] 기존 기능 정상 동작 (회귀 테스트)
- [ ] 접근성 검증 (aria-label, role)

## 🎨 UI 참고

### 반복 설정 폼
```tsx
<FormControlLabel
  control={<Checkbox checked={isRepeating} onChange={(e) => setIsRepeating(e.target.checked)} />}
  label="반복 일정"
/>

{isRepeating && (
  <Box sx={{ mt: 2 }}>
    <FormControl fullWidth>
      <FormLabel>반복 유형</FormLabel>
      <Select value={repeatType} onChange={(e) => setRepeatType(e.target.value)}>
        <MenuItem value="daily">매일</MenuItem>
        <MenuItem value="weekly">매주</MenuItem>
        <MenuItem value="monthly">매월</MenuItem>
        <MenuItem value="yearly">매년</MenuItem>
      </Select>
    </FormControl>

    <TextField
      label="반복 종료일"
      type="date"
      value={repeatEndDate}
      onChange={(e) => setRepeatEndDate(e.target.value)}
      inputProps={{ max: '2025-12-31' }}
      fullWidth
      sx={{ mt: 2 }}
    />
  </Box>
)}
```

### 수정/삭제 다이얼로그
```tsx
<Dialog open={showEditDialog}>
  <DialogTitle>일정 수정</DialogTitle>
  <DialogContent>
    <DialogContentText>
      이 일정은 반복 일정입니다. 어떻게 수정하시겠습니까?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => handleUpdate('single')}>이 일정만</Button>
    <Button onClick={() => handleUpdate('all')}>모든 반복 일정</Button>
    <Button onClick={handleCancel}>취소</Button>
  </DialogActions>
</Dialog>
```

## 🚀 다음 단계

설계가 완료되면 **Test Designer Agent**에게 전달하여 TDD RED 단계 시작:

1. 🔴 **RED**: 실패하는 테스트 작성
   - `hard.repeatUtils.spec.ts` 생성
   - 모든 시나리오에 대한 테스트 작성
   - 테스트 실행 → 실패 확인

2. 🟢 **GREEN**: 최소 구현
   - `repeatUtils.ts` 구현
   - `useEventOperations.ts` 수정
   - 테스트 통과

3. ♻️ **REFACTOR**: 코드 개선
   - 중복 제거
   - 가독성 향상
   - 성능 최적화

---

**Feature Architect 설계 완료** ✅

다음: Test Designer Agent로 테스트 코드 작성 시작
