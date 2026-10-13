import { listZipEntries, extractZipEntry } from './zip-reader.mjs';
import { scanEmbeddedPngs } from './embedded-image-scan.mjs';
import { OriginalInputAdapter } from './input-adapter.js';

const canvas = document.querySelector('#viewport');
const context = canvas.getContext('2d', { alpha: false });
const fileInput = document.querySelector('#jar-file');
const pickButton = document.querySelector('#pick-jar');
const status = document.querySelector('#status');
const details = document.querySelector('#details');
const resourceList = document.querySelector('#resources');
const canvasLabel = document.querySelector('#canvas-label');
const imageGallery = document.querySelector('#image-gallery');
const touchControls = document.querySelector('#touch-controls');
const touchToggle = document.querySelector('#touch-toggle');
const inputAdapter = new OriginalInputAdapter(
  key => window.dispatchEvent(new CustomEvent('original-port:keydown', { detail: { key } })),
  key => window.dispatchEvent(new CustomEvent('original-port:keyup', { detail: { key } }))
);
let imageObjectUrls = [];

context.imageSmoothingEnabled = false;
function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(/\s+/); let line = '', row = 0;
  for (const word of words) {
    const next = line ? line + ' ' + word : word;
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, y + row++ * lineHeight); line = word;
    } else line = next;
  }
  if (line) context.fillText(line, x, y + row * lineHeight);
}
function drawBootScreen(title, subtitle) {
  context.fillStyle = '#0b0d0b'; context.fillRect(0, 0, 320, 250);
  context.fillStyle = '#c8b77d'; context.fillRect(18, 18, 3, 214);
  context.fillStyle = '#eee9dc'; context.font = 'bold 19px system-ui, sans-serif';
  context.fillText('BROTHERS IN ARMS', 32, 58);
  context.font = 'bold 16px system-ui, sans-serif'; context.fillText('ART OF WAR', 32, 81);
  context.fillStyle = '#a8aa9e'; context.font = '11px system-ui, sans-serif';
  wrapText(subtitle, 32, 120, 270, 17);
  context.fillStyle = '#c8b77d'; context.font = '10px ui-monospace, monospace'; context.fillText(title, 32, 220);
}
function setStatus(message, kind = '') {
  status.textContent = message;
  status.dataset.kind = kind;
}
function showResources(entries) {
  resourceList.replaceChildren();
  const important = ['splash.png','map','phy','script','sence','sound','spr1','spr2','spr3','spr4','tileset','p','dataIGP','comm'];
  const found = new Map(entries.map(entry => [entry.name, entry]));
  for (const name of important) {
    const entry = found.get(name);
    const li = document.createElement('li');
    const label = document.createElement('span'); label.textContent = name;
    const value = document.createElement('span'); value.className = 'resource-size';
    value.textContent = entry ? (entry.uncompressedSize / 1024).toFixed(1) + ' KB' : 'no encontrado';
    li.append(label, value); resourceList.append(li);
  }
}
function clearGallery() {
  for (const url of imageObjectUrls) URL.revokeObjectURL(url);
  imageObjectUrls = [];
  imageGallery.replaceChildren();
}
async function inspectEmbeddedImages(fileBytes, entries) {
  clearGallery();
  const candidateNames = new Set(['dataIGP','spr1','spr2','spr3','spr4','tileset','map','comm','p','sence']);
  const payloads = [];
  for (const entry of entries) {
    if (!candidateNames.has(entry.name)) continue;
    payloads.push({ name: entry.name, bytes: new Uint8Array(await extractZipEntry(fileBytes, entry)) });
  }
  const candidates = scanEmbeddedPngs(payloads);
  let shown = 0;
  for (const candidate of candidates) {
    if (shown >= 48) break;
    try {
      const blob = new Blob([candidate.bytes], { type: 'image/png' });
      const bitmap = await createImageBitmap(blob);
      const url = URL.createObjectURL(blob);
      imageObjectUrls.push(url);
      const card = document.createElement('article');
      card.className = 'image-card';
      const image = document.createElement('img');
      image.src = url;
      image.alt = 'PNG incrustado detectado en ' + candidate.source;
      image.loading = 'lazy';
      const label = document.createElement('div');
      label.className = 'image-meta';
      label.textContent = candidate.source + ' · ' + candidate.width + '×' + candidate.height + ' · offset ' + candidate.offset;
      card.append(image, label);
      imageGallery.append(card);
      bitmap.close?.();
      shown++;
    } catch {
      // A matching signature is not enough: only browser-decodable PNGs are shown.
    }
  }
  if (!shown) {
    const note = document.createElement('p');
    note.className = 'muted';
    note.textContent = 'No se encontraron PNG completos dentro de los recursos binarios inspeccionados. Esto no significa que no haya sprites: pueden estar codificados en formatos propios.';
    imageGallery.append(note);
  }
  return shown;
}
async function loadJar(file) {
  if (!file) return;
  pickButton.disabled = true;
  setStatus('Leyendo el JAR localmente…');
  details.hidden = true;
  clearGallery();
  try {
    if (!/\.jar$/i.test(file.name)) throw new Error('Selecciona el archivo .jar original.');
    const bytes = await file.arrayBuffer();
    const entries = listZipEntries(bytes);
    const find = name => entries.find(entry => entry.name.toLowerCase() === name.toLowerCase());
    const manifestEntry = find('META-INF/MANIFEST.MF');
    const splashEntry = find('splash.png');
    if (!manifestEntry || !splashEntry) throw new Error('El archivo no parece ser la versión esperada: falta MANIFEST.MF o splash.png.');
    const manifest = new TextDecoder().decode(await extractZipEntry(bytes, manifestEntry));
    const midlet = manifest.match(/^MIDlet-1:\s*([^,\r\n]+)/mi)?.[1]?.trim() || 'MIDlet Java ME';
    const version = manifest.match(/^MIDlet-Version:\s*([^\r\n]+)/mi)?.[1]?.trim() || 'versión no identificada';
    const splashBytes = await extractZipEntry(bytes, splashEntry);
    const bitmap = await createImageBitmap(new Blob([splashBytes], { type: 'image/png' }));
    context.fillStyle = '#000'; context.fillRect(0, 0, 320, 250);
    context.drawImage(bitmap, 0, 0, 320, 250); bitmap.close?.();
    canvasLabel.textContent = 'Splash original extraído en memoria del JAR seleccionado';
    showResources(entries);
    const embeddedCount = await inspectEmbeddedImages(bytes, entries);
    document.querySelector('#embedded-count').textContent = embeddedCount + ' imágenes PNG válidas';
    details.hidden = false;
    document.querySelector('#midlet-name').textContent = midlet;
    document.querySelector('#midlet-version').textContent = version;
    document.querySelector('#entry-count').textContent = entries.length + ' entradas ZIP';
    document.querySelector('#jar-size').textContent = (file.size / 1024).toFixed(1) + ' KB';
    setStatus('JAR leído correctamente. ' + embeddedCount + ' PNG incrustados se pudieron decodificar; todo sigue local en este dispositivo.', 'success');
  } catch (error) {
    drawBootScreen('BOOT / READY', 'Selecciona el JAR original para comprobar los recursos locales.');
    setStatus(error instanceof Error ? error.message : 'No se pudo leer el JAR.', 'error');
  } finally {
    pickButton.disabled = false;
  }
}

// Touch input emits normalized original-keypad events for the gameplay runtime to consume.
// The current page is still a resource/boot diagnostic, so these events do not move a player yet.
function syncTouchVisibility() {
  touchControls.hidden = !touchToggle.checked;
}
touchToggle.addEventListener('change', syncTouchVisibility);
syncTouchVisibility();
touchControls.querySelectorAll('[data-action]').forEach(button => {
  const action = button.dataset.action;
  const press = event => {
    event.preventDefault();
    inputAdapter.setAction(action, true);
    try { button.setPointerCapture(event.pointerId); } catch {}
  };
  const release = event => {
    event.preventDefault();
    inputAdapter.setAction(action, false);
  };
  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', () => inputAdapter.setAction(action, false));
  button.addEventListener('contextmenu', event => event.preventDefault());
});
window.addEventListener('blur', () => inputAdapter.releaseAll());
document.addEventListener('visibilitychange', () => { if (document.hidden) inputAdapter.releaseAll(); });
pickButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => loadJar(fileInput.files?.[0]));
drawBootScreen('NATIVE WEB BOOT', 'Carga tu archivo JAR original para validar sus recursos y mostrar su pantalla inicial.');
setStatus('Port nativo iniciado. Controles táctiles conectados como eventos de entrada; la lógica de juego aún no está portada. Esperando el JAR original.');
