import { describe, expect, it } from 'vitest';
import { parseColor } from '../src/color';
import { getShape } from '../src/tv/geometry';
import { RobotSim, restPose } from '../src/tv/sim';
import { frameFor } from '../src/tv/render';
import { robotHeadShapes, robotHeadStates } from '../src/shared';

describe('parseColor', () => {
  it('parses #rgb, #rrggbb and rgb()', () => {
    expect(parseColor('#fff')).toEqual([255, 255, 255]);
    expect(parseColor('#2b49a3')).toEqual([0x2b, 0x49, 0xa3]);
    expect(parseColor('rgb(1, 2, 3)')).toEqual([1, 2, 3]);
    expect(parseColor('rgba(1 2 3 / 0.5)')).toEqual([1, 2, 3]);
  });
  it('returns null for anything else', () => {
    expect(parseColor('tomato')).toBeNull();
    expect(parseColor('#12')).toBeNull();
  });
});

describe('lists', () => {
  it('exports 4 shapes and 9 states', () => {
    expect(robotHeadShapes).toHaveLength(4);
    expect(robotHeadStates).toHaveLength(9);
  });
});

describe('geometry and frame', () => {
  it.each(robotHeadShapes)('%s builds and frames with and without antenna', (s) => {
    const shape = getShape(s);
    for (const antenna of [true, false]) {
      const f = frameFor(shape, antenna, 160);
      expect(f.box).toBeGreaterThan(0);
      expect(Number.isFinite(f.padTop + f.padBottom + f.padSide + f.cy)).toBe(true);
    }
  });
});

describe('RobotSim', () => {
  it.each(robotHeadStates)('%s steps without NaN', (s) => {
    const sim = new RobotSim(0.3, s);
    for (let i = 0; i < 600; i++) sim.update(1 / 60);
    for (const v of Object.values(sim.pose)) expect(Number.isFinite(v)).toBe(true);
  });
  it('is deterministic for a seed', () => {
    const a = new RobotSim(0.42, 'idle'), b = new RobotSim(0.42, 'idle');
    for (let i = 0; i < 300; i++) {
      a.update(1 / 60);
      b.update(1 / 60);
    }
    expect(a.pose).toEqual(b.pose);
  });
  it('poke makes the head hop and show happy', () => {
    const sim = new RobotSim(0.1, 'sleeping');
    sim.poke();
    let peak = 0;
    for (let i = 0; i < 60; i++) {
      sim.update(1 / 60);
      peak = Math.max(peak, sim.pose.lift);
    }
    expect(peak).toBeGreaterThan(0);
    expect(sim.shown).toBe('happy');
  });
  it('setState switches state', () => {
    const sim = new RobotSim(0.1, 'idle');
    sim.setState('error');
    expect(sim.state).toBe('error');
    expect(restPose('error').sx).toBeTypeOf('number');
  });
});
