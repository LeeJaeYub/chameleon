// CHAMELEONZ — PWA 설치 조건을 만족시키기 위한 최소한의 서비스워커.
// 오프라인 캐싱은 하지 않습니다 — fetch 이벤트를 그냥 네트워크로 흘려보내기만 합니다.
self.addEventListener('install', function (e) {
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  // 아무것도 가로채지 않음 — 브라우저 기본 동작 그대로.
});
