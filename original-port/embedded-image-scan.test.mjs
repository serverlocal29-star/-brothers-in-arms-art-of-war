import test from 'node:test';
import assert from 'node:assert/strict';
import { scanEmbeddedPngs } from './embedded-image-scan.mjs';

function chunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  new DataView(out.buffer).setUint32(0, data.length, false);
  out.set([...type].map(c => c.charCodeAt(0)), 4);
  out.set(data, 8);
  // CRC isn't checked by the structural scanner; reserve four bytes as PNG requires.
  return out;
}
function fixturePng(width = 3, height = 2) {
  const signature = Uint8Array.from([137,80,78,71,13,10,26,10]);
  const ihdrData = new Uint8Array(13);
  const view = new DataView(ihdrData.buffer);
  view.setUint32(0, width, false); view.setUint32(4, height, false);
  ihdrData.set([8,6,0,0,0], 8);
  const join = parts => {
    const out = new Uint8Array(parts.reduce((n,p)=>n+p.length,0));
    let at=0; for (const part of parts) { out.set(part,at); at+=part.length; } return out;
  };
  return join([signature, chunk('IHDR', ihdrData), chunk('IDAT', new Uint8Array([1,2,3])), chunk('IEND', new Uint8Array())]);
}

test('finds complete PNGs embedded after arbitrary bytes', () => {
  const png = fixturePng();
  const data = new Uint8Array(5 + png.length + 2);
  data.set([9,8,7,6,5]); data.set(png, 5);
  const found = scanEmbeddedPngs([{name:'spr-test',bytes:data}]);
  assert.equal(found.length, 1);
  assert.equal(found[0].source, 'spr-test');
  assert.equal(found[0].offset, 5);
  assert.equal(found[0].width, 3);
  assert.equal(found[0].height, 2);
  assert.equal(found[0].byteLength, png.length);
});

test('ignores truncated PNG signatures and continues scanning', () => {
  const bad = Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,255]);
  assert.deepEqual(scanEmbeddedPngs([{name:'broken',bytes:bad}]), []);
});
