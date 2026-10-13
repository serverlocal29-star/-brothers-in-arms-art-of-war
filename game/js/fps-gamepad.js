/* 20 FPS limiter + standard Gamepad API mapping.
 * Kept separate from the game logic so the original prototype stays easy to audit.
 */
(() => {
  'use strict';
  const nativeRAF = window.requestAnimationFrame.bind(window);
  let lastGameFrame = 0;
  const FRAME_MS = 50;

  // Limit the game's render/update callback to 20 frames per second.
  window.requestAnimationFrame = function (callback) {
    let requestId = 0;
    const waitForSlot = (now) => {
      if (!lastGameFrame || now - lastGameFrame >= FRAME_MS - 0.5) {
        lastGameFrame = now;
        callback(now);
      } else {
        requestId = nativeRAF(waitForSlot);
      }
    };
    requestId = nativeRAF(waitForSlot);
    return requestId;
  };

  const heldKeys = new Set();
  const keyEvent = (type, key) => {
    window.dispatchEvent(new KeyboardEvent(type, {
      key, bubbles: true, cancelable: true
    }));
  };
  const setKey = (key, down) => {
    if (down && !heldKeys.has(key)) {
      heldKeys.add(key);
      keyEvent('keydown', key);
    } else if (!down && heldKeys.has(key)) {
      heldKeys.delete(key);
      keyEvent('keyup', key);
    }
  };
  const buttonDown = (pad, index) => !!pad.buttons[index] &&
    (pad.buttons[index].pressed || pad.buttons[index].value > 0.55);
  const deadZone = (value, dz = 0.22) => Math.abs(value) < dz ? 0 : value;

  function pollGamepads() {
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
    const pad = pads.find(p => p.connected);
    const help = document.getElementById('controllerHelp');

    if (!pad) {
      if (help) help.textContent = 'Conecta un mando compatible antes o durante la partida.';
      ['w','a','s','d',' ','g','r','1','2','3','p'].forEach(k => setKey(k, false));
      nativeRAF(pollGamepads);
      return;
    }

    if (help) help.textContent = 'Mando conectado: ' + (pad.id || 'mando compatible') + ' · objetivo 20 FPS.';
    const ax = deadZone(pad.axes[0] || 0);
    const ay = deadZone(pad.axes[1] || 0);
    const left = buttonDown(pad, 14) || ax < -0.35;
    const right = buttonDown(pad, 15) || ax > 0.35;
    const up = buttonDown(pad, 12) || ay < -0.35;
    const down = buttonDown(pad, 13) || ay > 0.35;
    setKey('a', left); setKey('d', right);
    setKey('w', up); setKey('s', down);

    // Standard mapping: A=fire, B=grenade, X=reload, Y=cycle weapon.
    setKey(' ', buttonDown(pad, 0));
    setKey('g', buttonDown(pad, 1));
    setKey('r', buttonDown(pad, 2));
    setKey('2', buttonDown(pad, 3));
    setKey('1', buttonDown(pad, 4));
    setKey('3', buttonDown(pad, 5));
    setKey('p', buttonDown(pad, 9));

    // Right stick aims by moving the pointer within the game canvas.
    const canvas = document.getElementById('game');
    if (canvas && pad.axes.length > 3) {
      const rx = deadZone(pad.axes[2] || 0);
      const ry = deadZone(pad.axes[3] || 0);
      if (rx || ry) {
        const rect = canvas.getBoundingClientRect();
        const x = rect.left + rect.width * (0.5 + Math.max(-0.48, Math.min(0.48, rx * 0.9)));
        const y = rect.top + rect.height * (0.5 + Math.max(-0.48, Math.min(0.48, ry * 0.9)));
        canvas.dispatchEvent(new PointerEvent('pointermove', {
          clientX: x, clientY: y, pointerType: 'mouse', bubbles: true
        }));
      }
    }
    nativeRAF(pollGamepads);
  }

  window.addEventListener('gamepadconnected', (event) => {
    const help = document.getElementById('controllerHelp');
    if (help) help.textContent = 'Mando conectado: ' + event.gamepad.id + ' · objetivo 20 FPS.';
  });
  window.addEventListener('gamepaddisconnected', () => {
    const help = document.getElementById('controllerHelp');
    if (help) help.textContent = 'Mando desconectado. Puedes seguir con teclado o controles táctiles.';
  });
  nativeRAF(pollGamepads);
})();
