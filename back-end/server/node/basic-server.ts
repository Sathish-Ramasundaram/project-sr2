import http, { IncomingMessage, ServerResponse } from 'http';
import { promises as fs } from 'fs';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';

const port: number = 4000;
const notesFilePath = path.join(__dirname, 'notes.txt');
const streamFilePath = path.join(__dirname, 'stream-demo.txt');

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello from Node.js HTTP module');
    return;
  }

  if (req.url === '/about') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ page: 'about', app: 'node-core-lab' }));
    return;
  }

  if (req.url === '/fs/write') {
    const message = `New note written at ${new Date().toISOString()}\n`;

    fs.appendFile(notesFilePath, message, 'utf8')
      .then(() => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Note saved in notes.txt');
      })
      .catch((error: unknown) => {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Failed to write file: ${String(error)}`);
      });
    return;
  }

  if (req.url === '/fs/read') {
    fs.readFile(notesFilePath, 'utf8')
      .then((fileContent) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(fileContent || 'notes.txt is empty');
      })
      .catch((error: NodeJS.ErrnoException) => {
        if (error.code === 'ENOENT') {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('notes.txt does not exist yet. Open /fs/write first.');
          return;
        }
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Failed to read file: ${error.message}`);
      });
    return;
  }

  if (req.url === '/path/info') {
    const pathInfo = {
      currentFile: __filename,
      currentDirectory: __dirname,
      notesFilePath,
      fileNameOnly: path.basename(notesFilePath),
      fileExtension: path.extname(notesFilePath),
      parentDirectory: path.dirname(notesFilePath),
      joinedExample: path.join(__dirname, 'logs', 'app.log'),
      resolvedExample: path.resolve('notes.txt'),
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(pathInfo, null, 2));
    return;
  }

  if (req.url === '/stream/write') {
    const writer = createWriteStream(streamFilePath, { encoding: 'utf8' });
    let lineNumber = 1;

    const writeChunk = () => {
      let canContinue = true;

      while (lineNumber <= 5000 && canContinue) {
        canContinue = writer.write(`Stream line ${lineNumber}\n`);
        lineNumber += 1;
      }

      if (lineNumber <= 5000) {
        writer.once('drain', writeChunk);
      } else {
        writer.end();
      }
    };

    writer.on('finish', () => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('stream-demo.txt created with 5000 lines using write stream.');
    });

    writer.on('error', (error: Error) => {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Stream write failed: ${error.message}`);
    });

    writeChunk();
    return;
  }

  if (req.url === '/stream/read') {
    fs.access(streamFilePath)
      .then(() => {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        const reader = createReadStream(streamFilePath, { encoding: 'utf8' });
        reader.on('error', (error: Error) => {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Stream read failed: ${error.message}`);
        });
        reader.pipe(res);
      })
      .catch(() => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('stream-demo.txt does not exist yet. Open /stream/write first.');
      });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Route not found');
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
