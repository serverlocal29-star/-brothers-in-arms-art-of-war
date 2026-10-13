import test from 'node:test';
import assert from 'node:assert/strict';
import { listZipEntries, extractZipEntry } from './zip-reader.mjs';

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function makeStoredZip(items) {
  const encoder = new TextEncoder();
  const locals = [], centrals = [];
  let offset = 0;
  for (const [name, text] of items) {
    const n = encoder.encode(name), data = encoder.encode(text), crc = crc32(data);
    const local = new Uint8Array(30 + n.length + data.length), lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0, true);
    lv.setUint16(8, 0, true); lv.setUint32(14, crc, true); lv.setUint32(18, data.length, true); lv.setUint32(22, data.length, true);
    lv.setUint16(26, n.length, true); local.set(n, 30); local.set(data, 30+n.length); locals.push(local);
    const central = new Uint8Array(46+n.length), cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true); cv.setUint32(16, crc, true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true);
    cv.setUint16(28, n.length, true); cv.setUint32(42, offset, true); central.set(n, 46); centrals.push(central);
    offset += local.length;
  }
  const centralSize = centrals.reduce((n, b) => n+b.length, 0);
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, items.length, true); ev.setUint16(10, items.length, true);
  ev.setUint32(12, centralSize, true); ev.setUint32(16, offset, true);
  const all = new Uint8Array(offset+centralSize+end.length); let p=0;
  for (const b of locals) { all.set(b,p); p+=b.length; }
  for (const b of centrals) { all.set(b,p); p+=b.length; }
  all.set(end,p); return all;
}

test('enumera y extrae entradas ZIP almacenadas', async () => {
  const zip = makeStoredZip([['META-INF/MANIFEST.MF', 'MIDlet-Name: Test\r\n'], ['splash.png', 'png-data']]);
  const entries = listZipEntries(zip);
  assert.deepEqual(entries.map(e => e.name), ['META-INF/MANIFEST.MF', 'splash.png']);
  assert.equal(new TextDecoder().decode(await extractZipEntry(zip, entries[0])), 'MIDlet-Name: Test\r\n');
  assert.equal(new TextDecoder().decode(await extractZipEntry(zip, entries[1])), 'png-data');
});

test('rechaza un archivo que no es ZIP/JAR', () => {
  assert.throws(() => listZipEntries(new TextEncoder().encode('no es un jar')), /directorio ZIP\/JAR/i);
});
