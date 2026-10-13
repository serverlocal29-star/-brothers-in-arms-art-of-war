import test from 'node:test';
import assert from 'node:assert/strict';
import { readIndexedResource, readScriptResource, readPhysicsBlock } from './resource-reader.mjs';

const be32 = n => {
  const b = Buffer.alloc(4);
  b.writeInt32BE(n);
  return [...b];
};
const le32 = n => {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n);
  return [...b];
};
const le16 = n => [n & 255, (n >>> 8) & 255];

test('indexed resource: reads little-endian boundary table and slices records', () => {
  const input = Uint8Array.from([...le16(3), ...le32(0), ...le32(2), ...le32(5), 97, 98, 99, 100, 101]);
  const parsed = readIndexedResource(input, 'test-map');
  assert.equal(parsed.boundaryCount, 3);
  assert.deepEqual(parsed.offsets, [0, 2, 5]);
  assert.deepEqual(parsed.records.map(x => [...x]), [[97, 98], [99, 100, 101]]);
});

test('script resource: parses group rows with big-endian integer values', () => {
  const input = Uint8Array.from([
    2, 1, 2, // row width table
    1, ...be32(0), // one section offset
    1, // group count
    2, // rows in group
    0, ...be32(123),
    1, ...be32(-1), ...be32(7)
  ]);
  const parsed = readScriptResource(input);
  assert.deepEqual(parsed.rowWidths, [1, 2]);
  assert.deepEqual(parsed.groups, [[
    { id: 0, values: [123] },
    { id: 1, values: [-1, 7] }
  ]]);
});

test('physics resource: selects a length-prefixed block by indexed offset', () => {
  const input = Uint8Array.from([
    2, ...be32(0), ...be32(7), // count and offsets
    ...be32(3), 120, 121, 122, // first block
    ...be32(2), 104, 105 // second block
  ]);
  const parsed = readPhysicsBlock(input, 1);
  assert.equal(parsed.length, 2);
  assert.deepEqual([...parsed.data], [104, 105]);
});

test('malformed data is rejected instead of reading outside the resource', () => {
  assert.throws(() => readIndexedResource(Uint8Array.from([3, 0, 0]), 'broken'), /offset table/);
  assert.throws(() => readScriptResource(Uint8Array.from([1, 1, 1, 0])), /truncated|invalid/i);
  assert.throws(() => readPhysicsBlock(Uint8Array.from([1, 0, 0, 0, 0]), 3), /invalid block index/);
});
