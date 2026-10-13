#!/bin/sh
set -eu
JAR="${1:-}"
if [ -z "$JAR" ] || [ ! -f "$JAR" ]; then
  echo "Usage: sh scripts/verify-game-jar.sh /path/to/game.jar" >&2
  exit 2
fi
if ! unzip -t "$JAR" >/dev/null 2>&1; then
  echo "ERROR: file is not a valid readable JAR/ZIP archive" >&2
  exit 1
fi
MANIFEST="$(unzip -p "$JAR" META-INF/MANIFEST.MF)"
printf '%s\n' "$MANIFEST" | grep -F 'MIDlet-Name: Brothers in Arms Art of War' >/dev/null || {
  echo "ERROR: unexpected MIDlet-Name" >&2; exit 1;
}
printf '%s\n' "$MANIFEST" | grep -F 'MIDlet-1: Brothers in Arms Art of War, /icon.png, GloftBIAH' >/dev/null || {
  echo "ERROR: unexpected MIDlet entry point" >&2; exit 1;
}
printf '%s\n' "$MANIFEST" | grep -F 'MIDlet-Version: 1.0.1' >/dev/null || {
  echo "ERROR: unexpected MIDlet version" >&2; exit 1;
}
echo "JAR structure and expected MIDlet metadata: OK"
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$JAR"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$JAR"
else
  echo "Install sha256sum or shasum to print the file hash."
fi
