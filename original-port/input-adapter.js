/**
 * Modern controls -> logical keypad inputs used by the original MIDlet.
 *
 * Initial mapping is based on the published control reference and bytecode
 * keypad normalization. It must be validated against actual gameplay before
 * being considered final.
 */
const KEY = Object.freeze({
  UP: '2',
  LEFT: '4',
  RIGHT: '6',
  DOWN: '8',
  ACTION: '5',
  AIM_LEFT: '1',
  AIM_RIGHT: '3',
  GRENADE: '0'
});

const DEAD_ZONE = 0.24;
const clampAxis = value => Math.abs(value) < DEAD_ZONE ? 0 : value;

export class OriginalInputAdapter {
  constructor(onKeyDown, onKeyUp) {
    this.onKeyDown = onKeyDown;
    this.onKeyUp = onKeyUp;
    this.held = new Set();
    this.padIndex = null;
    this.raf = 0;
    this.previousAim = 0;
  }

  set(key, down) {
    if (down && !this.held.has(key)) {
      this.held.add(key);
      this.onKeyDown?.(key);
    } else if (!down && this.held.has(key)) {
      this.held.delete(key);
      this.onKeyUp?.(key);
    }
  }

  releaseAll() {
    for (const key of this.held) this.onKeyUp?.(key);
    this.held.clear();
  }

  /** Feed normalized actions from touch buttons or a UI control. */
  setAction(action, down) {
    const key = KEY[action];
    if (key) this.set(key, down);
  }

  /** Call once per animation frame while the original-port page is active. */
  pollGamepad() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
    const pad = this.padIndex == null
      ? pads.find(item => item?.connected)
      : pads[this.padIndex];

    if (!pad?.connected) {
      this.releaseAll();
      this.previousAim = 0;
      return;
    }
    this.padIndex = pad.index;
    const pressed = i => !!pad.buttons[i]?.pressed ||
      (pad.buttons[i]?.value ?? 0) > 0.55;
    const ax = clampAxis(pad.axes[0] ?? 0);
    const ay = clampAxis(pad.axes[1] ?? 0);
    const horizontal = Math.abs(ax) > 0 ? ax : (pressed(14) ? -1 : pressed(15) ? 1 : 0);
    const vertical = Math.abs(ay) > 0 ? ay : (pressed(12) ? -1 : pressed(13) ? 1 : 0);

    this.set(KEY.LEFT, horizontal < -0.35);
    this.set(KEY.RIGHT, horizontal > 0.35);
    this.set(KEY.UP, vertical < -0.35);
    this.set(KEY.DOWN, vertical > 0.35);

    // Standard Gamepad mapping: A/action, B/grenade.
    this.set(KEY.ACTION, pressed(0));
    this.set(KEY.GRENADE, pressed(1));

    // Right stick acts as two discrete held aim directions.
    const rx = clampAxis(pad.axes[2] ?? 0);
    const aim = rx < -0.35 ? -1 : rx > 0.35 ? 1 : 0;
    this.set(KEY.AIM_LEFT, aim < 0);
    this.set(KEY.AIM_RIGHT, aim > 0);
    this.previousAim = aim;
  }

  dispose() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.releaseAll();
  }
}

export { KEY as ORIGINAL_KEYPAD };
