/* jsdom has no 2D context: hand back one whose every method is a no-op and every gradient a stub */
function makeContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const noop = (): unknown =>
    new Proxy(function () {} as unknown as object, {
      get: (_t, k) => (k === 'canvas' ? canvas : noop()),
      set: () => true,
      apply: () => noop(),
    });
  const stubs: Record<string, unknown> = {
    canvas,
    createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }),
    createPattern: () => ({}),
    measureText: () => ({ width: 0 }),
    getImageData: (_x: number, _y: number, w: number, h: number) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
    createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(Math.max(1, w * h * 4)), width: w, height: h }),
  };
  return new Proxy({} as object, {
    get: (_t, k: string) => (k in stubs ? stubs[k] : noop()),
    set: () => true,
  }) as CanvasRenderingContext2D;
}

export function stubCanvas() {
  const ctxs = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>();
  HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
    if (!ctxs.has(this)) ctxs.set(this, makeContext(this));
    return ctxs.get(this)!;
  } as unknown as HTMLCanvasElement['getContext'];
}
