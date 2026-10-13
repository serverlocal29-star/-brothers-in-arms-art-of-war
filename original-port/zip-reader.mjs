const EOCD = 0x06054b50;
const CENTRAL = 0x02014b50;
const LOCAL = 0x04034b50;

function viewOf(input) {
  if (input instanceof DataView) return input;
  if (input instanceof ArrayBuffer) return new DataView(input);
  if (ArrayBuffer.isView(input)) return new DataView(input.buffer, input.byteOffset, input.byteLength);
  throw new TypeError('Expected ArrayBuffer or typed array');
}

export function listZipEntries(input) {
  const view = viewOf(input);
  const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  const min = Math.max(0, view.byteLength - 65557);
  let eocd = -1;
  for (let p = view.byteLength - 22; p >= min; p--) {
    if (view.getUint32(p, true) === EOCD) { eocd = p; break; }
  }
  if (eocd < 0) throw new Error('No se encontró el directorio ZIP/JAR.');
  const disk = view.getUint16(eocd + 4, true);
  const centralDisk = view.getUint16(eocd + 6, true);
  const countDisk = view.getUint16(eocd + 8, true);
  const count = view.getUint16(eocd + 10, true);
  const centralSize = view.getUint32(eocd + 12, true);
  const centralOffset = view.getUint32(eocd + 16, true);
  const commentLength = view.getUint16(eocd + 20, true);
  if (disk || centralDisk || countDisk !== count) throw new Error('JAR multidisco no compatible.');
  if (eocd + 22 + commentLength > view.byteLength || centralOffset + centralSize > eocd) throw new Error('Directorio ZIP/JAR truncado o inválido.');
  const decoder = new TextDecoder('utf-8');
  const entries = [];
  let p = centralOffset;
  for (let i = 0; i < count; i++) {
    if (p + 46 > view.byteLength || view.getUint32(p, true) !== CENTRAL) throw new Error('Entrada ZIP inválida: ' + i);
    const flags = view.getUint16(p + 8, true);
    const method = view.getUint16(p + 10, true);
    const crc32 = view.getUint32(p + 16, true);
    const compressedSize = view.getUint32(p + 20, true);
    const uncompressedSize = view.getUint32(p + 24, true);
    const nameLength = view.getUint16(p + 28, true);
    const extraLength = view.getUint16(p + 30, true);
    const entryCommentLength = view.getUint16(p + 32, true);
    const localOffset = view.getUint32(p + 42, true);
    const end = p + 46 + nameLength + extraLength + entryCommentLength;
    if (end > view.byteLength) throw new Error('Metadatos ZIP truncados en entrada ' + i + '.');
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLength));
    if (flags & 1) throw new Error('La entrada ' + name + ' está cifrada y no se puede leer en el navegador.');
    if (compressedSize === 0xffffffff || uncompressedSize === 0xffffffff || localOffset === 0xffffffff) throw new Error('Este JAR usa ZIP64, aún no compatible.');
    entries.push({ name, flags, method, crc32, compressedSize, uncompressedSize, localOffset });
    p = end;
  }
  if (p > centralOffset + centralSize) throw new Error('El directorio ZIP contiene entradas fuera de su límite.');
  return entries;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export async function extractZipEntry(input, entry) {
  const view = viewOf(input);
  const bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  const p = entry.localOffset;
  if (p + 30 > view.byteLength || view.getUint32(p, true) !== LOCAL) throw new Error('Cabecera local inválida: ' + entry.name);
  const nameLength = view.getUint16(p + 26, true);
  const extraLength = view.getUint16(p + 28, true);
  const start = p + 30 + nameLength + extraLength;
  const end = start + entry.compressedSize;
  if (end > view.byteLength) throw new Error('Datos truncados: ' + entry.name);
  const compressed = bytes.slice(start, end);
  let output;
  if (entry.method === 0) output = compressed;
  else if (entry.method === 8) {
    if (typeof DecompressionStream === 'undefined') throw new Error('Este navegador no permite descomprimir entradas DEFLATE. Actualiza el navegador e inténtalo de nuevo.');
    let stream;
    try { stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw')); }
    catch { throw new Error('Este navegador no admite DEFLATE-RAW, necesario para leer este JAR.'); }
    output = new Uint8Array(await new Response(stream).arrayBuffer());
  } else throw new Error('Método ZIP ' + entry.method + ' no compatible en ' + entry.name + '.');
  if (output.byteLength !== entry.uncompressedSize) throw new Error('Tamaño incorrecto al leer ' + entry.name + '.');
  if (crc32(output) !== entry.crc32) throw new Error('La comprobación CRC falló en ' + entry.name + '.');
  return output;
}
