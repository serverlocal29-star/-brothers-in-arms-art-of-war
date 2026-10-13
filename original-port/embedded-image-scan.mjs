const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

function findBytes(bytes, signature, start = 0) {
  outer: for (let i = start; i <= bytes.length - signature.length; i++) {
    for (let j = 0; j < signature.length; j++) if (bytes[i + j] !== signature[j]) continue outer;
    return i;
  }
  return -1;
}

function pngEnd(bytes, start) {
  if (start + 8 > bytes.length || PNG_SIGNATURE.some((v, i) => bytes[start + i] !== v)) return -1;
  let p = start + 8;
  let sawHeader = false;
  while (p + 12 <= bytes.length) {
    const n = new DataView(bytes.buffer, bytes.byteOffset + p, 4).getUint32(0, false);
    if (n > bytes.length - p - 12) return -1;
    const type = String.fromCharCode(bytes[p + 4], bytes[p + 5], bytes[p + 6], bytes[p + 7]);
    if (type === 'IHDR') {
      if (n !== 13) return -1;
      sawHeader = true;
    }
    p += 12 + n;
    if (type === 'IEND') return sawHeader ? p : -1;
  }
  return -1;
}

/** Finds complete, structurally valid embedded PNGs without uploading or modifying the source. */
export function scanEmbeddedPngs(entries) {
  const found = [];
  for (const entry of entries) {
    const bytes = entry.bytes instanceof Uint8Array ? entry.bytes : new Uint8Array(entry.bytes);
    let cursor = 0;
    while (cursor < bytes.length) {
      const start = findBytes(bytes, PNG_SIGNATURE, cursor);
      if (start < 0) break;
      const end = pngEnd(bytes, start);
      if (end > start) {
        const view = new DataView(bytes.buffer, bytes.byteOffset + start);
        found.push({
          source: entry.name,
          offset: start,
          byteLength: end - start,
          width: view.getUint32(16, false),
          height: view.getUint32(20, false),
          bytes: bytes.slice(start, end)
        });
        cursor = end;
      } else cursor = start + 8;
    }
  }
  return found;
}
