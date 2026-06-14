import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = spawn('node', [path.join(__dirname, 'index.js')], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let requestData = JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "prompts/list",
  params: {}
}) + '\n';

server.stdout.on('data', (data) => {
  console.log(`Received: ${data}`);
  server.kill();
});

server.stdin.write(requestData);
