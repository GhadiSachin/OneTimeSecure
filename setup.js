const fs = require('fs');
const path = require('path');

const files = {
  'apps/api/package.json': `{
    "name": "@onetime/api",
    "version": "1.0.0",
    "scripts": { "build": "tsc", "start": "node dist/index.js", "dev": "ts-node src/index.ts" },
    "dependencies": { "fastify": "^4.26.1" },
    "devDependencies": { "typescript": "^5.0.0", "@types/node": "^20.0.0", "ts-node": "^10.9.2" }
  }`,
  'apps/api/tsconfig.json': `{
    "compilerOptions": {
      "target": "ESNext",
      "module": "CommonJS",
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true
    }
  }`,
  'apps/api/src/index.ts': `import Fastify from 'fastify';
const fastify = Fastify({ logger: true });
fastify.get('/', async () => { return { status: 'ok' } });
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();`,
  'apps/web/package.json': `{
    "name": "@onetime/web",
    "version": "0.0.0",
    "type": "module",
    "scripts": { "dev": "vite", "build": "tsc && vite build", "preview": "vite preview" },
    "dependencies": { "react": "^18.2.0", "react-dom": "^18.2.0" },
    "devDependencies": { "vite": "^5.1.0", "typescript": "^5.2.2", "@types/react": "^18.2.55", "@types/react-dom": "^18.2.19", "@vitejs/plugin-react": "^4.2.1" }
  }`,
  'apps/web/vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });`,
  'apps/web/tsconfig.json': `{
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }`,
  'apps/web/tsconfig.node.json': `{
    "compilerOptions": {
      "composite": true,
      "skipLibCheck": true,
      "module": "ESNext",
      "moduleResolution": "bundler",
      "allowSyntheticDefaultImports": true,
      "strict": true
    },
    "include": ["vite.config.ts"]
  }`,
  'apps/web/index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OneTime Secure</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  'apps/web/src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
  'apps/web/src/App.tsx': `import React from 'react'
function App() {
  return (
    <div>
      <h1>OneTime Secure</h1>
      <p>Zero-knowledge secret sharing.</p>
    </div>
  )
}
export default App`,
  'packages/shared/package.json': `{ "name": "@onetime/shared", "version": "1.0.0", "main": "index.js" }`,
  'packages/crypto/package.json': `{ "name": "@onetime/crypto", "version": "1.0.0", "main": "index.ts" }`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
}
console.log("Scaffolding complete.");
