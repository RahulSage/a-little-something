/** Tiny canvas particle engine: ambient motes, rising hearts, confetti, sparkles. */

type Kind = 'dot' | 'confetti' | 'heart' | 'spark';

interface Particle {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  sway: number;
  age: number; // ms
  ttl: number; // ms
  size: number;
  rot: number;
  vr: number;
  color: string;
  alpha: number;
  phase: number;
}

export interface BurstOptions {
  count: number;
  /** centre angle in radians; omit for a full circle */
  angle?: number;
  spread?: number;
  power?: [number, number];
  kind?: 'confetti' | 'spark';
}

export const PALETTE = ['#F472B6', '#F9A8D4', '#FDA4AF', '#C4B5FD', '#A78BFA', '#DDD6FE', '#FFFFFF', '#EBD3A2'];
const SOFT = ['#FFFFFF', '#FFFFFF', '#FBCFE8', '#E9D5FF', '#F9A8D4', '#C4B5FD'];
const MOTES = ['#FFFFFF', '#F9A8D4', '#F472B6', '#C4B5FD', '#A78BFA', '#FBCFE8'];
const HEARTS = ['#F472B6', '#F9A8D4', '#C4B5FD', '#FDA4AF'];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: readonly T[]) => a[(Math.random() * a.length) | 0];

let heartPath: Path2D | undefined;
let sparkPath: Path2D | undefined;
const glowSprites = new Map<string, HTMLCanvasElement>();

function glow(color: string) {
  let c = glowSprites.get(color);
  if (!c) {
    c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d')!;
    const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, color);
    grad.addColorStop(0.25, color);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 32, 32);
    glowSprites.set(color, c);
  }
  return c;
}

export class Engine {
  private ctx: CanvasRenderingContext2D;
  private ps: Particle[] = [];
  private raf = 0;
  private last = 0;
  private w = 0;
  private h = 0;
  private ambient = { dots: 0, hearts: 0, still: false };

  constructor(private canvas: HTMLCanvasElement, private max = 450) {
    this.ctx = canvas.getContext('2d')!;
    heartPath ??= new Path2D('M0 1C-1.25 .25-1.15-.85-.52-.95-.2-1 0-.75 0-.55 0-.75.2-1 .52-.95 1.15-.85 1.25.25 0 1Z');
    sparkPath ??= new Path2D('M0-1Q.14-.14 1 0 .14.14 0 1-.14.14-1 0-.14-.14 0-1Z');
    this.resize();
    window.addEventListener('resize', this.resize);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.resize);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  setAmbient(dots: number, hearts: number, still = false) {
    this.ambient = { dots, hearts, still };
    this.wake();
  }

  burst(x: number, y: number, o: BurstOptions) {
    const spark = o.kind === 'spark';
    const [pmin, pmax] = o.power ?? [4, 11];
    for (let i = 0; i < o.count; i++) {
      const a = o.angle === undefined ? Math.random() * Math.PI * 2 : o.angle + rand(-1, 1) * (o.spread ?? 0.5);
      const v = rand(pmin, pmax);
      const heart = !spark && Math.random() < 0.08;
      this.add({
        kind: spark ? 'spark' : heart ? 'heart' : 'confetti',
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        gravity: spark ? 0.035 : 0.11,
        drag: spark ? 0.95 : 0.962,
        sway: spark ? 0 : rand(0.2, 0.6),
        ttl: spark ? rand(1000, 1700) : rand(3200, 5200),
        size: spark ? rand(2, 4.2) : heart ? rand(5, 8) : rand(5, 9),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.12, 0.12),
        color: pick(spark ? SOFT.concat(['#EBD3A2', '#F9A8D4']) : heart ? HEARTS : PALETTE),
        alpha: 1,
      });
    }
  }

  /** A single small heart or sparkle that drifts up and fades — for pointer/tap feedback. */
  trail(x: number, y: number, heart = Math.random() < 0.4) {
    this.add({
      kind: heart ? 'heart' : 'spark',
      x: x + rand(-10, 10),
      y: y + rand(-8, 8),
      vx: rand(-0.3, 0.3),
      vy: rand(-0.9, -0.4),
      gravity: 0,
      drag: 0.98,
      sway: 0,
      ttl: rand(700, 1100),
      size: heart ? rand(4, 6.5) : rand(2.5, 4.5),
      rot: heart ? 0 : rand(0, Math.PI),
      vr: heart ? 0 : rand(-0.05, 0.05),
      color: pick(heart ? HEARTS : SOFT.concat(['#F9A8D4', '#C4B5FD'])),
      alpha: 0.9,
    });
  }

  private add(p: Omit<Particle, 'age' | 'phase'>) {
    if (this.ps.length >= this.max) return;
    this.ps.push({ ...p, age: 0, phase: Math.random() * Math.PI * 2 });
    this.wake();
  }

  private resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    } else this.wake();
  };

  private wake() {
    if (this.raf || document.hidden) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private spawnAmbient(dt: number) {
    const { dots, hearts, still } = this.ambient;
    let n = 0;
    for (const p of this.ps) if (p.kind === 'dot') n++;
    if (n < dots) {
      this.ps.push({
        kind: 'dot',
        x: rand(0, this.w),
        y: rand(0, this.h),
        vx: 0,
        vy: still ? 0 : rand(-0.32, -0.08),
        gravity: 0,
        drag: 1,
        sway: still ? 0 : rand(0.05, 0.18),
        age: 0,
        ttl: rand(7000, 15000),
        size: rand(1, 2.6),
        rot: 0,
        vr: 0,
        color: pick(MOTES),
        alpha: rand(0.35, 0.75),
        phase: Math.random() * Math.PI * 2,
      });
    }
    if (hearts && Math.random() < hearts * dt) {
      this.ps.push({
        kind: 'heart',
        x: rand(this.w * 0.05, this.w * 0.95),
        y: this.h + 12,
        vx: 0,
        vy: rand(-0.75, -0.4),
        gravity: 0,
        drag: 1,
        sway: rand(0.15, 0.35),
        age: 0,
        ttl: rand(9000, 13000),
        size: rand(4.5, 8),
        rot: 0,
        vr: 0,
        color: pick(HEARTS),
        alpha: rand(0.3, 0.5),
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  private frame = (t: number) => {
    const ms = Math.min(t - this.last, 50);
    this.last = t;
    const dt = ms / 16.667;
    const { ctx } = this;

    this.spawnAmbient(dt);
    ctx.clearRect(0, 0, this.w, this.h);

    const alive: Particle[] = [];
    for (const p of this.ps) {
      p.age += ms;
      const drag = Math.pow(p.drag, dt);
      p.vx *= drag;
      p.vy = p.vy * drag + p.gravity * dt;
      p.x += (p.vx + Math.sin(p.age * 0.0012 + p.phase) * p.sway) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.age >= p.ttl || p.y > this.h + 40 || p.y < -40) continue;
      alive.push(p);
      this.draw(p);
    }
    this.ps = alive;
    ctx.globalAlpha = 1;

    const idle = alive.length === 0 && this.ambient.dots === 0 && this.ambient.hearts === 0;
    this.raf = idle ? 0 : requestAnimationFrame(this.frame);
  };

  private draw(p: Particle) {
    const { ctx } = this;
    const t = p.age / p.ttl;
    let a = p.alpha;
    if (p.kind === 'dot') a *= Math.sin(Math.PI * t) * (0.6 + 0.4 * Math.sin(p.phase + p.age * 0.003));
    else a *= Math.min(1, t / 0.06) * (t > 0.7 ? (1 - t) / 0.3 : 1);
    if (a <= 0.01) return;
    ctx.globalAlpha = a;

    if (p.kind === 'dot') {
      const s = p.size * 4;
      ctx.drawImage(glow(p.color), p.x - s / 2, p.y - s / 2, s, s);
      return;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.kind === 'confetti') {
      ctx.scale(1, Math.cos(p.age * 0.008 + p.phase)); // paper flutter
      ctx.fillRect(-p.size / 2, -p.size * 0.22, p.size, p.size * 0.44);
    } else {
      ctx.scale(p.size, p.size);
      ctx.fill(p.kind === 'heart' ? heartPath! : sparkPath!);
    }
    ctx.restore();
  }
}
