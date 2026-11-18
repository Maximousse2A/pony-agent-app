// A portable presentation also works from a USB stick or a Pages subdirectory.
import { readFile, writeFile, unlink, rmdir } from 'node:fs/promises';
const entry = new URL('../dist/index.html', import.meta.url);
let html = await readFile(entry, 'utf8');
for (const [tag, path] of [...html.matchAll(/<(?:script[^>]*src="([^"]+)"[^>]*><\/script>|link[^>]*href="([^"]+\.css)"[^>]*>)/g)].map(([tag, js, css]) => [tag, js || css])) {
  const asset = new URL(path, entry);
  const content = await readFile(asset, 'utf8');
  const wrapped = path.endsWith('.css') ? '<style>' + content + '</style>' : '<script type="module">' + content.replace(/<\/script/gi, '<\\/script') + '</script>';
  html = html.replace(tag, () => wrapped);
  await unlink(asset);
}
// Keep the license with the distributable single-file copy.
const leafletLicense = await readFile(new URL('../vendor/leaflet/LICENSE', import.meta.url), 'utf8');
html = html.replace('</head>', () => '<!-- Leaflet 1.9.4\n' + leafletLicense + '\n-->\n</head>');
await writeFile(entry, html);
await rmdir(new URL('assets/',entry)).catch(e => { if (e.code !== 'ENOTEMPTY' && e.code !== 'ENOENT') throw e; });
