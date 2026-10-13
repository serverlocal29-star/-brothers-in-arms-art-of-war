# Runtime contract recovered from the original bytecode

This file records observed runtime behavior that should constrain the browser port.

## Main loop

The main Canvas class `g` implements `Runnable`. Its `run()` loop repeatedly calls the update routine and waits until approximately 80 ms have elapsed since the prior loop timestamp. That is a nominal cadence of 12.5 updates/second on this build, not 20 FPS. Rendering is requested through MIDP `repaint()` / `serviceRepaints()`; painting is guarded against re-entry. A browser implementation should preserve simulation timing initially and measure the original on-device behavior before choosing any interpolation strategy.

## Logical frame

The paint method clips to (0, 0, 320, 250), clears that rectangle to black in its setup path, and delegates scene drawing to another method. The browser viewport should therefore use a 320 × 250 logical framebuffer, nearest-neighbour scaling and letterboxing/pillarboxing rather than stretching.

## Input lifecycle

- `keyPressed` normalizes the phone key code, sets a pending pressed bit, and tracks repeated presses of the same normalized key within a 300 ms window.
- `keyRepeated` is empty in this build.
- `keyReleased` sets a pending released bit.
- A separate input update routine folds pending pressed/released bits into current/previous state and clears the pending masks.
- Pointer release has special handling for several UI states and for a bottom strip at y≈230–250; it is not a universal tap-to-fire mechanic.

This means the native input adapter must preserve both press and release edges, and should not rely only on a one-shot click callback. Touch controls and standard gamepad buttons should call the same logical key-down/key-up path.

## Not yet proven

The bytecode evidence above does not by itself identify the gameplay meaning of each normalized key or every bit flag. The current `input-adapter.js` map remains provisional until it is matched against the game's live controls and mission scenes.
