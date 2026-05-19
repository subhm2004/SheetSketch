/* Hero cursor trail — rainbow hues via cycling HSLA + lighter compositing */

type Oscillator = {
  phase: number;
  offset: number;
  frequency: number;
  amplitude: number;
  update: () => number;
};

type Point = { x: number; y: number; vx: number; vy: number };

type TrailLine = {
  spring: number;
  friction: number;
  nodes: Point[];
  update: () => void;
  draw: () => void;
};

type TrailCtx = CanvasRenderingContext2D & {
  running: boolean;
  frame: number;
};

const CONFIG = {
  friction: 0.5,
  trails: 80,
  size: 50,
  dampening: 0.025,
  tension: 0.99,
};

let ctx: TrailCtx | null = null;
let hueOsc: Oscillator | null = null;
let lines: TrailLine[] = [];
const pos = { x: 0, y: 0 };
let initialized = false;

function getHeroCanvas(): HTMLCanvasElement | null {
  return document.getElementById('canvas') as HTMLCanvasElement | null;
}

function createOscillator(opts: {
  phase?: number;
  offset?: number;
  frequency?: number;
  amplitude?: number;
}): Oscillator {
  const state = {
    phase: opts.phase ?? 0,
    offset: opts.offset ?? 0,
    frequency: opts.frequency ?? 0.001,
    amplitude: opts.amplitude ?? 1,
  };
  return {
    ...state,
    update() {
      state.phase += state.frequency;
      return state.offset + Math.sin(state.phase) * state.amplitude;
    },
  };
}

function createLine(spring: number): TrailLine {
  const springK = spring + 0.1 * Math.random() - 0.05;
  const friction = CONFIG.friction + 0.01 * Math.random() - 0.005;
  const nodes: Point[] = [];

  for (let i = 0; i < CONFIG.size; i++) {
    nodes.push({ x: pos.x, y: pos.y, vx: 0, vy: 0 });
  }

  return {
    spring: springK,
    friction,
    nodes,
    update() {
      let e = this.spring;
      let t = this.nodes[0];
      t.vx += (pos.x - t.x) * e;
      t.vy += (pos.y - t.y) * e;

      for (let i = 0; i < this.nodes.length; i++) {
        t = this.nodes[i];
        if (i > 0) {
          const n = this.nodes[i - 1];
          t.vx += (n.x - t.x) * e;
          t.vy += (n.y - t.y) * e;
          t.vx += n.vx * CONFIG.dampening;
          t.vy += n.vy * CONFIG.dampening;
        }
        t.vx *= this.friction;
        t.vy *= this.friction;
        t.x += t.vx;
        t.y += t.vy;
        e *= CONFIG.tension;
      }
    },
    draw() {
      if (!ctx) return;
      let n = this.nodes[0].x;
      let i = this.nodes[0].y;
      ctx.beginPath();
      ctx.moveTo(n, i);
      const last = this.nodes.length - 2;
      for (let a = 1; a < last; a++) {
        const e = this.nodes[a];
        const t = this.nodes[a + 1];
        n = 0.5 * (e.x + t.x);
        i = 0.5 * (e.y + t.y);
        ctx.quadraticCurveTo(e.x, e.y, n, i);
      }
      const e = this.nodes[last];
      const t = this.nodes[last + 1];
      ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
      ctx.stroke();
      ctx.closePath();
    },
  };
}

function setPointerFromEvent(e: MouseEvent | TouchEvent) {
  const canvas = getHeroCanvas();
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  let clientX: number;
  let clientY: number;

  if ('touches' in e && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ('clientX' in e) {
    clientX = e.clientX;
    clientY = e.clientY;
  } else {
    return;
  }

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  pos.x = (clientX - rect.left) * scaleX;
  pos.y = (clientY - rect.top) * scaleY;
}

function onPointerMove(e: MouseEvent | TouchEvent) {
  setPointerFromEvent(e);
  if ('preventDefault' in e) e.preventDefault();
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 1) setPointerFromEvent(e);
}

function initLines() {
  lines = [];
  for (let i = 0; i < CONFIG.trails; i++) {
    lines.push(createLine(0.45 + (i / CONFIG.trails) * 0.025));
  }
}

function render() {
  if (!ctx?.running || !hueOsc) return;

  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.globalCompositeOperation = 'lighter';

  const baseHue = Math.round(hueOsc.update()) % 360;
  ctx.lineWidth = 10;

  for (let t = 0; t < lines.length; t++) {
    const hue = (baseHue + t * 4) % 360;
    ctx.strokeStyle = `hsla(${hue}, 100%, 55%, 0.07)`;
    lines[t].update();
    lines[t].draw();
  }

  ctx.frame++;
  window.requestAnimationFrame(render);
}

function resizeCanvas() {
  const canvas = getHeroCanvas();
  if (!canvas || !ctx) return;

  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.floor(rect.width));
  const h = Math.max(1, Math.floor(rect.height));
  canvas.width = w;
  canvas.height = h;
  pos.x = w / 2;
  pos.y = h / 2;
}

export function renderCanvas(): () => void {
  const canvas = getHeroCanvas();
  if (!canvas || initialized) return () => {};

  initialized = true;
  const context = canvas.getContext('2d');
  if (!context) return () => {};

  ctx = context as TrailCtx;
  ctx.running = true;
  ctx.frame = 1;

  hueOsc = createOscillator({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 85,
    frequency: 0.0015,
    offset: 285,
  });

  resizeCanvas();
  initLines();
  render();

  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('touchmove', onPointerMove, { passive: false });
  document.addEventListener('touchstart', onTouchStart, { passive: true });

  const onResize = () => resizeCanvas();
  window.addEventListener('resize', onResize);
  document.body.addEventListener('orientationchange', onResize);

  const heroSection = canvas.closest('section');
  const ro =
    heroSection &&
    new ResizeObserver(() => {
      resizeCanvas();
    });
  if (ro && heroSection) ro.observe(heroSection);

  window.addEventListener('focus', () => {
    if (ctx && !ctx.running) {
      ctx.running = true;
      render();
    }
  });

  window.addEventListener('blur', () => {
    if (ctx) ctx.running = false;
  });

  return () => {
    if (ctx) ctx.running = false;
    document.removeEventListener('mousemove', onPointerMove);
    document.removeEventListener('touchmove', onPointerMove);
    document.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('resize', onResize);
    document.body.removeEventListener('orientationchange', onResize);
    ro?.disconnect();
    initialized = false;
    lines = [];
    ctx = null;
    hueOsc = null;
  };
}
