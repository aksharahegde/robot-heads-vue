import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { RobotHead, robotHeadShapes, robotHeadStates } from '../src';
import { stubCanvas } from './setup';

let rafs: Map<number, FrameRequestCallback>;
let nextId: number;
const tick = (ms: number) => {
  const cbs = [...rafs.values()];
  rafs.clear();
  cbs.forEach((cb) => cb(ms));
};

beforeEach(() => {
  stubCanvas();
  rafs = new Map();
  nextId = 1;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => (rafs.set(nextId, cb), nextId++));
  vi.stubGlobal('cancelAnimationFrame', (id: number) => rafs.delete(id));
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
});
afterEach(() => vi.unstubAllGlobals());

describe('RobotHead', () => {
  it('renders a size x size img box with a state label and a hidden canvas', () => {
    const w = mount(RobotHead, { props: { size: 120, state: 'thinking' } });
    const el = w.element as HTMLElement;
    expect(el.getAttribute('role')).toBe('img');
    expect(el.getAttribute('aria-label')).toBe('Robot, thinking');
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('120px');
    expect(w.find('canvas').attributes('aria-hidden')).toBe('true');
    w.unmount();
  });

  it('lets attrs fall through and aria-label override', () => {
    const onClick = vi.fn();
    const w = mount(RobotHead, { attrs: { class: 'x', 'aria-label': 'Helper', onClick } });
    expect(w.classes()).toContain('x');
    expect(w.attributes('aria-label')).toBe('Helper');
    w.trigger('click');
    expect(onClick).toHaveBeenCalledOnce();
    w.unmount();
  });

  it('exposes the canvas', () => {
    const w = mount(RobotHead);
    expect((w.vm as unknown as { canvas: HTMLCanvasElement }).canvas).toBe(w.find('canvas').element);
    w.unmount();
  });

  it('falls back to idle/rectangle for unknown values', () => {
    const w = mount(RobotHead, { props: { state: 'bogus' as never, shape: 'blob' as never } });
    expect(w.attributes('aria-label')).toBe('Robot, idle');
    w.unmount();
  });

  it('updates the label when state changes', async () => {
    const w = mount(RobotHead, { props: { state: 'idle' } });
    await w.setProps({ state: 'sleeping' });
    expect(w.attributes('aria-label')).toBe('Robot, sleeping');
    w.unmount();
  });

  it('animates on the shared loop and stops on unmount', async () => {
    const w = mount(RobotHead);
    await nextTick();
    expect(rafs.size).toBe(1);
    tick(0);
    tick(16);
    expect(rafs.size).toBe(1);
    w.unmount();
    tick(32);
    expect(rafs.size).toBe(0);
  });

  it('shares one loop between heads', async () => {
    const a = mount(RobotHead), b = mount(RobotHead);
    await nextTick();
    expect(rafs.size).toBe(1);
    a.unmount();
    tick(0);
    expect(rafs.size).toBe(1);
    b.unmount();
  });

  it('paused and reduced motion draw a still frame without a loop', async () => {
    const w = mount(RobotHead, { props: { paused: true } });
    await nextTick();
    expect(rafs.size).toBe(0);
    expect(w.find('canvas').element.width).toBeGreaterThan(0);
    await w.setProps({ paused: false });
    await nextTick();
    expect(rafs.size).toBe(1);
    w.unmount();
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const r = mount(RobotHead);
    await nextTick();
    expect(rafs.size).toBe(0);
    r.unmount();
  });

  it('a zero speed is still', async () => {
    const w = mount(RobotHead, { props: { speed: 0 } });
    await nextTick();
    expect(rafs.size).toBe(0);
    w.unmount();
  });

  it('antenna prop changes the canvas frame', async () => {
    const w = mount(RobotHead, { props: { paused: true } });
    const h1 = (w.find('canvas').element as HTMLCanvasElement).style.height;
    await w.setProps({ antenna: false });
    expect((w.find('canvas').element as HTMLCanvasElement).style.height).not.toBe(h1);
    w.unmount();
  });

  it('interactive controls the pointer cursor', async () => {
    const w = mount(RobotHead, { props: { interactive: false } });
    expect((w.element as HTMLElement).style.cursor).toBe('');
    await w.setProps({ interactive: true });
    expect((w.element as HTMLElement).style.cursor).toBe('pointer');
    w.unmount();
  });

  it.each(robotHeadShapes)('mounts shape %s in every state', async (shape) => {
    for (const state of robotHeadStates) {
      const w = mount(RobotHead, { props: { shape, state } });
      await nextTick();
      tick(0);
      tick(16);
      w.unmount();
    }
  });

  it('accepts invalid colours without throwing', () => {
    const w = mount(RobotHead, { props: { color: 'nope', trimColor: '', screenColor: 'x', paused: true } });
    w.unmount();
  });
});
