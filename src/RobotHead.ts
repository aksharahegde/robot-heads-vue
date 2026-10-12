import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch, type PropType } from 'vue';
import type { RobotHeadModel, RobotHeadShape, RobotHeadState } from './types';
import { robotHeadShapes, robotHeadStates } from './shared';
import { getShape } from './tv/geometry';
import { RobotSim, restPose } from './tv/sim';
import { RobotRenderer, frameFor, type Palette } from './tv/render';
import { linear } from './tv/light';
import { parseColor } from './color';
import { subscribe, pointer } from './ticker';

export { robotHeadShapes, robotHeadStates };

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

let instances = 0;

const reducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function palette(color: string, trim: string, screen: string): Palette {
  const shell = parseColor(color) ?? [48, 80, 172];
  const metal = parseColor(trim) ?? [150, 168, 200];
  const led = parseColor(screen) ?? [232, 242, 255];
  return {
    shell: { albedo: linear(shell), f0: 0.05, metal: 0.15, spec: 0.55, shininess: 70, rim: 0.9 },
    trim: { albedo: linear(metal), f0: 0.2, metal: 0.65, spec: 0.8, shininess: 45, rim: 0.7 },
    led,
  };
}

/**
 * A TV-headed robot: a glossy moulded shell with knob ears and an
 * antenna, and an LED matrix for a face that shows what it is doing.
 *
 * The element is a `size` × `size` box with the robot at rest centred
 * in it. Its canvas reaches past the box, so hops, the antenna's glow and
 * the floor's shadow draw outside it without taking part in layout.
 */
export const RobotHead = defineComponent({
  name: 'RobotHead',
  props: {
    model: { type: String as PropType<RobotHeadModel>, default: 'tv' },
    shape: { type: String as PropType<RobotHeadShape>, default: 'rectangle' },
    state: { type: String as PropType<RobotHeadState>, default: 'idle' },
    size: { type: Number, default: 160 },
    color: { type: String, default: '#2b49a3' },
    trimColor: { type: String, default: '#93a6c8' },
    screenColor: { type: String, default: '#e8f2ff' },
    speed: { type: Number, default: 1 },
    paused: { type: Boolean, default: false },
    interactive: { type: Boolean, default: true },
    floorShadow: { type: Boolean, default: true },
    antenna: { type: Boolean, default: true },
    seed: { type: Number, default: undefined },
  },
  setup(props, { expose }) {
    const boxRef = ref<HTMLSpanElement | null>(null);
    const canvasRef = ref<HTMLCanvasElement | null>(null);
    expose({ canvas: canvasRef });

    const stateKey = (): RobotHeadState => (robotHeadStates.includes(props.state) ? props.state : 'idle');
    const shapeKey = (): RobotHeadShape => (robotHeadShapes.includes(props.shape) ? props.shape : 'rectangle');
    const frame = () => frameFor(getShape(shapeKey()), props.antenna, props.size);
    const still = () => props.paused || !(props.speed > 0);

    const seedValue = Math.min(1, Math.max(0, props.seed ?? hashSeed(`robot-head-${instances++}`)));
    const sim = new RobotSim(seedValue, stateKey());
    let renderer: RobotRenderer | null = null;
    let stop: (() => void) | null = null;

    const paint = (animated: boolean) => {
      const canvas = canvasRef.value;
      if (!canvas) return;
      const dpr = Math.min(2, (typeof devicePixelRatio === 'number' && devicePixelRatio) || 1);
      const f = frame();
      const w = Math.round((f.box + 2 * f.padSide) * dpr);
      const hgt = Math.round((f.box + f.padTop + f.padBottom) * dpr);
      if (canvas.width !== w || canvas.height !== hgt) {
        canvas.width = w;
        canvas.height = hgt;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      if (!renderer) renderer = new RobotRenderer();
      const key = stateKey();
      const shape = getShape(shapeKey());
      renderer.draw(ctx, f, dpr, animated ? sim.pose : restPose(key), animated ? sim : null, key, shape, palette(props.color, props.trimColor, props.screenColor), {
        floorShadow: props.floorShadow,
        antenna: props.antenna,
      });
    };

    const start = () => {
      stop?.();
      stop = null;
      if (still() || reducedMotion()) {
        paint(false);
        return;
      }
      stop = subscribe((dt) => {
        const el = boxRef.value;
        if (el && props.interactive && Number.isFinite(pointer.x)) {
          /* measured from the resting head's centre */
          const box = el.getBoundingClientRect();
          const f = frame();
          const dx = pointer.x - (box.left + box.width / 2);
          const dy = pointer.y - (box.top + f.cy - f.padTop);
          sim.pointer = Math.hypot(dx, dy) < 700 ? { x: dx, y: dy } : null;
        } else sim.pointer = null;
        sim.update(dt * props.speed);
        paint(true);
      });
    };

    watch(stateKey, (s) => sim.setState(s), { flush: 'sync' });
    onMounted(() => {
      sim.setState(stateKey());
      start();
    });
    watch(
      () => [still(), props.size, stateKey(), shapeKey(), props.color, props.trimColor, props.screenColor, props.floorShadow, props.antenna],
      start,
      { flush: 'post' }
    );
    onBeforeUnmount(() => {
      stop?.();
      stop = null;
    });

    const click = () => {
      if (props.interactive && !still()) sim.poke();
    };

    return () => {
      const f = frame();
      return h(
        'span',
        {
          ref: boxRef,
          role: 'img',
          'aria-label': `Robot, ${stateKey()}`,
          onClick: click,
          style: { position: 'relative', display: 'block', flex: 'none', width: `${props.size}px`, height: `${props.size}px`, cursor: props.interactive ? 'pointer' : undefined },
        },
        [
          h('canvas', {
            ref: canvasRef,
            'aria-hidden': 'true',
            style: {
              position: 'absolute',
              left: `${-f.padSide}px`,
              top: `${-f.padTop}px`,
              width: `${f.box + 2 * f.padSide}px`,
              height: `${f.box + f.padTop + f.padBottom}px`,
              display: 'block',
              pointerEvents: 'none',
            },
          }),
        ]
      );
    };
  },
});
