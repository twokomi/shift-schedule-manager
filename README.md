# 근무표 관리 시스템

## 프로젝트 개요
- **이름**: 근무표 관리 시스템 (Work Schedule Management System)
- **목표**: Day/Night 교대 근무 일정을 효율적으로 관리하고 시각화하는 웹 애플리케이션
- **주요 기능**:
  - 📱 **뷰 모드**: 모바일 최적화된 읽기 전용 근무표 조회
  - 💻 **편집 모드**: 데스크톱 최적화된 관리자 인터페이스 (비밀번호 보호)
  - 📅 캘린더 형식의 근무표 조회
  - 🌓 Day Shift / Night Shift 구분 표시
  - 🎨 팀별 색상 구분 (Team A, B, C, D)
  - 👥 포지션별 근무자 배치
  - ✏️ 엑셀 스타일의 편집 기능 (복사/붙여넣기, 드래그 선택, Undo/Redo)
  - 📊 담당자별 근무시간 집계

## URL
- **로컬 개발 서버**: https://3000-if753wgvrwwx1hi4nxfk9-d0b9e1e2.sandbox.novita.ai
- **뷰 모드** (기본): `/?mode=view` 또는 `/`
- **편집 모드**: `/?mode=edit` (비밀번호: `admin1234`)

## 모드 설명

### 📱 뷰 모드 (View Mode)
**목적**: 모바일에서 근무표 확인
- ✅ 모바일 최적화된 카드 형식 UI
- ✅ 터치 친화적인 인터페이스
- ✅ 날짜별 세로 스크롤
- ✅ 읽기 전용 (편집 불가)
- ✅ 빠른 조회 및 확인

**사용 시나리오**: 
- 직원들이 스마트폰으로 자신의 근무 일정 확인
- 외부에서 빠르게 근무표 조회
- 편집 권한이 없는 사용자

### 💻 편집 모드 (Edit Mode)
**목적**: 데스크톱에서 근무표 관리
- ✅ 데스크톱 최적화된 테이블 형식
- ✅ 엑셀 스타일의 편집 기능
  - Ctrl+C / Ctrl+V: 복사/붙여넣기
  - 드래그 선택: 여러 셀 한 번에 선택
  - Ctrl+Z / Ctrl+Y: 되돌리기/다시 실행
  - Delete: 작업자 제거
  - 더블클릭: 직접 수정
- ✅ 일괄 저장 기능
- ✅ 담당자별 근무시간 집계 및 정렬
- ✅ 비밀번호 보호

**사용 시나리오**:
- 관리자가 근무표 작성 및 수정
- 대량의 근무 일정 입력
- 근무시간 통계 확인

### 모드 전환 방법
1. **뷰 모드 → 편집 모드**:
   - 상단 "편집" 버튼 클릭
   - 비밀번호 입력 (기본값: `admin1234`)
   - 인증 성공 시 편집 모드로 전환

2. **편집 모드 → 뷰 모드**:
   - URL에서 `?mode=edit` 제거하거나 `/`로 이동

## 데이터 구조

### 데이터 모델
1. **schedules 테이블**
   - id: 일정 고유 ID
   - date: 날짜 (YYYY-MM-DD)
   - day_of_week: 요일 (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
   - shift_type: 교대 타입 ('day' 또는 'night')

2. **assignments 테이블**
   - id: 배치 고유 ID
   - schedule_id: 스케줄 외래키
   - position: 포지션 (Backend, Front#BT1, Front#BT2, Front#WT, Front#IM 등)
   - employee_name: 직원 이름
   - team: 팀 구분 (A, B, C, D)

### 스토리지 서비스
- **Cloudflare D1 Database**: SQLite 기반 관계형 데이터베이스
- **로컬 개발**: `.wrangler/state/v3/d1`에 로컬 SQLite 데이터베이스 자동 생성

## 주요 기능

### ✅ 완료된 기능
1. ✅ **모바일 최적화 뷰 모드**: 스마트폰에서 근무표 조회
2. ✅ **편집 모드 비밀번호 보호**: 관리자만 편집 가능
3. ✅ **근무표 조회** (날짜 범위별)
4. ✅ **자동 스케줄 생성**: 조회 범위에 없으면 빈 스케줄 자동 생성
5. ✅ **직원별 캘린더 뷰**: 
   - 월 단위 캘린더 표시 (1일~31일)
   - 직원 검색 및 복수 선택
   - 근무일 하이라이트 (보라색 배경)
   - Outlook 스타일: 같은 날 여러 직원 근무 시 각각 색상 구분
   - 날짜-요일 정합성 보장 (타임존 명시)
   - 선택 직원만 필터링된 상세 근무표
6. ✅ **엑셀 스타일 편집**:
   - 복사/붙여넣기 (Ctrl+C / Ctrl+V)
   - 드래그 선택 (마우스 드래그)
   - 다중 선택 (Ctrl+Click)
   - 되돌리기/다시 실행 (Ctrl+Z / Ctrl+Y)
   - 작업자 삭제 (Delete/Backspace)
7. ✅ **일괄 저장**: 여러 변경사항 한 번에 저장
8. ✅ **담당자별 근무시간 집계**:
   - Day/Night 근무일 수
   - 총 근무일 및 근무시간
   - 클릭하여 정렬 (오름차순/내림차순)
9. ✅ **팀별 색상 구분** (A: 파랑, B: 초록, C: 주황, D: 빨강)
10. ✅ **반응형 디자인**

### API 엔드포인트
- `GET /api/schedules?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`: 기간별 근무표 조회
- `GET /api/schedules/:date/:shift`: 특정 날짜/교대 근무표 조회
- `PUT /api/assignments/:scheduleId/:position`: 근무 배치 업데이트
- `POST /api/schedules`: 새 근무 일정 생성
- `DELETE /api/schedules/:scheduleId`: 근무 일정 삭제
- `GET /api/employees`: 직원 목록 조회
- `POST /api/auth/verify`: 비밀번호 인증

### ⏳ 향후 개선 사항
1. ⏳ 직원 관리 페이지
2. ⏳ 엑셀 내보내기/가져오기
3. ⏳ 비밀번호 변경 기능
4. ⏳ 근무 통계 차트
5. ⏳ 알림 기능 (근무 전날 알림 등)

## 사용자 가이드

### 📱 뷰 모드 사용법 (모바일)

#### 전체 뷰 (날짜 범위 조회)
1. 스마트폰에서 URL 접속
2. "전체" 탭 선택
3. 시작일과 종료일 선택
4. "조회" 버튼 클릭
5. 카드 형식으로 날짜별 근무표 확인

#### 직원별 뷰 (캘린더 형식)
1. "직원별" 탭 선택
2. 조회할 직원 체크박스에서 선택 (복수 선택 가능)
3. 조회할 월 선택 (예: 2026년 1월)
4. "조회" 버튼 클릭
5. **캘린더**에서 근무일 한눈에 확인:
   - 보라색 배경: 선택한 직원의 근무일
   - 파란색 테두리: 오늘 날짜
   - 빨간색 숫자: 일요일
   - 파란색 숫자: 토요일
   - Outlook 스타일: 여러 직원 동시 근무 시 각각 다른 색상 배지로 표시
6. **상세 근무표**에서 해당 날짜의 전체 근무자 확인 (선택 직원 하이라이트)

### 💻 편집 모드 사용법 (데스크톱)

#### 1. 빠른 근무표 작성
```
1. 복사할 셀 클릭 → Ctrl+C
2. 여러 셀 드래그 선택
3. Ctrl+V로 일괄 붙여넣기
4. "모두 저장" 버튼 클릭
```

#### 2. 다중 셀 편집
```
1. 셀 클릭 후 드래그로 영역 선택
2. 또는 Ctrl+클릭으로 개별 선택
3. Delete 키로 일괄 삭제
4. Ctrl+V로 일괄 붙여넣기
```

#### 3. 실수 복구
```
1. Ctrl+Z: 마지막 작업 되돌리기
2. Ctrl+Y: 되돌린 작업 다시 실행
```

#### 4. 근무시간 통계 확인
```
1. 날짜 범위 조회
2. 하단 집계 테이블 확인
3. 헤더 클릭으로 정렬
   - 담당자명
   - 팀
   - Day 근무 일수
   - Night 근무 일수
   - 총 근무일
   - 총 근무시간
```

### 팀 색상 구분
- **Team A**: 파란색 배지
- **Team B**: 초록색 배지
- **Team C**: 주황색 배지
- **Team D**: 빨간색 배지

## 로컬 개발 환경 설정

### 필수 요구사항
- Node.js 18+
- npm

### 설치 및 실행
```bash
# 의존성 설치
cd /home/user/webapp
npm install

# 데이터베이스 마이그레이션 (최초 1회)
npm run db:migrate:local

# 샘플 데이터 삽입 (선택사항)
npm run db:seed

# 빌드
npm run build

# PM2로 개발 서버 시작
pm2 start ecosystem.config.cjs

# 서버 상태 확인
pm2 list

# 로그 확인
pm2 logs webapp --nostream
```

### 데이터베이스 관리
```bash
# 로컬 마이그레이션 적용
npm run db:migrate:local

# 샘플 데이터 삽입
npm run db:seed

# 데이터베이스 리셋 (모든 데이터 삭제 후 재생성)
npm run db:reset

# 로컬 데이터베이스 콘솔
npm run db:console:local
```

## 배포

### GitHub 푸시
```bash
# GitHub 환경 설정 (최초 1회)
# #github 탭에서 GitHub 인증 완료 필요

# 코드 푸시
git push origin main
```

### Cloudflare Pages 배포
```bash
# 1. Cloudflare API 토큰 설정 (최초 1회)
# Deploy 탭에서 API 키 설정 필요

# 2. 프로덕션 데이터베이스 생성 (최초 1회)
npx wrangler d1 create webapp-production

# 3. wrangler.jsonc에 database_id 업데이트

# 4. 프로덕션 마이그레이션 적용
npm run db:migrate:prod

# 5. 배포
npm run deploy:prod
```

### 기술 스택
- **프레임워크**: Hono (경량 웹 프레임워크)
- **런타임**: Cloudflare Workers
- **데이터베이스**: Cloudflare D1 (SQLite)
- **프론트엔드**: Vanilla JavaScript + TailwindCSS
- **아이콘**: Font Awesome
- **HTTP 클라이언트**: Axios
- **빌드 도구**: Vite
- **프로세스 관리**: PM2

### 프로젝트 구조
```
webapp/
├── src/
│   └── index.tsx          # Hono 애플리케이션 (뷰/편집 모드 라우팅)
├── public/
│   └── static/
│       ├── app.js         # 편집 모드 JavaScript
│       └── view.js        # 뷰 모드 JavaScript
├── migrations/
│   └── 0001_initial_schema.sql  # 데이터베이스 스키마
├── dist/                  # 빌드 출력 디렉토리
├── seed.sql              # 샘플 데이터
├── ecosystem.config.cjs  # PM2 설정
├── wrangler.jsonc        # Cloudflare 설정
├── vite.config.ts        # Vite 빌드 설정
├── package.json          # 의존성 및 스크립트
└── README.md             # 프로젝트 문서
```

## 배포 상태
- **플랫폼**: Cloudflare Pages
- **프로덕션 URL**: https://shift-schedule-manager.pages.dev
- **최신 배포**: https://89d4f125.shift-schedule-manager.pages.dev
- **상태**: ✅ 활성화
- **마지막 업데이트**: 2026-01-19

## 스크린샷 및 기능 설명

### 📱 뷰 모드 (모바일)
- 카드 형식 레이아웃
- 날짜별 세로 스크롤
- Day/Night Shift 구분
- 팀 배지 및 포지션별 작업자 표시
- "편집" 버튼으로 편집 모드 전환

### 💻 편집 모드 (데스크톱)
- 가로 테이블 형식
- 날짜별 컬럼 정렬
- Day/Night Shift 행 그룹
- 엑셀 스타일 편집 기능
- 담당자별 근무시간 집계 테이블

### 색상 테마
- Day Shift: 노란색 배경
- Night Shift: 파란색 배경
- Team 배지: A(파랑), B(초록), C(주황), D(빨강)

## 문제 해결

### 서버가 시작되지 않는 경우
```bash
# 포트 3000 정리
npm run clean-port

# PM2 프로세스 확인
pm2 list

# PM2 로그 확인
pm2 logs webapp
```

### 데이터베이스 오류
```bash
# 데이터베이스 리셋
npm run db:reset
```

### 빌드 오류
```bash
# node_modules 재설치
rm -rf node_modules package-lock.json
npm install

# 다시 빌드
npm run build
```

## 보안

### 비밀번호 변경
현재 편집 모드 비밀번호는 `src/index.tsx`의 `ADMIN_PASSWORD` 상수에 하드코딩되어 있습니다.
프로덕션 배포 시 환경변수로 관리하는 것을 권장합니다.

```typescript
// src/index.tsx
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';
```

## 라이센스
MIT License

## 작성자
GenSpark AI - 근무표 관리 시스템 개발

## 버전
v2.1.0 (2026-01-19)
- ✅ 직원별 캘린더 뷰 추가
- ✅ 월 단위 조회 기능 (1일~31일 전체 표시)
- ✅ 직원 복수 선택 기능
- ✅ Outlook 스타일 다중 직원 표시 (색상 구분)
- ✅ 날짜-요일 정합성 보장 (타임존 처리)
- ✅ 뷰 모드에서 전체/직원별 탭 분리

v2.0.0 (2026-01-18)
- 모바일 최적화 뷰 모드 추가
- 편집 모드 비밀번호 보호
- 날짜 범위 버그 수정
- 사용 방법 안내 제거 (저장 버튼만 유지)
