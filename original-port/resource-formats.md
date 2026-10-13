# Resource format notes (reverse-engineering log)

These notes describe structures observed in the supplied MIDlet's bytecode, not guesses based on file extensions. The original JAR and extracted commercial data are intentionally not stored in this repository.

## Shared indexed resource reader

The loader in g.class reads a 16-bit little-endian boundary count, followed by that many 32-bit little-endian offsets. Offsets are relative to the data section immediately after the table. Record i is the slice between boundary i and i+1; the original accessor accepts indices below count - 1. This indexed path is used for map, tileset, and sprite-family resource loading. Records may still contain packed data, not ready-to-draw images.

Implementation: resource-reader.mjs → readIndexedResource().

## script

The loader observed in g.class reads: an unsigned-byte row-width count; that many signed-byte row widths; an unsigned-byte section-offset count; that many big-endian 32-bit offsets; skips the selected section offset; then reads an unsigned-byte group count. Each group has an unsigned-byte row count. Each row starts with an unsigned-byte ID followed by the number of big-endian 32-bit integers specified by the row-width table for that ID.

The parser preserves rows as { id, values }. Opcode meanings and mission-state semantics are not yet confirmed.

Implementation: readScriptResource(input, scriptIndex).

## phy

The physics loader reads an unsigned-byte block count, then that many big-endian 32-bit relative offsets. At the selected data-section offset is a big-endian 32-bit byte length followed by that many payload bytes. The schema and meaning of the payload remain under investigation.

Implementation: readPhysicsBlock(input, blockIndex).

## Validation

Synthetic fixtures in resource-reader.test.mjs cover byte order, table boundaries, script rows, selected physics blocks, and malformed/truncated data. Run with recent Node.js:

```sh
node --test original-port/resource-reader.test.mjs
```

These tests validate parser behavior only; they are not a comparison against a live mission.

## Remaining reverse-engineering tasks

- Decode sprite-family and tileset records into frames, palettes, dimensions and transparency.
- Map map records to tile grids, object placement and spawn points.
- Identify script opcode semantics by tracing call sites and state transitions.
- Decode phy collision/shape data and correlate it with movement.
- Decode sence scene transitions and sound audio records.
- Translate the original update loop, combat, enemy AI, UI and non-standard mission types into native JavaScript and compare against the original build.

Parsing the containers is one prerequisite, not a playable port by itself.
