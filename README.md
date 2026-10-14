# maesuscouter-site — maesuscouter.kr

GitHub Pages 로 서비스되는 랜딩 페이지 + **짧은 링크(채널 추적)** 저장소.

## 짧은 링크 (2026-10-14)
`maesuscouter.kr/<채널>/` 로 들어오면 클릭 1건을 Supabase `ms_event` 에 익명 기록한 뒤
Play 스토어로 보낸다(`&referrer=utm_source…` → 설치 후 앱이 Install Referrer 로 읽어 설치 출처 집계).
iOS 는 앱이 없어 웹앱으로 보낸다.

| 경로 | 쓰는 곳 |
|---|---|
| `/yt/` | 유튜브 쇼츠 — 영상 안 워터마크·설명란 footer |
| `/ytc/` | 유튜브 채널 프로필 링크 |
| `/ytl/` | 유튜브 롱폼 설명란 |
| `/blog/` | 네이버 블로그 본문·공지·위젯 |
| `/ts/` `/th/` `/x/` `/cm/` | 티스토리 · 스레드 · X · 커뮤니티 |
| `/web/` | 웹앱 안 '앱으로 알림 받기' 버튼 |
| `/app/` | 그 밖의 모든 곳 |

정본은 `tools/links.json`. 채널을 추가·수정하면 `node tools/gen-links.mjs` 로 페이지를 다시 만들고 커밋한다
(생성된 `<채널>/index.html` 은 손으로 고치지 않는다). 랜딩 페이지의 Play 버튼 3개도 `referrer=utm_…`(header/hero/band)를 단다.
