# Original Java game → native browser port

## Objective

Port the uploaded `Brothers in Arms: Art of War` MIDlet to browser-native JavaScript/Canvas/WebAudio. Do **not** execute the original JAR, embed a Java ME emulator, or use the existing fan-made gameplay reconstruction as the game implementation.

The current `game/` page is the earlier prototype and is not the target implementation. Keep it available until the original port can replace it without losing a playable fallback.

## Confirmed facts from the supplied JAR

- MIDlet: `GloftBIA3`
- Version: `1.0.1`
- Vendor: Gameloft SA
- Runtime target: CLDC 1.0 / MIDP 2.0
- Important classes: `GloftBIA3`, `Z0`, `g`, `a`, `b`, `c`, `d`, `e`, `f`, `h`
- Packed game resources include `map`, `phy`, `script`, `sence`, `sound`, `spr1`–`spr4`, `tileset`, `dataIGP`, and `p`.
- `splash.png` is 320 × 250 pixels.
- The supplied build's main Canvas drawing code explicitly clips and clears a 320 × 250 area. Use **320 × 250 as the initial logical viewport**, preserve its aspect ratio, and upscale with nearest-neighbour rendering. Do not stretch the original frame to 16:9.
- The JAR also uses keypad and MIDP Canvas game-action input. Input mappings must be ported from the original bytecode, not inferred from the fan-made prototype.

## Porting stages

1. **Reverse-engineer the binary formats.** Document how the original code reads each packed resource; identify sprite frames, tile maps, level scripts, collision/physics data, audio and scene transitions.
2. **Recover original logic.** Decompile/disassemble the classes and translate the game loop, player, enemies, weapons, missions, UI, transitions and special vehicle/parachute sequences into maintainable JavaScript modules.
3. **Rebuild the renderer.** Decode and draw the original assets at the original logical resolution; keep a pixel-accurate 320 × 250 viewport and scale it responsively.
4. **Port input.** Map modern touch controls and Gamepad API buttons to the original game actions. Support held and repeated input where the original expects it.
5. **Validate against the JAR.** Compare screenshots, animation timing, level progression, collisions, damage, weapon behavior and audio against the original on known scenes. Mark each subsystem complete only after a comparison test.
6. **Replace the default page only when playable.** The old reconstruction must not be labelled or presented as the original port.

## Asset and distribution policy

The original JAR is user-supplied and proprietary. Do not commit the commercial JAR or publish extracted game assets in this public repository. Keep local analysis/build scripts separate from distributable source; users must supply their own JAR for asset extraction and validation.

## Completion criteria

- No JAR execution and no embedded emulator.
- Original game logic and level/resource data are ported, not invented substitute missions.
- Touch and Bluetooth controller work.
- Correct logical resolution/aspect ratio, no unintended cropping or stretching.
- Tested start-to-finish gameplay, including non-standard mission types.
- Clear disclosure of anything that remains incomplete.
