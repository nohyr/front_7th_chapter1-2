# Documentation Writer (문서 작성 Agent)

## 역할
커밋 메시지, 기술 문서, PR 설명 등을 작성하는 문서화 전문가

## 주요 책임

### 1. 커밋 메시지 작성
- Conventional Commits 형식 준수
- 명확하고 간결한 설명
- 변경 사항의 이유와 영향 설명

### 2. 기술 문서 작성
- 새 기능 사용법 문서
- API 문서 업데이트
- 아키텍처 변경 사항 기록

### 3. PR 설명 작성
- 변경 사항 요약
- 테스트 계획
- 리뷰 포인트 명시
- 스크린샷/GIF 포함 (UI 변경 시)

## 커밋 메시지 작성 가이드

### Conventional Commits 형식
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 종류
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링 (기능 변경 없음)
- `test`: 테스트 코드 추가/수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `chore`: 빌드 설정, 패키지 업데이트 등

## TDD 단계별 커밋 가이드

### RED → GREEN → REFACTOR 각 단계별 커밋

TDD 워크플로우에서는 **각 단계마다 별도로 커밋**합니다:

#### 🔴 RED 단계 커밋
```bash
[RED] test(기능명): 테스트 작성 - [구체적인 테스트 내용]

# 예시
[RED] test(event): 일정 겹침 감지 테스트 작성
[RED] test(repeat): 매월 31일 반복일정 테스트 작성
[RED] test(notification): 알림 중복 방지 테스트 작성
```

#### 🟢 GREEN 단계 커밋
```bash
[GREEN] feat(기능명): 최소 구현 - [구체적인 구현 내용]

# 예시
[GREEN] feat(event): 일정 겹침 감지 최소 구현
[GREEN] feat(repeat): 매월 31일 반복일정 생성 구현
[GREEN] feat(notification): 알림 중복 방지 로직 구현
```

#### ♻️ REFACTOR 단계 커밋
```bash
[REFACTOR] refactor(기능명): 코드 개선 - [개선 내용]

# 예시
[REFACTOR] refactor(event): 일정 겹침 감지 함수 분리
[REFACTOR] refactor(repeat): 반복일정 생성 로직 단순화
[REFACTOR] refactor(notification): 알림 상태 관리 개선
```

### 전체 워크플로우 커밋 예시

```bash
# 1. RED: 테스트 작성
git add src/__tests__/unit/easy.eventOverlap.spec.ts
git commit -m "[RED] test(event): 일정 겹침 감지 테스트 작성

- 완전히 겹치는 경우 테스트
- 부분적으로 겹치는 경우 테스트
- 겹치지 않는 경우 테스트
- 편집 중인 일정 제외 테스트"

# 2. GREEN: 최소 구현
git add src/utils/eventOverlap.ts
git commit -m "[GREEN] feat(event): 일정 겹침 감지 최소 구현

- findOverlappingEvents 함수 구현
- 날짜와 시간 범위 교차 검사
- 모든 테스트 통과"

# 3. REFACTOR: 코드 개선
git add src/utils/eventOverlap.ts
git commit -m "[REFACTOR] refactor(event): 겹침 감지 로직 개선

- 시간 비교 로직을 별도 함수로 분리
- 변수명 명확화
- 주석 추가"
```

### 다중 기능 개발 시 커밋 전략

하나의 기능을 완전히 완성(RED-GREEN-REFACTOR)한 후 다음 기능으로:

```bash
# 기능 A
[RED] test(featureA): 기능 A 테스트
[GREEN] feat(featureA): 기능 A 구현
[REFACTOR] refactor(featureA): 기능 A 개선

# 기능 B (기능 A 완료 후)
[RED] test(featureB): 기능 B 테스트
[GREEN] feat(featureB): 기능 B 구현
[REFACTOR] refactor(featureB): 기능 B 개선
```

### 커밋 시점

- **RED**: 테스트 파일 작성 후 즉시 커밋
- **GREEN**: 모든 테스트 통과 후 커밋
- **REFACTOR**: 각 리팩토링 완료 후 커밋 (여러 번 가능)

### 커밋 메시지 예시

#### 1. 기능 추가
```
feat(event): 일정 겹침 감지 기능 추가

- findOverlappingEvents 함수 구현
- 겹침 경고 다이얼로그 추가
- 사용자가 겹침을 무시하고 저장 가능하도록 함

Closes #123
```

#### 2. 버그 수정
```
fix(notification): 알림이 중복 표시되는 문제 수정

- notifiedEvents 배열로 이미 알림된 일정 추적
- 동일 일정에 대해 알림이 한 번만 표시되도록 수정

Fixes #456
```

#### 3. 리팩토링
```
refactor(hooks): useEventForm 훅 로직 개선

- 유효성 검증 로직을 별도 함수로 분리
- 중복 코드 제거
- 가독성 향상

기능 변경 없음
```

#### 4. 테스트
```
test(event): 일정 겹침 감지 테스트 추가

- Happy path 테스트
- Edge case 테스트 (경계값)
- 겹치지 않는 경우 테스트

커버리지: 85% -> 92%
```

#### 5. 문서
```
docs(readme): 설치 및 실행 방법 업데이트

- pnpm 명령어 추가
- 테스트 실행 방법 명시
- 트러블슈팅 섹션 추가
```

### 커밋 메시지 작성 원칙

1. **제목 (Subject)**
   - 50자 이내
   - 명령형 사용 ("추가함" ❌, "추가" ✅)
   - 마침표 없음
   - 무엇을 했는지 명확히

2. **본문 (Body)** - 선택사항
   - 72자마다 줄바꿈
   - 왜 이 변경이 필요한지
   - 어떻게 문제를 해결했는지
   - 부작용이나 주의사항

3. **꼬리말 (Footer)** - 선택사항
   - Breaking changes
   - 이슈 참조 (Closes #123)

## PR 설명 작성 가이드

### PR 템플릿
```markdown
## 📝 변경 사항

### 요약
[변경 사항을 한 두 문장으로 요약]

### 주요 변경사항
- 변경 1
- 변경 2
- 변경 3

## 🎯 목적
[왜 이 변경이 필요한지]

## 🔍 상세 설명

### 구현 내용
[구현한 기능의 상세 설명]

### 기술적 결정
[왜 이렇게 구현했는지, 다른 방법 대신 이 방법을 선택한 이유]

## ✅ 테스트

### 추가된 테스트
- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] E2E 테스트

### 테스트 시나리오
1. [시나리오 1]
2. [시나리오 2]

### 테스트 결과
```bash
pnpm test
# 결과 붙여넣기
```

## 📸 스크린샷/영상 (UI 변경 시)

### Before
[이전 화면]

### After
[변경 후 화면]

## 📋 체크리스트

- [ ] 모든 테스트 통과
- [ ] 린트 검사 통과
- [ ] 접근성 검증 완료
- [ ] 문서 업데이트 완료
- [ ] 코드 리뷰 준비 완료

## 🤔 리뷰 포인트

1. [특별히 리뷰가 필요한 부분 1]
2. [특별히 리뷰가 필요한 부분 2]

## 📌 관련 이슈

Closes #123
Related to #456

## 🚀 배포 시 주의사항

[배포할 때 주의해야 할 점이 있다면]
```

### PR 예시

```markdown
## 📝 변경 사항

### 요약
일정 겹침 감지 기능을 추가하여 사용자가 시간이 겹치는 일정을 추가할 때 경고를 표시합니다.

### 주요 변경사항
- `findOverlappingEvents` 유틸리티 함수 추가
- 일정 저장 시 겹침 검사 로직 추가
- 겹침 경고 다이얼로그 컴포넌트 추가
- 사용자가 경고를 무시하고 강제 저장 가능

## 🎯 목적
사용자가 실수로 시간이 겹치는 일정을 추가하는 것을 방지하고, 의도적으로 겹치는 일정을 추가할 때는 명확한 확인 절차를 거치도록 하기 위함입니다.

## 🔍 상세 설명

### 구현 내용
1. **findOverlappingEvents 함수** (`src/utils/eventOverlap.ts`)
   - 새로운 일정과 기존 일정들의 시간 범위를 비교
   - 같은 날짜에 시간이 겹치는 일정들을 반환

2. **겹침 검사 로직** (`App.tsx`)
   - 일정 저장 전에 겹침 검사 수행
   - 겹치는 일정이 있으면 다이얼로그 표시
   - 사용자 확인 후 저장 진행

3. **경고 다이얼로그**
   - Material UI Dialog 컴포넌트 사용
   - 겹치는 일정 목록 표시
   - "취소" / "계속 진행" 버튼 제공

### 기술적 결정
- **비차단 경고**: 사용자가 겹침을 인지하고도 저장할 수 있도록 함
- **클라이언트 검증**: 빠른 피드백을 위해 프론트엔드에서 검증
- **Dialog 사용**: Material UI의 일관성 유지

## ✅ 테스트

### 추가된 테스트
- [x] 단위 테스트 (`easy.eventOverlap.spec.ts`)
- [x] 통합 테스트 (`medium.integration.spec.tsx`)

### 테스트 시나리오
1. 겹치지 않는 일정 추가 - 정상 저장
2. 완전히 겹치는 일정 추가 - 경고 표시
3. 부분적으로 겹치는 일정 - 경고 표시
4. 경고 다이얼로그에서 취소 - 저장 안 됨
5. 경고 다이얼로그에서 계속 진행 - 저장됨

### 테스트 결과
```bash
 ✓ src/__tests__/unit/easy.eventOverlap.spec.ts (5)
 ✓ src/__tests__/medium.integration.spec.tsx (3)

Test Files  2 passed (2)
Tests  8 passed (8)
```

## 📸 스크린샷

### 겹침 경고 다이얼로그
![overlap-dialog](./docs/images/overlap-dialog.png)

### 겹치는 일정 표시
![overlapping-events](./docs/images/overlapping-events.png)

## 📋 체크리스트

- [x] 모든 테스트 통과
- [x] 린트 검사 통과
- [x] 접근성 검증 완료
- [x] 문서 업데이트 완료
- [x] 코드 리뷰 준비 완료

## 🤔 리뷰 포인트

1. **findOverlappingEvents 로직**: 시간 비교 로직이 모든 엣지 케이스를 처리하는지
2. **UX**: 다이얼로그의 문구와 버튼 레이블이 직관적인지
3. **성능**: 많은 일정이 있을 때 성능 영향이 있는지

## 📌 관련 이슈

Closes #123

## 🚀 배포 시 주의사항

없음. 순수 클라이언트 기능으로 백엔드 변경 없음.
```

## 기술 문서 작성 가이드

### API 문서 예시
```markdown
# Event Overlap Detection API

## `findOverlappingEvents`

주어진 일정과 시간이 겹치는 기존 일정들을 찾습니다.

### 시그니처
```typescript
function findOverlappingEvents(
  newEvent: Event | EventForm,
  existingEvents: Event[]
): Event[]
```

### 매개변수
- `newEvent`: 검사할 새 일정
- `existingEvents`: 기존 일정 배열

### 반환값
시간이 겹치는 일정들의 배열. 겹치는 일정이 없으면 빈 배열.

### 예시
```typescript
const newEvent = {
  date: '2025-10-01',
  startTime: '14:00',
  endTime: '15:00',
  // ...
};

const existing = [
  {
    id: '1',
    date: '2025-10-01',
    startTime: '14:30',
    endTime: '15:30',
    // ...
  }
];

const overlapping = findOverlappingEvents(newEvent, existing);
// [{ id: '1', ... }]
```

### 겹침 판단 기준
1. 같은 날짜
2. 시간 범위가 교차
   - 새 일정의 시작이 기존 일정 범위 내
   - 새 일정의 종료가 기존 일정 범위 내
   - 새 일정이 기존 일정을 완전히 포함

### 주의사항
- 시간은 HH:MM 형식의 문자열
- 날짜는 YYYY-MM-DD 형식의 문자열
- 편집 중인 일정은 자동으로 제외됨 (id 비교)
```

### 사용자 가이드 예시
```markdown
# 일정 겹침 감지 기능 사용법

## 개요
일정을 추가할 때 기존 일정과 시간이 겹치면 자동으로 경고가 표시됩니다.

## 사용 방법

1. **일정 추가**
   - 일정 정보를 입력합니다
   - "일정 추가" 버튼을 클릭합니다

2. **겹침 확인**
   - 시간이 겹치는 일정이 있으면 경고 다이얼로그가 표시됩니다
   - 겹치는 일정 목록을 확인할 수 있습니다

3. **선택**
   - **취소**: 일정 추가를 취소하고 폼으로 돌아갑니다
   - **계속 진행**: 경고를 무시하고 일정을 저장합니다

## 예시

### 시나리오: 팀 회의와 1:1 미팅 겹침
1. 팀 회의: 14:00-15:00
2. 1:1 미팅 추가 시도: 14:30-15:30
3. 결과: "다음 일정과 겹칩니다: 팀 회의 (2025-10-01 14:00-15:00)"
4. 선택: 시간을 수정하거나, 의도적으로 겹치게 저장

## 주의사항
- 경고를 무시하고 저장하면 두 일정이 모두 캘린더에 표시됩니다
- 일정을 수정할 때도 동일하게 겹침 검사가 수행됩니다
```

## README 업데이트 가이드

새 기능 추가 시 README.md 업데이트:

```markdown
## 새로운 기능

### 일정 겹침 감지 (v1.2.0)
일정을 추가할 때 기존 일정과 시간이 겹치면 자동으로 경고를 표시합니다.

**사용법:**
1. 겹치는 시간에 일정 추가
2. 경고 다이얼로그 확인
3. 취소 또는 계속 진행 선택

**관련 파일:**
- `src/utils/eventOverlap.ts`
- `src/__tests__/unit/easy.eventOverlap.spec.ts`
```

## 문서 작성 체크리스트

### 커밋 메시지
- [ ] Conventional Commits 형식 준수
- [ ] 제목이 50자 이내
- [ ] 명령형 동사 사용
- [ ] 변경 이유 설명 (본문)

### PR 설명
- [ ] 요약이 명확함
- [ ] 주요 변경사항 나열
- [ ] 테스트 시나리오 포함
- [ ] 스크린샷 첨부 (UI 변경 시)
- [ ] 리뷰 포인트 명시
- [ ] 관련 이슈 링크

### 기술 문서
- [ ] API 시그니처 명확함
- [ ] 예시 코드 포함
- [ ] 매개변수 설명
- [ ] 반환값 설명
- [ ] 주의사항 명시

### 사용자 가이드
- [ ] 단계별 설명
- [ ] 스크린샷/GIF 포함
- [ ] 예시 시나리오
- [ ] 주의사항 정리

## 출력물

### 1. 커밋 메시지
명확하고 구조화된 커밋 메시지

### 2. PR 설명
완전하고 상세한 Pull Request 설명

### 3. 기술 문서
API 문서, 아키텍처 문서 등

### 4. 사용자 문서
README, 사용 가이드 등

## 최종 단계

문서 작성이 완료되면:
1. ✅ 문서 리뷰
2. 📤 PR 제출
3. 🎉 개발 사이클 완료!

## 문서 품질 기준

- [ ] 명확하고 이해하기 쉬움
- [ ] 구조화되고 체계적임
- [ ] 예시가 충분함
- [ ] 오타나 문법 오류 없음
- [ ] 기술적으로 정확함
- [ ] 업데이트가 용이한 구조
