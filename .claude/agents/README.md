# TDD Workflow Agents

테스트 주도 개발(TDD)을 위한 6개의 전문 AI Agent 시스템

## 📋 Agent 목록

### 1. 🎯 Feature Architect (기능 설계)
**파일:** `1-feature-architect.md`

**역할:**
- 요구사항 분석 및 구체화
- 작업 범위 정의
- 체크리스트 작성
- 입출력 예시 정의

**입력:** 사용자 요구사항
**출력:** 설계 문서 (design.md)

---

### 2. 🔴 Test Designer (테스트 설계) - RED
**파일:** `2-test-designer.md`

**역할:**
- 테스트 시나리오 설계
- 실패하는 테스트 코드 작성
- Edge case 정의

**입력:** Feature Architect의 설계 문서
**출력:** 실패하는 테스트 코드 (*.spec.ts)

**TDD 단계:** 🔴 RED

---

### 3. 🟢 Implementation Engineer (구현) - GREEN
**파일:** `3-implementation-engineer.md`

**역할:**
- 최소한의 코드로 테스트 통과
- 기능 구현

**입력:** Test Designer의 테스트 코드
**출력:** 테스트를 통과하는 구현 코드

**TDD 단계:** 🟢 GREEN

---

### 4. ♻️ Refactor Specialist (리팩토링) - REFACTOR
**파일:** `4-refactor-specialist.md`

**역할:**
- 코드 품질 개선
- 중복 제거
- 성능 최적화

**입력:** Implementation Engineer의 구현 코드
**출력:** 리팩토링된 코드

**TDD 단계:** ♻️ REFACTOR

---

### 5. ✅ Quality Validator (품질 검증)
**파일:** `5-quality-validator.md`

**역할:**
- 모든 테스트 통과 확인
- 코드 리뷰
- 접근성 검증

**입력:** Refactor Specialist의 최종 코드
**출력:** 검증 보고서

---

### 6. 📝 Documentation Writer (문서화)
**파일:** `6-documentation-writer.md`

**역할:**
- 커밋 메시지 작성
- 기술 문서 작성
- PR 설명 작성

**입력:** Quality Validator의 검증 결과
**출력:** 커밋 메시지, PR, 문서

---

## 🔄 TDD Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     TDD Agent Workflow                       │
└─────────────────────────────────────────────────────────────┘

1️⃣ Feature Architect
   ↓ [설계 문서]

2️⃣ Test Designer (🔴 RED)
   ↓ [실패하는 테스트]

3️⃣ Implementation Engineer (🟢 GREEN)
   ↓ [테스트 통과하는 코드]

4️⃣ Refactor Specialist (♻️ REFACTOR)
   ↓ [개선된 코드]

5️⃣ Quality Validator
   ↓ [검증 보고서]

6️⃣ Documentation Writer
   ↓ [문서 & PR]

✅ 완료!
```

## 🚀 사용 방법

### 단계별 실행

#### 1단계: 기능 설계
```bash
# Claude Code에게 다음과 같이 요청:
"Feature Architect 역할로, [기능명] 기능을 설계해주세요."

# 예시:
"Feature Architect 역할로, 일정 알림 기능을 설계해주세요."
```

**출력물:**
- `design.md` - 설계 문서
- 요구사항 명세
- 체크리스트

#### 2단계: 테스트 작성 (RED)
```bash
"Test Designer 역할로, design.md를 바탕으로 테스트 코드를 작성해주세요."
```

**출력물:**
- `src/__tests__/**/*.spec.ts` - 테스트 파일
- 실패하는 테스트 (🔴 RED 상태)

**검증:**
```bash
pnpm test  # 모든 테스트가 실패해야 함
```

#### 3단계: 구현 (GREEN)
```bash
"Implementation Engineer 역할로, 테스트를 통과하는 코드를 구현해주세요."
```

**출력물:**
- 구현 코드 (hooks, utils, components 등)
- 테스트 통과 (🟢 GREEN 상태)

**검증:**
```bash
pnpm test  # 모든 테스트가 통과해야 함
```

#### 4단계: 리팩토링 (REFACTOR)
```bash
"Refactor Specialist 역할로, 코드를 개선해주세요."
```

**출력물:**
- 리팩토링된 코드
- 여전히 테스트 통과 (♻️ REFACTOR)

**검증:**
```bash
pnpm test  # 여전히 통과해야 함
pnpm lint  # 린트 통과
```

#### 5단계: 품질 검증
```bash
"Quality Validator 역할로, 코드를 검증해주세요."
```

**출력물:**
- 검증 보고서
- 발견된 이슈
- 승인/반려 결정

**검증:**
```bash
pnpm test          # 테스트
pnpm lint          # 린트
pnpm test:coverage # 커버리지
pnpm build         # 빌드
```

#### 6단계: 문서화
```bash
"Documentation Writer 역할로, 커밋 메시지와 PR을 작성해주세요."
```

**출력물:**
- 커밋 메시지 (Conventional Commits)
- PR 설명
- 기술 문서

### 전체 워크플로우 한 번에 실행
```bash
"TDD 워크플로우를 따라 [기능명] 기능을 구현해주세요.
1. Feature Architect로 설계
2. Test Designer로 테스트 작성
3. Implementation Engineer로 구현
4. Refactor Specialist로 리팩토링
5. Quality Validator로 검증
6. Documentation Writer로 문서화"
```

## 📊 각 단계의 체크포인트

### 🎯 Feature Architect 완료 기준
- [ ] 요구사항이 명확하게 정의됨
- [ ] 작업 범위가 설정됨
- [ ] 체크리스트 작성됨
- [ ] 입출력 예시가 있음

### 🔴 Test Designer 완료 기준
- [ ] 모든 요구사항에 대한 테스트 존재
- [ ] Happy path 테스트 포함
- [ ] Sad path 테스트 포함
- [ ] Edge case 테스트 포함
- [ ] **테스트가 실패함 (RED)**

### 🟢 Implementation Engineer 완료 기준
- [ ] 모든 테스트 통과 (GREEN)
- [ ] 타입 에러 없음
- [ ] ESLint 에러 없음
- [ ] 기존 기능 정상 동작

### ♻️ Refactor Specialist 완료 기준
- [ ] 코드 가독성 향상
- [ ] 중복 코드 제거
- [ ] 적절한 추상화
- [ ] **여전히 모든 테스트 통과**

### ✅ Quality Validator 완료 기준
- [ ] 모든 테스트 통과
- [ ] 린트 검사 통과
- [ ] 빌드 성공
- [ ] 접근성 검증 완료
- [ ] 검증 보고서 작성됨

### 📝 Documentation Writer 완료 기준
- [ ] 커밋 메시지 작성
- [ ] PR 설명 작성
- [ ] 기술 문서 작성 (필요시)
- [ ] Conventional Commits 준수

## 🎯 TDD 테스트 작성 규칙

### 핵심 원칙

#### 1. 테스트 작성 전 준비
- 기능을 **작은 단위**로 쪼개기
- 각 테스트는 **하나의 명확한 동작**만 검증
- AI에게 "테스트 먼저, 구현은 나중" 명시

#### 2. RED 단계 - 실패하는 테스트 작성
```bash
pnpm test  # 반드시 실패 확인 (🔴 RED)
```
- 긍정 케이스 (Happy Path)
- 부정 케이스 (Sad Path)
- 경계값 테스트
- 엣지 케이스

#### 3. GREEN 단계 - 최소 구현
```bash
pnpm test  # 모두 통과 (🟢 GREEN)
```
- 테스트를 통과시키는 최소한의 코드만 작성
- 과도한 구현 금지

#### 4. REFACTOR 단계 - 코드 개선
```bash
pnpm test  # 여전히 통과 (♻️ REFACTOR)
```
- 중복 제거
- 가독성 향상
- 기능 변경 없이 구조만 개선

#### 5. 각 단계별 커밋
```bash
[RED] test(기능명): 테스트 작성
[GREEN] feat(기능명): 최소 구현
[REFACTOR] refactor(기능명): 코드 개선
```

### 반복일정 특수 조건 (8주차용)

**테스트 작성 규칙만 기록 - 현재 구현 금지**

- 매월 31일 반복일정 (31일이 없는 달 처리)
- 윤년 2월 29일 반복일정
- 단일 수정 vs 전체 수정
- 단일 삭제 vs 전체 삭제
- 과거 일정 처리
- 반복 종료일 처리

## 🎯 프로젝트 특화 규칙

### 일정 관리 앱 (Event Calendar)

#### 금지 사항
- ❌ **반복 일정 기능 구현 금지** - 8주차 과제
- ❌ 컴포넌트 분리 금지 - App.tsx 단일 컴포넌트 유지

#### 준수 사항
- ✅ ISO 주 표준 사용 (dateUtils.ts)
- ✅ 커스텀 훅 패턴 유지
- ✅ Material UI 사용
- ✅ MSW로 API 모킹
- ✅ 접근성 속성 추가

#### 테스트 환경
- 시간: 2025-10-01 고정
- 타임존: UTC
- MSW 서버 활성화

#### 파일 네이밍
- 테스트: `[난이도].[기능명].spec.ts`
  - easy: 단순 유틸리티
  - medium: 훅, 통합 테스트
  - hard: 복잡한 시나리오

## 💡 Tips

### 효과적인 Agent 활용

1. **명확한 역할 지정**
   ```
   ❌ "테스트 코드 작성해주세요"
   ✅ "Test Designer 역할로, design.md를 바탕으로 테스트 코드를 작성해주세요"
   ```

2. **단계별 검증**
   ```bash
   # 각 단계마다 반드시 확인
   pnpm test
   pnpm lint
   ```

3. **문서 참조**
   ```
   "CLAUDE.md와 Feature Architect 가이드를 참조하여..."
   ```

4. **이전 단계 출력물 활용**
   ```
   "Test Designer가 작성한 테스트 코드를 바탕으로..."
   ```

### 자주 발생하는 문제

#### 문제: 테스트가 GREEN에서 시작
**해결:** Test Designer부터 시작하여 RED 확인
```bash
pnpm test  # 실패 확인 후 구현 시작
```

#### 문제: 리팩토링 후 테스트 실패
**해결:** 작은 단위로 리팩토링하고 매번 테스트
```bash
# 작은 변경 → 테스트 → 커밋 반복
```

#### 문제: 너무 많은 변경사항
**해결:** Agent별로 커밋 분리
```bash
git commit -m "test: add overlap detection tests"
git commit -m "feat: implement overlap detection"
git commit -m "refactor: improve overlap logic"
```

## 📚 참고 자료

### Agent 문서
- `CODE_REVIEW_RULES.md` - 코드 리뷰 규칙
- `1-feature-architect.md` - 기능 설계 Agent
- `2-test-designer.md` - 테스트 설계 Agent (RED)
- `3-implementation-engineer.md` - 구현 Agent (GREEN)
- `4-refactor-specialist.md` - 리팩토링 Agent (REFACTOR)
- `5-quality-validator.md` - 품질 검증 Agent
- `6-documentation-writer.md` - 문서화 Agent

### 프로젝트 문서
- `../../CLAUDE.md` - 프로젝트 전체 가이드
- `../../README.md` - 프로젝트 설명
- `../../report.md` - 과제 리포트

### TDD 리소스
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)
- [Red-Green-Refactor](https://www.codecademy.com/article/tdd-red-green-refactor)
- [Conventional Commits](https://www.conventionalcommits.org/)

### 기술 스택 문서
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [MSW](https://mswjs.io/)
- [Material UI](https://mui.com/)

## 🤝 기여

Agent 개선 사항이나 새로운 Agent 아이디어가 있다면:
1. 이슈 생성
2. Agent 템플릿 작성
3. PR 제출

## 📝 버전 히스토리

### v1.0.0 (2025-10-30)
- 초기 6개 Agent 생성
- Feature Architect
- Test Designer (RED)
- Implementation Engineer (GREEN)
- Refactor Specialist (REFACTOR)
- Quality Validator
- Documentation Writer

---

**Happy TDD! 🎉**
