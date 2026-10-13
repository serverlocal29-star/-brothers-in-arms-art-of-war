# Original Java game → native browser port

## Objective

Port the uploaded `Brothers in Arms: Art of War` MIDlet to browser-native JavaScript/Canvas/WebAudio. Do **not** execute the original JAR, embed a Java ME emulator, or use the existing fan-made gameplay reconstruction as the game implementation.

The earlier non-native `game/` prototype has been removed from the published repository as requested. The default page points to this port-only area; it is currently a status page, not a playable game.

## Confirmed facts from the supplied JAR

- MIDlet: `GloftBIA3`
- Version: `1.0.1`
- Vendor: Gameloft SA
- Runtime target: CLDC 1.0 / MIDP 2.0
- Important classes: `GloftBIA3`, `Z0`, `g`, `a`, `b`, `c`, `d`, `e`, `f`, `h`
- Packed game resources include `map`, `phy`, `script`, `sence`, `sound`, `spr1`–`spr4`, `tileset`, `dataIGP`, and `p`.
- `splash.png` is 320 × 250 pixels.
- The supplied MIDlet's main Canvas paint path explicitly clips and clears a 320 × 250 region. Treat that as the source build's logical render area; preserve its 64:50 aspect ratio. Other published handset variants exist at sizes such as 240 × 320, so do not assume every JAR variant shares this layout.
- Bytecode inspection confirms the game normalizes several phone-specific key characters to keypad digits before processing them: `e→1`, `r→2`, `t→3`, `d→4`, `f→5`, `g→6`, `x→7`, `c→8`, `v→9`, `?→0`. It also maps MIDP directional game actions to internal bit flags. This is evidence for the input adapter, not yet a complete semantic map of every gameplay action.
- The supplied build's main Canvas drawing code explicitly clips and clears a 320 × 250 area. Use **320 × 250 as the initial logical viewport**, preserve its aspect ratio, and upscale with nearest-neighbour rendering. Do not stretch the original frame to 16:9.
- The JAR also uses keypad and MIDP Canvas game-action input. Input mappings must be ported from the original bytecode, not inferred from the fan-made prototype.

## Porting stages

1. **Reverse-engineer the binary formats.** Initial bounds-checked JavaScript readers now exist for the shared indexed container, `script` directory and length-prefixed `phy` blocks. The observed layouts and remaining unknowns are documented in [resource-formats.md](./resource-formats.md); synthetic tests are in [resource-reader.test.mjs](./resource-reader.test.mjs). Runtime cadence and input edge behavior are documented in [runtime-contract.md](./runtime-contract.md). Sprite/tile payload decoding, map interpretation, audio and scene transitions remain incomplete.
2. **Recover original logic.** Decompile/disassemble the classes and translate the game loop, player, enemies, weapons, missions, UI, transitions and special vehicle/parachute sequences into maintainable JavaScript modules.
3. **Rebuild the renderer.** Decode and draw the original assets at the original logical resolution; keep a pixel-accurate 320 × 250 viewport and scale it responsively.
4. **Port input.** A touch-control overlay is now wired to the normalized keypad adapter: directional pad, aim left/right, action/fire, and grenade. It emits `original-port:keydown` / `original-port:keyup` events for the gameplay runtime. These controls are only an input foundation until the gameplay logic consumes them; they do not make the current diagnostic page playable. The online 400×240 “Landscape / Touch” listing appears to be a community touch conversion, so use its control concept as a reference, not as proof that Gameloft shipped an official touch build. Preserve the supplied JAR's confirmed 320×250 logical viewport unless the actual touch-converted JAR is separately inspected.
5. **Validate against the JAR.** Compare screenshots, animation timing, level progression, collisions, damage, weapon behavior and audio against the original on known scenes. Mark each subsystem complete only after a comparison test.
6. **Publish gameplay only when playable.** The removed reconstruction must not be labelled or presented as the original port.

## Asset and distribution policy

The original JAR is user-supplied and proprietary. Do not commit the commercial JAR or publish extracted game assets in this public repository. Keep local analysis/build scripts separate from distributable source; users must supply their own JAR for asset extraction and validation.

## Completion criteria

- No JAR execution and no embedded emulator.
- Original game logic and level/resource data are ported, not invented substitute missions.
- Touch controls and Bluetooth controller work in playable gameplay; touch input adapter/overlay is present, but gameplay wiring and validation remain incomplete.
- Correct logical resolution/aspect ratio, no unintended cropping or stretching.
- Tested start-to-finish gameplay, including non-standard mission types.
- Clear disclosure of anything that remains incomplete.
