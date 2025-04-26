const http = require('http');
const fs = require('fs');
const path = require('path');

// Set the directory for static files
const publicDir = path.join(__dirname, 'public');

// Function to serve files
function serveFile(res, filePath, contentType, statusCode = 200) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 - Internal Server Error');
    } else {
      res.writeHead(statusCode, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

// Basic MIME type map
const mimeTypes = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon'
};

// Create server
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  let filePath = '';

  if (req.url === '/') {
    filePath = path.join(publicDir, 'index.html');
  } else {
    // Prevent directory traversal attacks
    const safePath = path.normalize(req.url).replace(/^(\.\.[\/\\])+/, '');
    filePath = path.join(publicDir, safePath);
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      serveFile(res, path.join(publicDir, '404.html'), 'text/html', 404);
    } else {
      serveFile(res, filePath, contentType);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
