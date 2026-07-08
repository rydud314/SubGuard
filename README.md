# SubGuard

구독 서비스 자동결제 알림 웹앱. Next.js 15 (App Router) + Tailwind CSS + Supabase.

## 실행 방법

```bash
npm install
npm run dev
```

`http://localhost:3000` 접속 시 최초 방문이면 온보딩 화면 → 로그인 화면 → 메인 화면 순으로 이동합니다.

## Supabase 설정 (필수)

1. **DB 스키마 생성**: Supabase 대시보드 > SQL Editor에서 [`database/schema.sql`](database/schema.sql) 내용을 실행하세요. `subscriptions` 테이블(무료체험/정기구독 구분 컬럼 포함)과 RLS 정책, Realtime publication이 생성됩니다. 이미 실행한 적이 있어도 다시 실행하면 새 컬럼이 안전하게 추가됩니다.
2. **Google 로그인 활성화**: Supabase 대시보드 > Authentication > Providers > Google을 활성화하고 Google Cloud Console에서 발급한 Client ID/Secret을 등록하세요.
3. **Redirect URL 등록**: Authentication > URL Configuration에 아래 주소를 추가하세요.
   - `http://localhost:3000/auth/callback` (로컬 개발)
   - 배포 도메인의 `/auth/callback` (배포 시)

Supabase 프로젝트 URL과 Publishable Key는 별도 환경 변수 파일 없이 [`src/lib/supabase/client.ts`](src/lib/supabase/client.ts)에 직접 하드코딩되어 있습니다 (`docs/supabase-info.md` 값 기준).

## 폴더 구조

```
src/
  app/
    onboarding/         # 최초 진입 온보딩 화면
    login/               # 구글 로그인 화면
    auth/callback/       # OAuth 콜백 처리
    page.tsx             # 메인 화면 (캘린더뷰)
    register/            # 구독 유형 선택 화면 (무료체험 / 정기구독)
    register/trial/       # 무료 체험 등록 화면
    register/regular/     # 정기 구독 등록 화면
    register/complete/   # 등록 완료 화면
  components/            # Sidebar, MonthCalendar, RegisterModal, SubscriptionDetailModal 등
  data/koreanSubscriptions.ts  # 국내 인기 구독서비스 50종 + 유사도 추천 로직
  hooks/                 # useSession, useSubscriptions (Supabase 연동/실시간 반영/수정/삭제)
  lib/                   # recurrence(결제 주기 계산), format, supabase client
database/schema.sql       # Supabase 테이블/RLS SQL
```

## 핵심 기능

- 구글 소셜 로그인 (Supabase Auth)
- 월~일 기준 월별 캘린더에 구독 서비스 결제일 표시 (주/월/년 단위 반복 결제 지원), 항목에 마우스를 올리면 상세 정보 툴팁, 클릭하면 상세 팝업(편집/삭제)
- 이번 달 구독료 합계, 3일 이내 결제 예정 알림, 무료 체험 종료 임박 알림
- 무료 체험 등록(체험 후 자동 결제 여부에 따라 입력 필드 분기) / 정기 구독 등록 분리된 플로우
- 구독 서비스 이름 입력 시 국내 인기 서비스 50종과의 유사도 비교로 자동 추천
- 결제 금액 3자리 콤마 자동 포맷팅
- Supabase Realtime으로 구독 데이터 변경 시 캘린더 자동 갱신
- 설정 탭에서 로그인 계정 정보 확인, 로그아웃 시 확인 팝업
