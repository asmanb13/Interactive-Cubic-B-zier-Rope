// Canvas Setup 
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();


// Vector Utilities

class Vec2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(v) { return new Vec2(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vec2(this.x - v.x, this.y - v.y); }
  mul(s) { return new Vec2(this.x * s, this.y * s); }
  length() { return Math.hypot(this.x, this.y); }
  normalize() {
    const l = this.length() || 1;
    return new Vec2(this.x / l, this.y / l);
  }
}


const presets = {
  soft:   { k: 8,  damping: 2.5 },
  medium: { k: 20, damping: 6 },
  stiff:  { k: 45, damping: 10 }
};

let currentPreset = presets.medium;

// Keyboard control
window.addEventListener("keydown", e => {
  if (e.key === "1") currentPreset = presets.soft;
  if (e.key === "2") currentPreset = presets.medium;
  if (e.key === "3") currentPreset = presets.stiff;
});

class SpringPoint {
  constructor(pos) {
    this.pos = pos;
    this.vel = new Vec2(0, 0);
    this.target = pos;
  }

  update(dt) {
    const k = currentPreset.k;
    const c = currentPreset.damping;

    const force = this.pos.sub(this.target).mul(-k);
    this.vel = this.vel.add(force.mul(dt));
    this.vel = this.vel.mul(Math.exp(-c * dt));
    this.pos = this.pos.add(this.vel.mul(dt));
  }
}


const P0 = new Vec2(150, canvas.height / 2);
const P3 = new Vec2(canvas.width - 150, canvas.height / 2);

const P1 = new SpringPoint(new Vec2(350, canvas.height / 2 - 120));
const P2 = new SpringPoint(new Vec2(canvas.width - 350, canvas.height / 2 - 120));


// Input Handling (Mouse + Touch)

let activePoint = null;

function getPointerPos(e) {
  if (e.touches) {
    return new Vec2(e.touches[0].clientX, e.touches[0].clientY);
  }
  return new Vec2(e.clientX, e.clientY);
}

function pickControlPoint(pos) {
  const d1 = P1.pos.sub(pos).length();
  const d2 = P2.pos.sub(pos).length();
  return d1 < d2 ? P1 : P2;
}

canvas.addEventListener("mousedown", e => {
  const pos = getPointerPos(e);
  activePoint = pickControlPoint(pos);
  activePoint.target = pos;
});

canvas.addEventListener("mousemove", e => {
  if (!activePoint) return;
  activePoint.target = getPointerPos(e);
});

canvas.addEventListener("mouseup", () => activePoint = null);


canvas.addEventListener("touchstart", e => {
  const pos = getPointerPos(e);
  activePoint = pickControlPoint(pos);
  activePoint.target = pos;
});

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  if (!activePoint) return;
  activePoint.target = getPointerPos(e);
}, { passive: false });

canvas.addEventListener("touchend", () => activePoint = null);


// Bézier Math

function bezier(t, p0, p1, p2, p3) {
  const u = 1 - t;
  return p0.mul(u ** 3)
    .add(p1.mul(3 * u * u * t))
    .add(p2.mul(3 * u * t * t))
    .add(p3.mul(t ** 3));
}

function bezierDerivative(t, p0, p1, p2, p3) {
  const u = 1 - t;
  return p1.sub(p0).mul(3 * u * u)
    .add(p2.sub(p1).mul(6 * u * t))
    .add(p3.sub(p2).mul(3 * t * t));
}


// Rendering

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Curve
  ctx.beginPath();
  for (let t = 0; t <= 1; t += 0.01) {
    const p = bezier(t, P0, P1.pos, P2.pos, P3);
    t === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = "#00ffd0";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Tangents
  for (let t = 0; t <= 1; t += 0.1) {
    const p = bezier(t, P0, P1.pos, P2.pos, P3);
    const d = bezierDerivative(t, P0, P1.pos, P2.pos, P3)
      .normalize()
      .mul(30);

    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + d.x, p.y + d.y);
    ctx.strokeStyle = "#ffaa00";
    ctx.stroke();
  }

  // Control points
  [P0, P1.pos, P2.pos, P3].forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  });

  // UI text
  ctx.fillStyle = "#aaa";
  ctx.font = "14px monospace";
  ctx.fillText(
    "Presets: [1] Soft  [2] Medium  [3] Stiff  | Drag points (mouse/touch)",
    20, 30
  );
}


// Main Loop

let last = performance.now();
function loop(now) {
  const dt = (now - last) / 1000;
  last = now;

  P1.update(dt);
  P2.update(dt);

  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
