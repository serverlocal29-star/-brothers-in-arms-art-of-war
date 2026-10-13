/**
 * Safe readers for resource containers recovered from the original MIDlet bytecode.
 * No proprietary resources are bundled here; callers provide ArrayBuffers/Uint8Arrays.
 */

function bytesOf(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  throw new TypeError('Expected ArrayBuffer or Uint8Array');
}

class Reader {
  constructor(input, label = 'resource') {
    this.bytes = bytesOf(input);
    this.view = new DataView(this.bytes.buffer, this.bytes.byteOffset, this.bytes.byteLength);
    this.label = label;
    this.offset = 0;
  }
  need(size, at = this.offset) {
    if (!Number.isSafeInteger(size) || size < 0 || at < 0 || at + size > this.bytes.length) {
      throw new RangeError(`${this.label}: truncated/invalid data at ${at}, need ${size} byte(s), length ${this.bytes.length}`);
    }
  }
  u8() { this.need(1); return this.view.getUint8(this.offset++); }
  i8() { this.need(1); return this.view.getInt8(this.offset++); }
  u16le() { this.need(2); const v = this.view.getUint16(this.offset, true); this.offset += 2; return v; }
  u32le() { this.need(4); const v = this.view.getUint32(this.offset, true); this.offset += 4; return v; }
  i32be() { this.need(4); const v = this.view.getInt32(this.offset, false); this.offset += 4; return v; }
  skip(size) { this.need(size); this.offset += size; }
  take(size) { this.need(size); const out = this.bytes.slice(this.offset, this.offset + size); this.offset += size; return out; }
}

/**
 * Reads the shared indexed container used by the game's map/tileset/sprite-family
 * loader: uint16 little-endian boundary count, then that many uint32 little-endian
 * offsets relative to the data section. The original accessor exposes boundary
 * indices 0..count-2; the final offset closes the preceding record.
 */
export function readIndexedResource(input, label = 'indexed resource') {
  const r = new Reader(input, label);
  const boundaryCount = r.u16le();
  if (boundaryCount < 2) throw new RangeError(`${label}: expected at least two boundary offsets`);
  if (boundaryCount > Math.floor((r.bytes.length - 2) / 4)) {
    throw new RangeError(`${label}: offset table exceeds resource length`);
  }
  const offsets = Array.from({ length: boundaryCount }, () => r.u32le());
  const dataStart = r.offset;
  const dataLength = r.bytes.length - dataStart;
  let previous = -1;
  for (const offset of offsets) {
    if (offset < 0 || offset > dataLength || offset < previous) {
      throw new RangeError(`${label}: invalid/non-monotonic offset ${offset}`);
    }
    previous = offset;
  }
  const records = [];
  for (let i = 0; i < boundaryCount - 1; i++) {
    records.push(r.bytes.slice(dataStart + offsets[i], dataStart + offsets[i + 1]));
  }
  return { boundaryCount, offsets, dataStart, records };
}

/**
 * Decodes the script directory layout observed in g.class:
 * u8 count, signed-byte row widths[count], u8 offset count, int32-BE offsets[],
 * skip offsets[scriptIndex], then u8 groups; each group has u8 rowCount and rows
 * encoded as u8 rowId followed by rowWidths[rowId] int32-BE values.
 *
 * This returns structured data only; the semantics/opcodes of the script values
 * still need to be mapped against mission execution.
 */
export function readScriptResource(input, scriptIndex = 0) {
  const r = new Reader(input, 'script');
  const widthCount = r.u8();
  const rowWidths = Array.from({ length: widthCount }, () => r.i8());
  const offsetCount = r.u8();
  if (offsetCount === 0 || scriptIndex < 0 || scriptIndex >= offsetCount) {
    throw new RangeError(`script: invalid script index ${scriptIndex}`);
  }
  const offsets = Array.from({ length: offsetCount }, () => r.i32be());
  const skip = offsets[scriptIndex];
  if (skip < 0) throw new RangeError('script: negative section offset');
  r.skip(skip);
  const groupCount = r.u8();
  const groups = [];
  for (let g = 0; g < groupCount; g++) {
    const rowCount = r.u8();
    const rows = [];
    for (let j = 0; j < rowCount; j++) {
      const id = r.u8();
      if (id >= rowWidths.length) throw new RangeError(`script: row id ${id} outside width table`);
      const width = rowWidths[id];
      if (width < 0) throw new RangeError(`script: negative width for row id ${id}`);
      const values = Array.from({ length: width }, () => r.i32be());
      rows.push({ id, values });
    }
    groups.push(rows);
  }
  return { rowWidths, offsets, scriptIndex, groups, bytesRead: r.offset };
}

/**
 * Reads one physics block from the observed /phy layout:
 * u8 boundary count, int32-BE offsets[count], then at dataStart+offset[index]
 * an int32-BE payload length followed by that many bytes.
 */
export function readPhysicsBlock(input, blockIndex = 0) {
  const r = new Reader(input, 'phy');
  const count = r.u8();
  if (blockIndex < 0 || blockIndex >= count) throw new RangeError(`phy: invalid block index ${blockIndex}`);
  const offsets = Array.from({ length: count }, () => r.i32be());
  const dataStart = r.offset;
  const relative = offsets[blockIndex];
  if (relative < 0) throw new RangeError('phy: negative block offset');
  r.offset = dataStart;
  r.skip(relative);
  const length = r.i32be();
  if (length < 0) throw new RangeError('phy: negative block length');
  const data = r.take(length);
  return { blockIndex, offsets, dataStart, length, data };
}
