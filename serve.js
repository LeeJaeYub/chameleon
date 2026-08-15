// 로컬 미리보기용 정적 서버. 배포에는 필요 없습니다.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'money-muscle');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, rel === '/' ? 'index.html' : rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'Content-Type': (TYPES[path.extname(file)] || 'text/plain') + '; charset=utf-8' });
    res.end(buf);
  });
}).listen(5173, () => console.log('http://localhost:5173'));
