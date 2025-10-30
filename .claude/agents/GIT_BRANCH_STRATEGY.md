# Git 브랜치 전략

## 개요
체계적인 Git 브랜치 관리를 위한 전략과 규칙을 정의합니다.

## 브랜치 구조

```
main (프로덕션)
  ├── develop (개발)
  │     ├── feature/반복일정-ui (새 기능)
  │     ├── feature/31일-처리 (새 기능)
  │     ├── fix/123-알림-버그 (버그 수정)
  │     └── refactor/eventUtils (리팩토링)
  └── hotfix/critical-bug (긴급 수정)
```

## 주요 브랜치

### 1. main (프로덕션)
- 항상 배포 가능한 상태 유지
- 직접 커밋 금지
- develop 또는 hotfix에서만 머지
- 모든 머지에 태그 생성 (v1.0.0, v1.1.0 등)

### 2. develop (개발)
- 개발의 기준 브랜치
- feature 브랜치의 머지 대상
- 안정화 후 main으로 머지

## 보조 브랜치

### 1. feature/* (기능 개발)
**명명 규칙:**
```bash
feature/기능명
feature/반복일정-ui
feature/31일-매월-처리
feature/단일-전체-수정
```

**사용법:**
```bash
# 생성
git checkout -b feature/반복일정-ui develop

# 개발 중 커밋
git commit -m "[RED] test(repeat): 반복일정 UI 테스트"
git commit -m "[GREEN] feat(repeat): 반복일정 UI 구현"
git commit -m "[REFACTOR] refactor(repeat): UI 컴포넌트 분리"

# develop에 머지
git checkout develop
git merge --no-ff feature/반복일정-ui
git branch -d feature/반복일정-ui
```

### 2. fix/* (버그 수정)
**명명 규칙:**
```bash
fix/이슈번호-간단한설명
fix/123-알림-중복
fix/456-윤년-처리
```

**사용법:**
```bash
# 생성
git checkout -b fix/123-알림-중복 develop

# 수정 후 머지
git checkout develop
git merge --no-ff fix/123-알림-중복
```

### 3. hotfix/* (긴급 수정)
**명명 규칙:**
```bash
hotfix/간단한설명
hotfix/critical-data-loss
hotfix/security-patch
```

**사용법:**
```bash
# main에서 생성
git checkout -b hotfix/critical-bug main

# 수정 후 main과 develop 모두에 머지
git checkout main
git merge --no-ff hotfix/critical-bug
git tag -a v1.0.1

git checkout develop
git merge --no-ff hotfix/critical-bug
```

### 4. refactor/* (리팩토링)
**명명 규칙:**
```bash
refactor/대상
refactor/eventUtils
refactor/dateCalculation
```

## 머지 전략

### 1. feature → develop: Squash Merge
```bash
# 여러 커밋을 하나로 통합
git checkout develop
git merge --squash feature/반복일정-ui
git commit -m "feat(repeat): 반복일정 UI 구현

- 매일/매주/매월/매년 선택 가능
- 반복 종료일 설정
- 반복 아이콘 표시

Closes #123"
```

**이유:**
- feature 브랜치의 여러 실험적 커밋을 하나로 정리
- develop 히스토리가 깔끔해짐

### 2. develop → main: Merge Commit
```bash
# 커밋 히스토리 유지
git checkout main
git merge --no-ff develop
git tag -a v1.1.0 -m "Release v1.1.0"
```

**이유:**
- 어떤 기능들이 포함되었는지 추적 가능
- 릴리즈 단위로 히스토리 구분

### 3. hotfix → main/develop: Cherry-pick
```bash
# 필요한 커밋만 선택적으로 적용
git checkout main
git cherry-pick <hotfix-commit-hash>

git checkout develop
git cherry-pick <hotfix-commit-hash>
```

## 브랜치 명명 규칙

### 형식
```
<타입>/<이슈번호>-<간단한-설명>
<타입>/<간단한-설명>
```

### 타입
- `feature`: 새로운 기능
- `fix`: 버그 수정
- `hotfix`: 긴급 수정
- `refactor`: 리팩토링
- `docs`: 문서 수정
- `test`: 테스트 추가/수정
- `chore`: 기타 작업

### 예시
```bash
# ✅ 좋음
feature/123-repeat-schedule
fix/456-leap-year-bug
refactor/date-utils
docs/update-readme

# ❌ 나쁨
feature-repeat
bugfix
my-branch
temp
```

## 워크플로우 예시

### 일반적인 기능 개발
```bash
# 1. develop에서 feature 브랜치 생성
git checkout develop
git pull origin develop
git checkout -b feature/반복일정-ui

# 2. TDD 사이클 개발
# RED
git add src/__tests__/
git commit -m "[RED] test(repeat): 반복일정 UI 테스트 작성"

# GREEN
git add src/
git commit -m "[GREEN] feat(repeat): 반복일정 UI 최소 구현"

# REFACTOR
git add src/
git commit -m "[REFACTOR] refactor(repeat): 컴포넌트 구조 개선"

# 3. 원격 저장소에 푸시
git push origin feature/반복일정-ui

# 4. PR 생성 (GitHub/GitLab)
# develop ← feature/반복일정-ui

# 5. 코드 리뷰 후 머지
git checkout develop
git merge --squash feature/반복일정-ui
git commit -m "feat(repeat): 반복일정 UI 구현

- 매일/매주/매월/매년 선택
- 반복 종료일 설정
- 아이콘 표시

Closes #123"

# 6. feature 브랜치 삭제
git branch -d feature/반복일정-ui
git push origin --delete feature/반복일정-ui
```

### 긴급 버그 수정
```bash
# 1. main에서 hotfix 브랜치 생성
git checkout main
git checkout -b hotfix/data-loss

# 2. 수정
git add .
git commit -m "fix: prevent data loss on repeat event save"

# 3. main에 머지
git checkout main
git merge --no-ff hotfix/data-loss
git tag -a v1.0.1 -m "Hotfix: data loss prevention"
git push origin main --tags

# 4. develop에도 반영
git checkout develop
git merge --no-ff hotfix/data-loss
git push origin develop

# 5. hotfix 브랜치 삭제
git branch -d hotfix/data-loss
```

## PR (Pull Request) 규칙

### PR 제목 형식
```
[타입] 간단한 설명

예시:
[Feature] 반복일정 UI 구현
[Fix] 윤년 2월 29일 버그 수정
[Refactor] 날짜 계산 로직 개선
```

### PR 설명 템플릿
```markdown
## 📝 변경 사항
[변경 내용 요약]

## 🎯 관련 이슈
Closes #123

## ✅ 체크리스트
- [ ] 테스트 작성 및 통과
- [ ] 린트 검사 통과
- [ ] 코드 리뷰 완료
- [ ] 문서 업데이트

## 📸 스크린샷 (UI 변경 시)
[스크린샷 첨부]
```

### 머지 조건
- 최소 1명의 승인 필요
- 모든 CI 테스트 통과
- 충돌 해결 완료
- 코드 리뷰 완료

## 커밋 메시지 규칙

### TDD 단계별 커밋
```bash
[RED] test(기능명): 테스트 작성
[GREEN] feat(기능명): 최소 구현
[REFACTOR] refactor(기능명): 코드 개선
```

### 일반 커밋
```bash
<type>(<scope>): <subject>

type: feat, fix, refactor, test, docs, style, chore
scope: repeat, event, calendar, notification 등
subject: 간단한 설명 (50자 이내)

예시:
feat(repeat): 매월 반복 기능 추가
fix(leap-year): 윤년 2월 29일 처리 수정
refactor(date): 날짜 계산 로직 단순화
test(repeat): 31일 반복일정 테스트 추가
docs(readme): 설치 방법 업데이트
```

## 브랜치 보호 규칙

### main 브랜치
- 직접 푸시 금지
- PR을 통해서만 머지 가능
- 최소 1명의 승인 필요
- 모든 CI 테스트 통과 필수
- 관리자만 강제 푸시 가능

### develop 브랜치
- 직접 푸시 금지
- PR을 통해서만 머지 가능
- CI 테스트 통과 필수

## 브랜치 수명 주기

### 생성
```bash
# develop에서 최신 코드 받기
git checkout develop
git pull origin develop

# 새 브랜치 생성
git checkout -b feature/새기능
```

### 개발 중
```bash
# 주기적으로 develop 변경사항 반영
git checkout develop
git pull origin develop
git checkout feature/새기능
git rebase develop

# 또는 merge (팀 정책에 따라)
git merge develop
```

### 머지 후
```bash
# 로컬 브랜치 삭제
git branch -d feature/새기능

# 원격 브랜치 삭제
git push origin --delete feature/새기능
```

## 팀 협업 규칙

### 1. 브랜치 작업 시작 전
- 항상 develop 최신 상태로 업데이트
- 이슈 번호 확인 및 브랜치명에 포함

### 2. 개발 중
- 자주 커밋 (의미있는 단위로)
- TDD 사이클 준수 (RED-GREEN-REFACTOR)
- 충돌 발생 시 즉시 해결

### 3. PR 생성 전
- 로컬에서 테스트 실행
- 린트 검사 통과
- 최신 develop과 동기화

### 4. 코드 리뷰
- 24시간 내 리뷰 완료
- 건설적인 피드백
- 승인 후 즉시 머지

## 버전 관리

### 시맨틱 버전닝
```
v<major>.<minor>.<patch>

v1.0.0 - 최초 릴리즈
v1.1.0 - 새 기능 추가 (반복일정)
v1.1.1 - 버그 수정
v2.0.0 - Breaking change
```

### 태그 생성
```bash
# main 브랜치에서
git tag -a v1.1.0 -m "Release v1.1.0: 반복일정 기능 추가"
git push origin v1.1.0

# 모든 태그 푸시
git push origin --tags
```

## 문제 해결

### 잘못된 브랜치에서 작업한 경우
```bash
# 현재 변경사항을 stash
git stash

# 올바른 브랜치로 이동
git checkout feature/올바른브랜치

# stash 복구
git stash pop
```

### 머지 충돌 해결
```bash
# 충돌 발생 시
git merge develop

# 충돌 파일 수정 후
git add .
git commit -m "chore: resolve merge conflicts"
```

### 잘못된 커밋 수정
```bash
# 마지막 커밋 메시지 수정
git commit --amend

# 이미 푸시한 경우 (주의!)
git push --force-with-lease
```

---

**브랜치 전략을 잘 따르면 협업이 원활해집니다! 🌿**
