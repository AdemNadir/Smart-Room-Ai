import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
let checks = 0;

function check(condition, label) {
  checks += 1;
  if (!condition) failures.push(label);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function listFiles(relativeDirectory, extensions) {
  const absolute = path.join(root, relativeDirectory);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) return listFiles(relative, extensions);
    return extensions.includes(path.extname(entry.name)) ? [relative] : [];
  });
}

const sourceFiles = listFiles('src', ['.js', '.jsx', '.css']);
const sourceText = sourceFiles.map((file) => `// ${file}\n${read(file)}`).join('\n');
const apiSource = read('src/services/api.js');
const mockSource = read('src/services/mock.js');
const stringsSource = read('src/strings.js');
const indexSource = read('index.html');
const viteSource = read('vite.config.js');
const packageJson = JSON.parse(read('package.json'));

check(packageJson.name === 'smart-room-ai-frontend', 'package name matches the frontend contract');
for (const script of ['dev', 'build', 'preview', 'check']) {
  check(typeof packageJson.scripts[script] === 'string', `npm script exists: ${script}`);
}
const allowedDependencies = [
  '@fontsource/cormorant-garamond',
  '@fontsource/inter',
  '@fontsource/noto-sans-arabic',
  'react',
  'react-dom',
];
check(
  Object.keys(packageJson.dependencies || {}).every((name) => allowedDependencies.includes(name)),
  'runtime dependencies stay inside the frozen stack',
);
check(
  Object.keys(packageJson.devDependencies || {}).sort().join(',') === '@vitejs/plugin-react,vite',
  'dev dependencies are limited to Vite and its React plugin',
);

check(/<html lang="en">/.test(indexSource), 'index.html sets lang="en"');
check(/name="viewport"/.test(indexSource), 'index.html sets the viewport');
check(/<script type="module" src="\/src\/main\.jsx"><\/script>/.test(indexSource), 'index.html loads only the local module entry');
check(!/<script[^>]*>[^<]+<\/script>/.test(indexSource), 'index.html has no inline script');
check(!/\sstyle\s*=/.test(indexSource), 'index.html has no static style attribute');
check(!/https?:\/\//.test(indexSource), 'index.html has no remote URL');

check(/host:\s*'127\.0\.0\.1'/.test(viteSource), 'dev server binds to 127.0.0.1');
check(/port:\s*5173/.test(viteSource), 'dev server uses port 5173');
check(/target:\s*'http:\/\/127\.0\.0\.1:8000'/.test(viteSource), '/api proxies to the local backend');
check(/outDir:\s*'dist'/.test(viteSource), 'build output is dist');

const forbiddenApis = [
  ['dangerouslySetInnerHTML', 'no dangerouslySetInnerHTML'],
  ['innerHTML', 'no innerHTML'],
  ['outerHTML', 'no outerHTML'],
  ['document.write', 'no document.write'],
  ['localStorage', 'no localStorage auth storage'],
  ['sessionStorage', 'no sessionStorage auth storage'],
];
for (const [needle, label] of forbiddenApis) {
  check(!sourceText.includes(needle), label);
}
check(!/\beval\s*\(/.test(sourceText), 'no eval');
check(!/new\s+Function\s*\(/.test(sourceText), 'no new Function');
check(!/https?:\/\//.test(sourceText), 'no remote URL in application source');
check(!/src\s*=\s*["']https?:/.test(sourceText), 'no remote script or image source');
check(!/url\(\s*["']?https?:/.test(sourceText), 'no remote CSS url');

const fetchFiles = sourceFiles.filter((file) => /fetch\s*\(/.test(read(file)));
check(fetchFiles.length === 1 && fetchFiles[0] === path.join('src', 'services', 'api.js'), 'fetch is centralized in api.js');
check(/credentials:\s*'same-origin'/.test(apiSource), 'fetch uses same-origin credentials');
check(/headers\['X-SmartRoom-Client'\]\s*=\s*'web'/.test(apiSource), 'non-GET requests send the CSRF client header');
check(/method\s*!==\s*'GET'/.test(apiSource), 'the CSRF header is limited to non-GET requests');
check(/headers\['Content-Type'\]\s*=\s*'application\/json'/.test(apiSource), 'JSON requests set the JSON content type');
check(/body\s*!==\s*undefined\s*&&\s*!isForm/.test(apiSource), 'multipart uploads do not set a JSON content type');
check(/setTimeout/.test(apiSource) && /AbortController/.test(apiSource), 'requests have a timeout and abort support');
check(/status === 401 && error\.code === 'not_authenticated'/.test(apiSource), '401 not_authenticated is handled');
check(/code === 'timeout'/.test(apiSource) && /'offline'/.test(apiSource), 'timeout and offline errors are normalized');

const endpoints = [
  '/api/health',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/meta',
  '/api/rooms',
  '/api/assistant/parse',
  '/api/rooms/search',
  '/api/bookings',
  '/api/bookings/mine',
  '/api/admin/bookings',
  '/api/admin/audit',
  '/api/admin/settings',
  '/api/admin/import/preview',
  '/api/admin/metrics',
  '/api/admin/insights',
];
for (const endpoint of endpoints) {
  check(apiSource.includes(endpoint), `API client covers ${endpoint}`);
}
const apiFunctions = [
  'health', 'login', 'logout', 'me', 'meta', 'getRooms', 'parseRequest', 'searchRooms',
  'createBooking', 'myBookings', 'cancelBooking', 'adminBookings', 'approveBooking',
  'rejectBooking', 'audit', 'getSettings', 'patchSettings', 'importPreview',
  'importPublish', 'getMetrics', 'getInsights', 'patchRoom',
];
for (const name of apiFunctions) {
  check(new RegExp(`export (?:async )?function ${name}\\b|export const ${name}\\b`).test(apiSource), `API client exports ${name}`);
  check(new RegExp(`export async function ${name}\\b`).test(mockSource), `mock client exports ${name}`);
}
for (const name of ['setUnauthorizedHandler', 'isMockMode']) {
  check(apiSource.includes(name), `API client exposes ${name}`);
}

check(/export const STRINGS\s*=\s*\{\s*en:/.test(stringsSource), 'strings.js contains a complete English dictionary');
check(/export function t\(/.test(stringsSource), 'strings.js exports t()');
check(/export function uiLanguage\(/.test(stringsSource), 'strings.js exports uiLanguage()');
const requiredStatuses = [
  'available', 'occupied_official', 'booked_extra', 'pending', 'inactive',
  'capacity_too_small', 'wrong_room_type', 'missing_equipment', 'confirmed',
  'cancelled', 'rejected',
];
const requiredErrors = [
  'not_authenticated', 'invalid_credentials', 'forbidden', 'csrf_rejected',
  'room_not_found', 'booking_not_found', 'import_not_found', 'validation_error',
  'booking_conflict', 'room_not_eligible', 'invalid_state', 'cancellation_not_allowed',
  'import_has_errors', 'file_too_large', 'unsupported_file_type', 'too_many_requests',
  'server_error', 'network_error', 'timeout', 'offline', 'unexpected',
];
for (const status of requiredStatuses) {
  check(stringsSource.includes(`'status.${status}':`), `status copy exists: ${status}`);
}
for (const code of requiredErrors) {
  check(stringsSource.includes(`'error.${code}':`), `error copy exists: ${code}`);
}

const definedStringKeys = new Set(
  [...stringsSource.matchAll(/'([A-Za-z0-9_.]+)':/g)].map((match) => match[1]),
);
const usedStringKeys = [...sourceText.matchAll(/\bt\(lang,\s*'([A-Za-z0-9_.]+)'/g)].map((match) => match[1]);
for (const key of new Set(usedStringKeys)) {
  check(definedStringKeys.has(key), `UI string is defined: ${key}`);
}

check((sourceText.match(/dir="auto"/g) || []).length >= 10, 'user, AI, and file text uses dir="auto"');
check(sourceText.includes('aria-live="polite"'), 'result regions announce politely');
check(sourceText.includes('prefers-reduced-motion'), 'reduced motion is respected');
check(!/\.sort\s*\(/.test(sourceText), 'the UI never re-sorts backend result arrays');
check(!/\.reverse\s*\(/.test(sourceText), 'the UI never reverses backend result arrays');
check(!/results\.filter\s*\(/.test(sourceText), 'the UI never filters recommendation results');
check(!/excluded\.filter\s*\(/.test(sourceText), 'the UI never filters excluded rooms');

for (const fixture of [
  'booking_conflict', 'room_not_eligible', 'not_authenticated', 'too_many_requests',
  'network_error', 'import_has_errors', 'evidence', 'day_blocks', 'free_window',
  'working_hours', 'approval_mode', 'publishable',
]) {
  check(mockSource.includes(fixture), `mock mode covers ${fixture}`);
}

const distHtmlPath = path.join(root, 'dist', 'index.html');
if (fs.existsSync(distHtmlPath)) {
  const distHtml = fs.readFileSync(distHtmlPath, 'utf8');
  check(!/<script[^>]+src="https?:/.test(distHtml), 'production HTML has no remote script');
  check(!/<link[^>]+href="https?:/.test(distHtml), 'production HTML has no remote stylesheet');
  check(!/<script[^>]*>[^<]+<\/script>/.test(distHtml), 'production HTML has no inline script');
  const distCss = listFiles('dist/assets', ['.css']).map((file) => read(file)).join('\n');
  check(!/url\(\s*["']?https?:/.test(distCss), 'production CSS has no remote url()');
}

if (failures.length > 0) {
  console.error(`Contract check failed (${failures.length}/${checks}):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Contract check passed: ${checks} checks.`);
