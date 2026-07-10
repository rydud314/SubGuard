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

Supabase 프로젝트 URL과 Publishable Key는 별도 환경 변수 파일 없이 [`src/lib/supabase/client.ts`](src/lib/supabase/client.ts)에 직접 하드코딩되어 있습니다 (`docs/supabase-info.md` 값 기준). 이 키는 공개되어도 안전한 anon 키라서 하드코딩했습니다.

## 결제일 알림 설정 (필수 — 알림 기능을 쓰려면)

구독 서비스 상세 팝업에서 "결제 알림"을 켜두면, 결제(또는 무료체험 종료)일 3일 전과 1일 전에 **이메일**과, 브라우저에서 알림을 허용한 사용자에게는 **브라우저 푸시**로도 한 번씩 알려줍니다. 두 채널 모두 Vercel Cron이 매일 서버에서 실행하는 `/api/cron/notify`가 처리하며, 서로 독립적으로 발송 여부를 기록하기 때문에 한쪽이 실패해도 다른 쪽엔 영향이 없습니다.

⚠️ 아래 4개는 **진짜 비밀값**이라 (누구나 봐도 되는 Supabase anon 키·VAPID 공개키와 다르게) 절대 소스코드에 하드코딩하지 않았습니다. **Vercel 프로젝트 설정 > Environment Variables**에 등록해야 알림이 실제로 발송됩니다.

| 이름 | 값을 구하는 방법 |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 대시보드 > Project Settings > API > `service_role` 키(비밀) 복사 |
| `RESEND_API_KEY` | [resend.com](https://resend.com) 가입 후 API Keys 메뉴에서 발급 (무료 플랜으로 충분) |
| `CRON_SECRET` | 아무 임의의 긴 문자열을 직접 정해서 입력 (Vercel이 Cron 호출 시 같은 값을 자동으로 `Authorization` 헤더에 넣어 인증함) |
| `VAPID_PRIVATE_KEY` | 브라우저 푸시 알림 서명용 개인키. 아래 값을 그대로 등록하면 됩니다 (이미 생성해둔 키). |

```
VAPID_PRIVATE_KEY=o4TSdg9X6WBvKGjTjhwd46mWlaITbSJMWPe_PobxWZo
```

(위 개인키와 짝이 되는 공개키는 `src/hooks/usePushNotifications.ts`와 `src/app/api/cron/notify/route.ts`에 이미 하드코딩되어 있습니다 — VAPID 공개키는 브라우저에 그대로 노출되는 게 정상이라 anon 키처럼 공개해도 안전합니다. 새 키 쌍이 필요하면 `npx web-push generate-vapid-keys`로 새로 만들어서 두 파일의 공개키와 Vercel의 `VAPID_PRIVATE_KEY`를 함께 교체하세요.)

등록 후 재배포하면 [`vercel.json`](vercel.json)에 설정된 스케줄(매일 UTC 00:00 = 한국시간 오전 9시)대로 자동 발송됩니다. 로컬 개발(`npm run dev`)에서는 이 환경 변수가 없어도 나머지 기능은 그대로 동작하고, 알림 발송만 비활성 상태로 남습니다.

브라우저 푸시는 사이드바 "설정" 팝업 안의 "브라우저 알림 켜기" 버튼으로 사용자가 직접 켜야 합니다 (기기/브라우저별로 따로 허용 필요, 아이폰 사파리는 PWA 설치 없이는 미지원).

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
    api/cron/notify/     # 매일 실행되는 결제일 이메일·푸시 알림 발송 (Vercel Cron)
  components/            # Sidebar, MonthCalendar, RegisterModal, SubscriptionDetailModal 등
  data/koreanSubscriptions.ts  # 국내 인기 구독서비스 50종 + 유사도 추천 로직
  hooks/                 # useSession, useSubscriptions, usePushNotifications
  lib/                   # recurrence(결제 주기 계산), format, supabase client
public/sw.js              # 브라우저 푸시 알림 서비스워커
database/schema.sql       # Supabase 테이블/RLS SQL
vercel.json               # 알림 Cron 스케줄
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
- 구독 서비스별 결제 알림 on/off 토글 + 결제 3일 전·1일 전 이메일 알림 (Vercel Cron + Resend)
- 브라우저 푸시 알림 (Web Push, 기기별 opt-in) — 이메일과 별도로 3일 전·1일 전에 발송
