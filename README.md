# 근무표 관리 시스템

## 프로젝트 개요
- **이름**: 근무표 관리 시스템 (Work Schedule Management System)
- **목표**: Day/Night 교대 근무 일정을 효율적으로 관리하고 시각화하는 웹 애플리케이션
- **주요 기능**:
  - 캘린더 형식의 근무표 조회 (날짜별, 교대별)
  - Day Shift / Night Shift 구분 표시
  - 팀별 색상 구분 (Team A, B, C, D)
  - 포지션별 근무자 배치 (Backend, Front#BT1/BT2/WT/IM)
  - 근무자 정보 수정 기능
  - 날짜 범위 필터링

## URL
- **로컬 개발 서버**: https://3000-if753wgvrwwx1hi4nxfk9-d0b9e1e2.sandbox.novita.ai
- **API 엔드포인트**: `/api/schedules`, `/api/assignments`, `/api/employees`

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

## 주요 기능 및 API

### 완료된 기능
1. ✅ 근무표 조회 (날짜 범위별)
2. ✅ 날짜 범위 조회 시 빈 스케줄 자동 생성 (2월 28일까지도 조회 가능)
3. ✅ Day/Night 교대별 근무표 표시
4. ✅ 팀별 색상 구분 (A: 파랑, B: 초록, C: 주황, D: 빨강)
5. ✅ 포지션별 근무자 배치 현황 표시
6. ✅ 근무자 정보 수정 (클릭하여 수정)
7. ✅ 복사/붙여넣기 기능 (우클릭으로 복사, 좌클릭으로 붙여넣기)
8. ✅ 반응형 테이블 레이아웃

### API 엔드포인트
- `GET /api/schedules?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`: 기간별 근무표 조회
- `GET /api/schedules/:date/:shift`: 특정 날짜/교대 근무표 조회
- `PUT /api/assignments/:scheduleId/:position`: 근무 배치 업데이트
- `POST /api/schedules`: 새 근무 일정 생성
- `DELETE /api/schedules/:scheduleId`: 근무 일정 삭제
- `GET /api/employees`: 직원 목록 조회

### 아직 구현되지 않은 기능
1. ⏳ 새 근무 일정 추가 UI
2. ⏳ 근무 일정 삭제 UI
3. ⏳ 직원 관리 페이지
4. ⏳ 근무 통계 및 리포트
5. ⏳ 엑셀 내보내기/가져오기
6. ⏳ 사용자 인증 및 권한 관리

### 다음 개발 단계 추천
1. **근무 일정 추가/삭제 UI 구현**: 사용자가 웹에서 직접 새 일정을 생성하거나 삭제할 수 있는 기능
2. **직원 관리 기능**: 직원 목록 관리, 추가, 삭제, 수정
3. **근무 통계**: 직원별 근무 일수, 팀별 근무 현황 등 통계 기능
4. **캘린더 뷰 개선**: 월간/주간 보기, 드래그 앤 드롭으로 근무자 배치
5. **알림 기능**: 근무 시작 전 알림, 교대 변경 알림

## 사용자 가이드

### 근무표 조회하기
1. 메인 페이지에서 시작일과 종료일을 선택합니다
2. "조회" 버튼을 클릭하면 해당 기간의 근무표가 표시됩니다
3. Day Shift (05:30~18:00)와 Night Shift (17:30~06:00)가 구분되어 표시됩니다
4. 조회한 날짜 범위에 스케줄이 없으면 자동으로 빈 스케줄이 생성됩니다

### 근무자 정보 수정하기

#### 방법 1: 복사/붙여넣기 (추천)
1. **복사**: 복사하고 싶은 셀을 **우클릭**합니다
   - 화면 상단에 복사 완료 메시지가 표시됩니다
2. **붙여넣기**: 붙여넣고 싶은 셀을 **좌클릭**합니다
   - 복사한 직원 이름과 팀이 자동으로 입력됩니다
3. 같은 작업자를 여러 날짜에 빠르게 배치할 수 있습니다

#### 방법 2: 직접 수정
1. **Shift 키를 누른 채 셀을 좌클릭**합니다
2. 직원 이름을 입력하는 프롬프트가 나타납니다
3. 팀 정보를 입력하는 프롬프트가 나타납니다
4. 확인을 누르면 자동으로 업데이트됩니다

#### 방법 3: 복사 데이터가 없을 때
1. 복사한 데이터가 없는 상태에서 셀을 좌클릭하면 자동으로 직접 수정 모드로 전환됩니다

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

### Cloudflare Pages 배포
```bash
# Cloudflare API 토큰 설정 (최초 1회)
# Deploy 탭에서 API 키 설정 필요

# 프로덕션 데이터베이스 생성 (최초 1회)
npx wrangler d1 create webapp-production

# wrangler.jsonc에 database_id 업데이트

# 프로덕션 마이그레이션 적용
npm run db:migrate:prod

# 배포
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
│   └── index.tsx          # Hono 애플리케이션 메인 파일
├── public/
│   └── static/
│       └── app.js         # 프론트엔드 JavaScript
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
- **플랫폼**: Cloudflare Pages (준비 완료)
- **상태**: ✅ 로컬 개발 환경 실행 중
- **마지막 업데이트**: 2026-01-18

## 스크린샷 및 기능 설명

### 주요 화면 구성
1. **헤더 섹션**: 제목과 설명
2. **필터 섹션**: 시작일/종료일 선택 및 조회 버튼
3. **근무표 테이블**: 
   - 날짜별 세로 컬럼
   - Day/Night 교대별 행 그룹
   - 포지션별 상세 행
   - 팀 배지 및 직원 이름 표시

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

## 라이센스
MIT License

## 작성자
GenSpark AI - 근무표 관리 시스템 개발

## 버전
v1.0.0 (2026-01-18)
