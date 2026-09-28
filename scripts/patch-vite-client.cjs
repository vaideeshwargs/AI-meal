const fs = require('fs');
const path = require('path');

const clientMjsPath = path.join(__dirname, '../node_modules/vite/dist/client/client.mjs');

if (fs.existsSync(clientMjsPath)) {
  let content = fs.readFileSync(clientMjsPath, 'utf8');

  // 1. Disable transport.connect websocket logic
  content = content.replace(
    /async connect\(handlers\) \{[\s\S]*?console\.error\(`\[vite\] failed to connect to websocket \(\$\{e\}\)\. `\);[\s\S]*?throw e;\s*\}\s*\},/g,
    `async connect(handlers) {
        // HMR WebSocket disabled for AI Studio iframe environment
        return;
      },`
  );

  // 2. Remove [vite] connecting... debug log
  content = content.replace(
    /console\.debug\("\[vite\] connecting\.\.\."\);/g,
    '// console.debug("[vite] connecting...");'
  );

  // 3. Silence HMRClient error logger
  content = content.replace(
    /error:\s*\(err\)\s*=>\s*console\.error\("\[vite\]",\s*err\)/g,
    'error: () => {}'
  );

  fs.writeFileSync(clientMjsPath, content, 'utf8');
  console.log('Successfully patched Vite client.mjs to disable websocket and silence errors.');
} else {
  console.log('Vite client.mjs not found, skipping patch.');
}
