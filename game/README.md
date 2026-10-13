# Brothers in Arms: Art of War — test asset

The uploaded test asset was inspected in the working session. Its JAR manifest identifies:

- MIDlet: `Brothers in Arms Art of War`
- Vendor: `Gameloft SA`
- Version: `1.0.1`
- Entry point: `GloftBIAH`
- Runtime: `CLDC-1.0` / `MIDP-2.0`
- SHA-256: `121991a2c882338625ba4ff4fd75882e2fd02523e4d09fb023ecf1ae87f02af7`

## Important status

The original JAR binary is **not stored in this repository yet**. The GitHub connector used for this branch supports text files and Git objects, but does not expose a direct binary-file upload action. This document is not a substitute for the JAR.

## Run a local test

1. Open the STAR launcher and press **START EMULATOR**.
2. In the FreeJ2ME Web launcher, choose the option to install/load a JAR and select your own `Brothers in Arms Art of War (2008)(Gameloft SA)(v1.0.1).jar`.
3. Launch the MIDlet. If it fails, try changing display size, phone type/compatibility flags, and disabling sound from emulator settings.
4. Record the exact error and browser console output before claiming compatibility.

FreeJ2ME Web uses CheerpJ and requires internet access. Not every Java ME game is compatible. See the emulator's documentation: https://github.com/zb3/freej2me-web

## Reproducible verification

From a machine with Java and unzip installed, run:

```sh
sh scripts/verify-game-jar.sh /path/to/game.jar
```

This checks that the file is a readable ZIP/JAR, verifies the expected MIDlet metadata, and prints its SHA-256. It does not prove that the game runs in the browser.
