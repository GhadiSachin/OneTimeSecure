const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const webDir = path.join(__dirname, 'apps/web');

// Install tailwind
console.log('Installing Tailwind CSS...');
execSync('npm install -D tailwindcss postcss autoprefixer', { cwd: webDir, stdio: 'inherit' });
execSync('npx tailwindcss init -p', { cwd: webDir, stdio: 'inherit' });

// Configure tailwind.config.js
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a192f',
        card: '#112240',
        primary: '#64ffda',
        textMain: '#ccd6f6',
        textMuted: '#8892b0'
      }
    },
  },
  plugins: [],
}
`;
fs.writeFileSync(path.join(webDir, 'tailwind.config.js'), tailwindConfig);

// Create src/index.css
const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0a192f;
  color: #ccd6f6;
  font-family: 'Inter', system-ui, sans-serif;
}
`;
fs.writeFileSync(path.join(webDir, 'src', 'index.css'), cssContent);

// Update main.tsx to import index.css
let mainContent = fs.readFileSync(path.join(webDir, 'src', 'main.tsx'), 'utf8');
mainContent = `import './index.css';\n` + mainContent;
fs.writeFileSync(path.join(webDir, 'src', 'main.tsx'), mainContent);

console.log('Tailwind Setup Complete.');
