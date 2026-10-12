import type { RobotHeadShape, RobotHeadState } from 'robot-heads-vue';

export const shapeLabels: Record<RobotHeadShape, string> = {
  rectangle: 'Rectangle',
  square: 'Square',
  circle: 'Circle',
  hexagon: 'Hexagon',
};

export const stateHints: Record<RobotHeadState, string> = {
  idle: 'Looks around, blinks, hops now and then.',
  thinking: 'Eyes up, dots pulsing, head tilted to one side.',
  searching: 'Sweeps side to side, a beam scanning the screen.',
  listening: 'Head cocked, an equaliser following the voice.',
  speaking: 'A mouth that moves with the words.',
  working: 'Head down, a progress bar filling.',
  happy: 'Bouncing, all smiles.',
  error: 'Shakes its head. Red X eyes.',
  sleeping: 'Drooped and dim, dreaming in z’s.',
};

export interface Colors {
  color: string;
  trimColor: string;
  screenColor: string;
}

export const DEFAULTS: Colors = { color: '#2b49a3', trimColor: '#93a6c8', screenColor: '#e8f2ff' };

export const SWATCHES: Record<keyof Colors, Array<[string, string]>> = {
  color: [
    ['Cobalt', '#2b49a3'],
    ['Tomato', '#c8372d'],
    ['Tangerine', '#e2762a'],
    ['Mustard', '#e0ad1f'],
    ['Mint', '#2f8f58'],
    ['Teal', '#1f8189'],
    ['Grape', '#6a45b8'],
    ['Bubblegum', '#d9558f'],
    ['Graphite', '#3a3d44'],
    ['Porcelain', '#e6e6ea'],
  ],
  trimColor: [
    ['Steel', '#93a6c8'],
    ['Silver', '#c4c9d2'],
    ['Brass', '#c9a45c'],
    ['Copper', '#c27a52'],
    ['Black', '#2a2c31'],
  ],
  screenColor: [
    ['White', '#e8f2ff'],
    ['Ice', '#7fe7ff'],
    ['Matrix', '#7dff9a'],
    ['Amber', '#ffc46b'],
    ['Neon', '#ff8fd0'],
  ],
};

export const ROW_LABELS: Record<keyof Colors, string> = { color: 'Shell', trimColor: 'Trim', screenColor: 'Screen' };
export const SPEEDS = [0.5, 1, 1.5, 2];

export const title = (s: string) => s[0].toUpperCase() + s.slice(1);

/* ?shape=circle&state=thinking&paused for screenshots */
export const query = new URLSearchParams(location.search);

export interface PropLine {
  key: string;
  /* the prop's name and value; strings are quoted, anything else is bound */
  name: string;
  value: string | number | boolean;
  on: boolean;
}

/* Vue template syntax: a string is a plain attribute, anything else a binding */
export const propText = (l: PropLine) => (typeof l.value === 'string' ? `${l.name}="${l.value}"` : `:${l.name}="${l.value}"`);
