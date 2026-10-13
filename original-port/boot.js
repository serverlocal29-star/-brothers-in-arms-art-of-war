import { listZipEntries, extractZipEntry } from './zip-reader.mjs';

const canvas = document.querySelector('#viewport');
const context = canvas.getContext('2d', { alpha: false });
const fileInput = document.querySelector('#jar-file');
const pickButton = document.querySelector('#pick-jar');
const status = document.querySelector('#status');
const details = document.querySelector('#details');
const resourceList = document.querySelector('#resources');
const canvasLabel = document.querySelector('#canvas-label');

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
async function loadJar(file) {
  if (!file) return;
  pickButton.disabled = true;
  setStatus('Leyendo el JAR localmente…');
  details.hidden = true;
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
    details.hidden = false;
    document.querySelector('#midlet-name').textContent = midlet;
    document.querySelector('#midlet-version').textContent = version;
    document.querySelector('#entry-count').textContent = entries.length + ' entradas ZIP';
    document.querySelector('#jar-size').textContent = (file.size / 1024).toFixed(1) + ' KB';
    setStatus('JAR leído correctamente en este dispositivo. No se ha subido a ningún servidor.', 'success');
  } catch (error) {
    drawBootScreen('BOOT / READY', 'Selecciona el JAR original para comprobar los recursos locales.');
    setStatus(error instanceof Error ? error.message : 'No se pudo leer el JAR.', 'error');
  } finally {
    pickButton.disabled = false;
  }
}

pickButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => loadJar(fileInput.files?.[0]));
drawBootScreen('NATIVE WEB BOOT', 'Carga tu archivo JAR original para validar sus recursos y mostrar su pantalla inicial.');
setStatus('Port nativo iniciado. Esperando el JAR original.');
