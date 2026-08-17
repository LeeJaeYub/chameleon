// 로컬 미리보기용 정적 서버. 배포에는 필요 없습니다.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'money-muscle');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, rel === '/' ? 'index.html' : rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, buf) => {
    // 배포판(Cloudflare Pages)은 /en/ 같은 폴더 경로에 자동으로 index.html을 찾아줍니다.
    // 이 서버도 같은 동작을 흉내 내야 언어판 폴더를 로컬에서 미리 볼 수 있어요.
    if (err && rel.endsWith('/')) {
      file = path.join(file, 'index.html');
      fs.readFile(file, (err2, buf2) => {
        if (err2) { res.writeHead(404).end('not found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(buf2);
      });
      return;
    }
    if (err) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'Content-Type': (TYPES[path.extname(file)] || 'text/plain') + '; charset=utf-8' });
    res.end(buf);
  });
}).listen(5173, () => console.log('http://localhost:5173'));
