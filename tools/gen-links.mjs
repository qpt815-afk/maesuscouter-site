// 짧은 링크 페이지 생성기 — maesuscouter.kr/<채널>/ → (클릭 1건 기록) → Play 스토어(설치 리퍼러 UTM)
//   실행: node tools/gen-links.mjs      (저장소 루트에서)
//   결과: <채널>/index.html 들을 덮어쓴다. links.json 이 정본이고 생성물은 손으로 고치지 않는다.
//
// 동작(생성된 페이지):
//   1) Supabase ms_event 에 {event:'link_click', channel, platform} 1건 INSERT (익명·개인정보 없음, keepalive)
//   2) 150ms 뒤 이동 — Android/데스크톱: Play 스토어 페이지(&referrer=utm_…) · iOS: 웹앱(앱 미출시)
//   3) JS 가 막힌 환경을 위해 본문에 같은 링크를 그대로 둔다
// 설치 리퍼러: Play 는 referrer= 값을 설치 후 앱에 그대로 넘긴다(Install Referrer API). 앱(ping.js)이
//   첫 실행 때 그 값을 읽어 ms_event 'install_referrer' 로 1회 기록 → 주간 리포트의 '설치 출처' 표가 된다.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(readFileSync(join(ROOT, "tools", "links.json"), "utf8"));

function page(ch, L) {
  const utm = `utm_source=${L.source}&utm_medium=${L.medium}&utm_campaign=${L.campaign}`;
  const play = `https://play.google.com/store/apps/details?id=${cfg.package}&referrer=${encodeURIComponent(utm)}`;
  const web = `${cfg.webapp}?${utm}`;
  return `<!doctype html>
<html lang="ko"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="origin">
<title>매수 스카우터 — 앱으로 이동 중</title>
<meta name="description" content="코스피·미국주식 매수 타이밍 점수 앱 '매수 스카우터'(무료)로 이동합니다.">
<style>
  html,body{margin:0;height:100%;background:#0b0d11;color:#e6e9ef;font-family:-apple-system,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif}
  .wrap{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center}
  .logo{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,#16c79a,#0f1f3d)}
  h1{font-size:18px;margin:6px 0 0;font-weight:700}
  p{margin:0;color:#9aa3b2;font-size:14px;line-height:1.5}
  a.btn{display:inline-block;margin-top:8px;padding:12px 20px;border-radius:12px;background:#16c79a;color:#06281f;font-weight:700;text-decoration:none}
  a.alt{color:#9aa3b2;font-size:13px;text-decoration:underline}
</style>
</head><body>
<div class="wrap">
  <div class="logo" aria-hidden="true"></div>
  <h1>매수 스카우터 앱으로 이동 중…</h1>
  <p>코스피·미국주식 매수 타이밍을 0~100 점수로.<br>회원가입 없이 전 기능 무료.</p>
  <a class="btn" id="go" href="${play}" rel="noopener">Google Play에서 받기</a>
  <a class="alt" href="${web}" rel="noopener">앱 설치 없이 웹에서 보기</a>
</div>
<script>
(function () {
  var CH = ${JSON.stringify(ch)};
  var PLAY = ${JSON.stringify(play)};
  var WEB = ${JSON.stringify(web)};
  var ua = navigator.userAgent || "";
  var platform = /android/i.test(ua) ? "android" : /iphone|ipad|ipod/i.test(ua) ? "ios" : "other";
  var dest = platform === "ios" ? WEB : PLAY;       // iOS 앱은 아직 없음 → 웹앱
  try { document.getElementById("go").href = dest; } catch (e) {}
  try {
    var ref = "";
    try { ref = (document.referrer || "").slice(0, 120); } catch (e) {}
    fetch(${JSON.stringify(cfg.supabase_url)} + "/rest/v1/ms_event", {
      method: "POST", keepalive: true,
      headers: { "apikey": ${JSON.stringify(cfg.supabase_key)}, "Content-Type": "application/json", "Prefer": "return=minimal" },
      body: JSON.stringify({ event: "link_click", channel: CH, platform: platform, meta: { ref: ref, lang: (navigator.language || "").slice(0, 8) } })
    }).catch(function () {});
  } catch (e) {}
  setTimeout(function () { location.replace(dest); }, 150);
})();
</script>
</body></html>
`;
}

let n = 0;
for (const [ch, L] of Object.entries(cfg.links)) {
  const dir = join(ROOT, ch);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page(ch, L), "utf8");
  n++;
  console.log(`✓ /${ch}/  →  ${L.source}/${L.medium}/${L.campaign}  (${L.label})`);
}
console.log(`${n}개 생성. 커밋 후 maesuscouter.kr/<채널>/ 로 바로 동작(GitHub Pages).`);
