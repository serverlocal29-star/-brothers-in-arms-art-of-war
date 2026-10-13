/**
 * Browser-native viewport for the original JAR's 320x250 logical drawing area.
 * This is a rendering utility only; it does not run Java bytecode or emulate MIDP.
 */
export const LOGICAL_WIDTH = 320;
export const LOGICAL_HEIGHT = 250;
export const LOGICAL_ASPECT = LOGICAL_WIDTH / LOGICAL_HEIGHT;

export function fitViewport(canvas, { width, height } = {}) {
  const cssWidth = Math.max(1, width ?? canvas.width ?? canvas.clientWidth ?? LOGICAL_WIDTH);
  const cssHeight = Math.max(1, height ?? canvas.height ?? canvas.clientHeight ?? LOGICAL_HEIGHT);
  const scale = Math.min(cssWidth / LOGICAL_WIDTH, cssHeight / LOGICAL_HEIGHT);
  const drawWidth = Math.floor(LOGICAL_WIDTH * scale);
  const drawHeight = Math.floor(LOGICAL_HEIGHT * scale);
  return {
    x: Math.floor((cssWidth - drawWidth) / 2),
    y: Math.floor((cssHeight - drawHeight) / 2),
    width: drawWidth,
    height: drawHeight,
    scale
  };
}

export function configureLogicalCanvas(canvas) {
  canvas.width = LOGICAL_WIDTH;
  canvas.height = LOGICAL_HEIGHT;
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;
  return context;
}

/** Convert client/pointer coordinates to original 320x250 game coordinates. */
export function pointerToLogical(canvas, clientX, clientY, viewport) {
  const rect = canvas.getBoundingClientRect();
  const localX = (clientX - rect.left) * (canvas.width / rect.width);
  const localY = (clientY - rect.top) * (canvas.height / rect.height);
  const x = (localX - viewport.x) / viewport.scale;
  const y = (localY - viewport.y) / viewport.scale;
  if (x < 0 || y < 0 || x >= LOGICAL_WIDTH || y >= LOGICAL_HEIGHT) return null;
  return { x: Math.floor(x), y: Math.floor(y) };
}

/** Draw the logical frame into a responsive canvas without stretching/cropping. */
export function presentFrame(displayContext, logicalCanvas, viewport, background = '#000') {
  const canvas = displayContext.canvas;
  displayContext.imageSmoothingEnabled = false;
  displayContext.fillStyle = background;
  displayContext.fillRect(0, 0, canvas.width, canvas.height);
  displayContext.drawImage(
    logicalCanvas,
    viewport.x,
    viewport.y,
    viewport.width,
    viewport.height
  );
}
