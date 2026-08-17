/* 머니머슬 — 접속 위치에 맞는 언어로 보내주는 길잡이.
   Cloudflare가 요청마다 붙여주는 나라 코드(request.cf.country)를 씁니다 — 따로 부르는 API가 없어요.

   순서는 이렇습니다.
     1. 예전에 언어를 직접 고른 적이 있으면 그 언어  (내가 고른 건 위치보다 셉니다)
     2. 접속한 나라에 맞는 언어
     3. 브라우저에 설정된 언어      (나라를 모를 때만 — 사내망·VPN 등)
     4. 그래도 모르면 영어
   번역이 아직 없는 언어(ready:false)로는 보내지 않고 영어로 넘깁니다.

   ※ 아래 LOCALES는 i18n.js의 목록과 같아야 합니다 — tools/audit-locales.js 가 검사합니다. */

const LOCALES = {
  ko: { dir: '',    ready: true  },
  en: { dir: 'en/', ready: true  },
  ja: { dir: 'ja/', ready: true  },
  zh: { dir: 'zh/', ready: false },
  es: { dir: 'es/', ready: false },
  pt: { dir: 'pt/', ready: false },
  vi: { dir: 'vi/', ready: false }
};

const FALLBACK = 'en';
const COOKIE = 'mm_lang';

/* 나라 → 언어. 여기 없는 나라는 전부 영어로 갑니다. */
const BY_COUNTRY = {
  KR: 'ko',
  JP: 'ja',
  // 대만·홍콩·마카오는 번체를 쓰지만, 번체판이 생기기 전까지는 영어보다 간체가 읽기 낫습니다
  CN: 'zh', TW: 'zh', HK: 'zh', MO: 'zh', SG: 'zh',
  VN: 'vi',
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt', GW: 'pt', ST: 'pt', TL: 'pt',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', EC: 'es',
  GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es', SV: 'es', NI: 'es',
  CR: 'es', PA: 'es', UY: 'es', PR: 'es', GQ: 'es'
};

function usable(code) {
  return code && LOCALES[code] && LOCALES[code].ready ? code : null;
}

function fromCookie(request) {
  const raw = request.headers.get('cookie');
  if (!raw) return null;
  const hit = raw.match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([a-z]{2})'));
  return hit ? hit[1] : null;
}

function fromBrowser(request) {
  const raw = request.headers.get('accept-language');
  if (!raw) return null;
  // "ja,en-US;q=0.9" → 앞에서부터 우리가 가진 언어를 찾습니다
  for (const part of raw.split(',')) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (usable(code)) return code;
  }
  return null;
}

function resolve(request) {
  const chosen = usable(fromCookie(request));
  if (chosen) return chosen;

  const country = (request.cf && request.cf.country) || request.headers.get('cf-ipcountry');
  const byCountry = usable(BY_COUNTRY[country]);
  if (byCountry) return byCountry;

  // 나라를 못 읽은 경우에만 브라우저 설정을 봅니다
  if (!country || country === 'XX' || country === 'T1') {
    const byBrowser = fromBrowser(request);
    if (byBrowser) return byBrowser;
  }

  return usable(FALLBACK) || 'ko';
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // 첫 화면으로 들어올 때만 판단합니다 — 파일 하나하나까지 건드릴 일이 아니에요
  const atRoot = url.pathname === '/' || url.pathname === '/index.html';
  const readOnly = request.method === 'GET' || request.method === 'HEAD';
  // ?lang=ko 처럼 언어를 콕 집어 부르면 그대로 보여줍니다 (링크로 공유할 때 필요해요)
  if (!atRoot || !readOnly || url.searchParams.has('lang')) return next();

  const code = resolve(request);
  const dir = LOCALES[code].dir;
  if (!dir) return next();   // 한국어는 여기가 제자리입니다

  const to = new URL('/' + dir, url);
  to.search = url.search;
  return new Response(null, {
    status: 302,
    headers: {
      Location: to.toString(),
      // 사람마다 결과가 달라서 중간에 저장되면 안 됩니다
      'Cache-Control': 'no-store',
      Vary: 'Cookie, Accept-Language, CF-IPCountry'
    }
  });
}
