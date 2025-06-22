const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.ico': 'image/x-icon'
};
const server = http.createServer((req, res) => {
  let filePath = '.' + (req.url === '/' ? '/index.html' : req.url);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, {'Content-Type': mime[ext] || 'text/plain'});
    res.end(data);
  });
});
server.listen(8080, () => console.log('Servidor rodando em http://localhost:8080'));
