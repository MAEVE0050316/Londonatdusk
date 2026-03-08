// London at Dusk — staged, product-like interaction logic
// Modes:
// 1. Edit   -> static, fully editable
// 2. Playing -> only after pressing Play Animation
// 3. Paused -> frozen frame, no motion
//
// If user changes left-side controls while Playing/Paused:
// immediately return to Edit mode and show new static state.

let c1, c2, d1, d2;
const Y_AXIS = 1, X_AXIS = 2;

let ui = {};

let shorelines = [];
let ferrisRadius = 100;
let angle = 0;

// ----- mode -----
const MODE_EDIT = 'edit';
const MODE_PLAYING = 'playing';
const MODE_PAUSED = 'paused';
let mode = MODE_EDIT;

// ----- speed -----
let speedFactor = 1.0;
let baseTransitionSpeed = 0.0012;

// ----- animation state -----
let currentState = {};
let targetState = {};
let transitionProgress = 0;

// ----- seeds -----
const MAX_DOTS = 100;
let dotSeeds = [];

const MAX_SKYLINE = 80;
let skylineSeeds = [];

// ----- default state -----
const defaultState = {
  purpleCount: 28,
  purpleW: 4,

  dotCount: 12,
  dotSize: 10,
  dotCX: 50,
  dotCY: 30,
  dotSpread: 80,

  bigCircleSize: 120,
  yellowY: 60,

  c1: '#003cc1',
  c2: '#c694ff',
  d1: '#567dde',
  d2: '#ff8f3f'
};

const palettes = [
  { c1: '#003cc1', c2: '#c694ff', d1: '#013a7a', d2: '#ff8f3f' },
  { c1: '#2b4cff', c2: '#d58fff', d1: '#162b63', d2: '#ff9c52' },
  { c1: '#ff7b00', c2: '#ffd166', d1: '#274c77', d2: '#5fa8d3' },
  { c1: '#5b4b8a', c2: '#e4a5ff', d1: '#1f2a44', d2: '#ffb870' },
  { c1: '#4a6cf7', c2: '#9bd3ff', d1: '#203047', d2: '#f4a261' }
];



function setup() {
  createCanvas(1024, 720).parent('stage');

  bindUIRefs();
  generateDotSeeds();
  generateSkylineSeeds();
  rebuildShorelines();

  applyStateToUI(defaultState);
  currentState = { ...defaultState };
  targetState = { ...defaultState };
  transitionProgress = 0;
  speedFactor = float(ui.speed.value());
  updateSpeedOutput();

  bindUIEvents();
  setMode(MODE_EDIT);

  frameRate(60);
}

function draw() {
  background(0);

  const transitionSpeed = baseTransitionSpeed * speedFactor;

  if (mode === MODE_PLAYING) {
    transitionProgress += transitionSpeed;

    if (transitionProgress >= 1) {
      currentState = { ...targetState };
      targetState = generateRandomStateNear(currentState);
      transitionProgress = 0;
    }
  }

  let state;
  if (mode === MODE_EDIT) {
    state = readStateFromInputs();
    currentState = { ...state };
    targetState = { ...state };
    transitionProgress = 0;
  } else if (mode === MODE_PAUSED) {
    state = interpolateState(currentState, targetState, easeInOutSine(constrain(transitionProgress, 0, 1)));
  } else {
    state = interpolateState(currentState, targetState, easeInOutSine(constrain(transitionProgress, 0, 1)));
  }

  c1 = color(state.c1);
  c2 = color(state.c2);
  d1 = color(state.d1);
  d2 = color(state.d2);

  const motionTime = (mode === MODE_PLAYING) ? frameCount * speedFactor : 0;

  const dayNightBlend = map(state.yellowY, 52, 66, 0, 1, true);
  const warmGlow = map(red(d2), 80, 255, 0, 1, true);

const skylineBase = lerpColor(
  lerpColor(c2, color('#9b5cff'), 0.45),
  lerpColor(d1, color('#596a8a'), 0.45),
  dayNightBlend
);

const skylineColor = lerpColor(skylineBase, color('#ff4fa3'), warmGlow * 0.25);

const skylineDashBase = lerpColor(
  lerpColor(color('#ff6bd6'), c2, 0.35),
  lerpColor(d1, color('#7a86a8'), 0.4),
  dayNightBlend
);

const skylineDashColor = lerpColor(skylineDashBase, color('#ff6b8a'), warmGlow * 0.2);


const sunBase = lerpColor(
  lerpColor(c2, color('#ff8c42'), 0.45),
  lerpColor(color('#ff5e62'), color('#ffcf70'), 0.5),
  dayNightBlend
);

const sunRedPeak = lerpColor(color('#ff4d4d'), color('#ff2f5b'), 0.5);

const sunFill = lerpColor(sunBase, sunRedPeak, warmGlow * 0.45);

const sunStrokeBase = lerpColor(
  lerpColor(c2, color('#ffd36a'), 0.3),
  lerpColor(color('#ff8a5b'), color('#ffe08a'), 0.5),
  dayNightBlend
);

const sunStroke = lerpColor(sunStrokeBase, color('#ff6a6a'), warmGlow * 0.35);
const dotBaseA = lerpColor(c2, color('#ffd36a'), 0.55);
const dotBaseB = lerpColor(d2, color('#ff7f50'), 0.40);

const dotRedA = color('#ff5a5a');
const dotRedB = color('#ff2f4f');

const dotColorA = lerpColor(dotBaseA, dotRedA, warmGlow * 0.5);
const dotColorB = lerpColor(dotBaseB, dotRedB, warmGlow * 0.45);

  const horizonColor = lerpColor(color('#ffe66d'), c2, 0.18);
  const shorelineColor = lerpColor(color('#ffd84d'), d2, 0.12);

  if (mode === MODE_PLAYING) {
    angle += 0.0012 * speedFactor;
  }

  drawSceneBase(state, horizonColor, shorelineColor);
  drawStructuralLines(state);
  drawLetters(state, motionTime);
  drawSun(state.bigCircleSize, sunFill, sunStroke, motionTime);
  drawMast();
  drawAnimatedDots(state, dotColorA, dotColorB, motionTime);
  drawPurpleSets(state, skylineColor, motionTime);
  drawDashedVerticals(state, skylineDashColor);

  if (frameCount % 8 === 0) {
    updateOutputs(state);
  }
}

// ---------- UI ----------
function bindUIRefs() {
  ui.purpleCount = select('#purpleCount');
  ui.purpleW = select('#purpleW');
  ui.dotCount = select('#dotCount');
  ui.dotSize = select('#dotSize');
  ui.dotCX = select('#dotCX');
  ui.dotCY = select('#dotCY');
  ui.dotSpread = select('#dotSpread');
  ui.bigCircle = select('#bigCircle');
  ui.yellowY = select('#yellowY');
  ui.c1 = select('#c1');
  ui.c2 = select('#c2');
  ui.d1 = select('#d1');
  ui.d2 = select('#d2');

  ui.playBtn = select('#playBtn');
  ui.pauseBtn = select('#pauseBtn');
  ui.resetBtn = select('#resetBtn');
  ui.randomize = select('#randomize');
  ui.saveBtn = select('#saveBtn');
  ui.speed = select('#speedControl');
  ui.speedOut = select('#speedOut');
  ui.modeNote = select('#modeNote');
}

function bindUIEvents() {
  const leftInputs = [
    ui.purpleCount, ui.purpleW,
    ui.dotCount, ui.dotSize, ui.dotCX, ui.dotCY, ui.dotSpread,
    ui.bigCircle, ui.yellowY,
    ui.c1, ui.c2, ui.d1, ui.d2
  ];

  leftInputs.forEach(el => {
    el.input(() => {
      // 无论在 playing 还是 paused，只要动左边参数，立刻回 Edit
      if (mode !== MODE_EDIT) {
        setMode(MODE_EDIT);
      }
      updateOutputs(readStateFromInputs());
    });
  });

  ui.speed.input(() => {
    speedFactor = float(ui.speed.value());
    updateSpeedOutput();
  });

  ui.playBtn.mousePressed(onPlay);
  ui.pauseBtn.mousePressed(onPause);
  ui.resetBtn.mousePressed(onReset);
  ui.randomize.mousePressed(onRandomizeTarget);
  ui.saveBtn.mousePressed(() => saveCanvas('London_at_dusk_motion', 'png'));
}

function onPlay() {
  if (mode === MODE_EDIT) {
    currentState = readStateFromInputs();
    targetState = generateRandomStateNear(currentState);
    transitionProgress = 0;
    setMode(MODE_PLAYING);
    return;
  }

  if (mode === MODE_PAUSED) {
    setMode(MODE_PLAYING);
    return;
  }
}

function onPause() {
  if (mode === MODE_PLAYING) {
    setMode(MODE_PAUSED);
  }
}

function onReset() {
  applyStateToUI(defaultState);
  currentState = { ...defaultState };
  targetState = { ...defaultState };
  transitionProgress = 0;
  angle = 0;
  setMode(MODE_EDIT);
}

function onRandomizeTarget() {
  if (mode === MODE_EDIT) {
    const s = generateRandomState();
    applyStateToUI(s);
    currentState = { ...s };
    targetState = { ...s };
    transitionProgress = 0;
    return;
  }

  // playing / paused 时，作为新的目标状态
  const displayed = interpolateState(
    currentState,
    targetState,
    easeInOutSine(constrain(transitionProgress, 0, 1))
  );
  currentState = { ...displayed };
  targetState = generateRandomStateNear(displayed);
  transitionProgress = 0;
}

function setMode(nextMode) {
  mode = nextMode;

  if (mode === MODE_EDIT) {
    ui.modeNote.html('Edit mode — adjust your preferred dusk, then press Play Animation.');
  } else if (mode === MODE_PLAYING) {
    ui.modeNote.html('Playing — animation is running from your current composition. Adjust speed below.');
  } else if (mode === MODE_PAUSED) {
    ui.modeNote.html('Paused — current frame is frozen. Press Play Animation to continue.');
  }
}

function updateSpeedOutput() {
  ui.speedOut.html(nf(speedFactor, 1, 2) + '×');
}

function readStateFromInputs() {
  return {
    purpleCount: int(ui.purpleCount.elt.value),
    purpleW: float(ui.purpleW.elt.value),

    dotCount: int(ui.dotCount.elt.value),
    dotSize: float(ui.dotSize.elt.value),
    dotCX: int(ui.dotCX.elt.value),
    dotCY: int(ui.dotCY.elt.value),
    dotSpread: float(ui.dotSpread.elt.value),

    bigCircleSize: float(ui.bigCircle.elt.value),
    yellowY: float(ui.yellowY.elt.value),

    c1: ui.c1.elt.value,
    c2: ui.c2.elt.value,
    d1: ui.d1.elt.value,
    d2: ui.d2.elt.value
  };
}

function applyStateToUI(state) {
  ui.purpleCount.elt.value = int(state.purpleCount);
  ui.purpleW.elt.value = state.purpleW;
  ui.dotCount.elt.value = int(state.dotCount);
  ui.dotSize.elt.value = state.dotSize;
  ui.dotCX.elt.value = int(state.dotCX);
  ui.dotCY.elt.value = int(state.dotCY);
  ui.dotSpread.elt.value = state.dotSpread;
  ui.bigCircle.elt.value = state.bigCircleSize;
  ui.yellowY.elt.value = state.yellowY;
  ui.c1.elt.value = state.c1;
  ui.c2.elt.value = state.c2;
  ui.d1.elt.value = state.d1;
  ui.d2.elt.value = state.d2;

  updateOutputs(state);
}

function updateOutputs(state) {
  setOut('#purpleCountOut', int(state.purpleCount));
  setOut('#purpleWOut', nf(state.purpleW, 1, 1));
  setOut('#dotCountOut', int(state.dotCount));
  setOut('#dotSizeOut', nf(state.dotSize, 1, 1));
  setOut('#dotCXOut', int(state.dotCX));
  setOut('#dotCYOut', int(state.dotCY));
  setOut('#dotSpreadOut', nf(state.dotSpread, 1, 1));
  setOut('#bigCircleOut', nf(state.bigCircleSize, 1, 1));
  setOut('#yellowYOut', nf(state.yellowY, 1, 1));
}

function setOut(id, v) {
  select(id).html(v);
}

// ---------- State generation ----------
function generateRandomState() {
  const p = random(palettes);
  return {
    purpleCount: int(random(14, 38)),
    purpleW: random(2.4, 6.5),

    dotCount: int(random(12, 42)),
    dotSize: random(7, 14),
    dotCX: int(random(28, 72)),
    dotCY: int(random(18, 42)),
    dotSpread: random(42, 105),

    bigCircleSize: random(100, 175),
    yellowY: random(52, 66),

    c1: p.c1,
    c2: p.c2,
    d1: p.d1,
    d2: p.d2
  };
}

function generateRandomStateNear(base) {
  const paletteShift = random() < 0.4;
  const p = paletteShift ? random(palettes) : null;

  return {
    purpleCount: constrain(base.purpleCount + int(random(-8, 9)), 8, 50),
    purpleW: constrain(base.purpleW + random(-1.2, 1.2), 2, 10),

    dotCount: constrain(base.dotCount + int(random(-10, 11)), 6, 60),
    dotSize: constrain(base.dotSize + random(-2, 2), 5, 20),
    dotCX: constrain(base.dotCX + int(random(-10, 11)), 10, 90),
    dotCY: constrain(base.dotCY + int(random(-8, 9)), 8, 55),
    dotSpread: constrain(base.dotSpread + random(-20, 20), 20, 160),

    bigCircleSize: constrain(base.bigCircleSize + random(-18, 18), 80, 220),
    yellowY: constrain(base.yellowY + random(-4, 4), 38, 72),

    c1: paletteShift ? p.c1 : base.c1,
    c2: paletteShift ? p.c2 : base.c2,
    d1: paletteShift ? p.d1 : base.d1,
    d2: paletteShift ? p.d2 : base.d2
  };
}

function interpolateState(a, b, t) {
  return {
    purpleCount: lerp(a.purpleCount, b.purpleCount, t),
    purpleW: lerp(a.purpleW, b.purpleW, t),

    dotCount: lerp(a.dotCount, b.dotCount, t),
    dotSize: lerp(a.dotSize, b.dotSize, t),
    dotCX: lerp(a.dotCX, b.dotCX, t),
    dotCY: lerp(a.dotCY, b.dotCY, t),
    dotSpread: lerp(a.dotSpread, b.dotSpread, t),

    bigCircleSize: lerp(a.bigCircleSize, b.bigCircleSize, t),
    yellowY: lerp(a.yellowY, b.yellowY, t),

    c1: colorToHex(lerpColor(color(a.c1), color(b.c1), t)),
    c2: colorToHex(lerpColor(color(a.c2), color(b.c2), t)),
    d1: colorToHex(lerpColor(color(a.d1), color(b.d1), t)),
    d2: colorToHex(lerpColor(color(a.d2), color(b.d2), t))
  };
}

function colorToHex(c) {
  return '#' + hex(int(red(c)), 2) + hex(int(green(c)), 2) + hex(int(blue(c)), 2);
}

// ---------- Seeds ----------
function generateDotSeeds() {
  dotSeeds = [];
  for (let i = 0; i < MAX_DOTS; i++) {
    dotSeeds.push({
      baseX: random(),
      baseY: random(),
      phaseA: random(TWO_PI),
      phaseB: random(TWO_PI),
      twinkle: random(TWO_PI)
    });
  }
}

function generateSkylineSeeds() {
  skylineSeeds = [];
  for (let i = 0; i < MAX_SKYLINE; i++) {
    skylineSeeds.push({
      rx: random(),
      rl: random(),
      phase: random(TWO_PI)
    });
  }
}

function rebuildShorelines() {
  shorelines = [];
  for (let i = 0; i < 20; i++) {
    let sx = random(width / 3);
    let sy = random(height / 5, height / 2);
    let ex = sx + random(10, 22);
    let ey = sy + random(-3, 3);
    shorelines.push({ start: createVector(sx, sy), end: createVector(ex, ey) });
  }
}

// ---------- Drawing ----------
function drawSceneBase(state, horizonColor, shorelineColor) {
  setGradient(0, 0, width, height * 0.6, c1, c2, Y_AXIS);
  setGradient(0, height * 0.6, width, height / 2, d2, d1, X_AXIS);

  let yy = (state.yellowY / 100) * height;
  stroke(horizonColor);
  strokeWeight(14);
  line(0, yy, width, yy);

  drawShorelines(shorelineColor);
}

function drawStructuralLines(state) {
  const lineColorA = lerpColor(color(state.d2), color('#ff7a00'), 0.55);
  stroke(lineColorA);
  strokeWeight(8);
  line(width / 3, height / 3, width, height / 3);
  strokeWeight(7);
  line(width / 4, height / 2.8, width - 30, height / 2.8);

  noFill();
  strokeWeight(30);
  stroke(0, 22, 84, 85);
  beginShape();
  vertex(width / 2, height);
  vertex(width / 2, height / 2.5);
  vertex(width - 8, height);
  vertex(width - 8, height / 2.5);
  endShape();

  noFill();
  strokeWeight(20);
  stroke(lerpColor(color(state.c1), color('#6d58ff'), 0.35));
  beginShape();
  vertex(width / 2, height);
  vertex(width / 2, height / 2.5);
  vertex(width - 8, height);
  vertex(width - 8, height / 2.5);
  endShape();
}

function drawLetters(state, motionTime) {
  textAlign(CENTER, CENTER);

  const phase = 0.5 + 0.5 * sin(motionTime * 0.006);

  const L1 = lerpColor(
    lerpColor(color(state.d2), color('#ff7c2a'), 0.35),
    lerpColor(color(state.c2), color('#ffd166'), 0.35),
    phase
  );

  const N1 = lerpColor(
    lerpColor(color(state.c1), color('#8b64ff'), 0.45),
    lerpColor(color(state.c2), color('#ff7de3'), 0.25),
    phase
  );

  const D1 = lerpColor(
    lerpColor(color('#ffe95c'), color(state.c2), 0.18),
    lerpColor(color('#ffcf70'), color(state.d2), 0.18),
    phase
  );

  const D2 = lerpColor(
    lerpColor(color('#062ea7'), color(state.c1), 0.25),
    lerpColor(color(state.d1), color('#3b5b92'), 0.2),
    phase
  );

  const lPulse = sin(motionTime * 0.005) * 6;
  const dPulse = cos(motionTime * 0.0045) * 5;

  let textSizeD = 450 + dPulse;
  let textSizeL = 500 + lPulse;
  let offsetD = 20;
  let xD = width / 2;
  let yD = height - 122;

  noStroke();

  fill(L1);
  textSize(textSizeL);
  text('L', 100, height - 155);

  fill(N1);
  text('N', 138 + offsetD, height - 155);

  push();
  translate(xD - offsetD, yD);
  rotate(-HALF_PI);
  fill(D1);
  textSize(textSizeD);
  text('D', 0, 0);
  pop();

  fill(D2);
  push();
  translate(xD, yD);
  rotate(-HALF_PI);
  textSize(textSizeD);
  text('D', 0, 0);
  pop();
}

function drawSun(sizeVal, fillCol, strokeCol, motionTime) {
  let breathe = sin(motionTime * 0.01) * 2.2;
  stroke(strokeCol);
  strokeWeight(16);
  fill(fillCol);
  ellipse(width / 5, height * 0.6, sizeVal + breathe, sizeVal + breathe);
}

function drawMast() {
  stroke(0, 0, 0, 180);
  strokeWeight(10);
  line(width * 0.89, height * 0.6, width * 0.89, height / 7);
  line(width * 0.89, height / 7, 0, height / 2);

  push();
  translate(width * 0.89, height / 7);
  rotate(angle);
  line(0, 0, ferrisRadius, 150);
  pop();
}

function drawAnimatedDots(state, colA, colB, motionTime) {
  const count = int(state.dotCount);
  const cx = (state.dotCX / 100) * width;
  const cy = (state.dotCY / 100) * height;
  const spread = state.dotSpread;
  const baseSize = state.dotSize;

  noStroke();

  for (let i = 0; i < count; i++) {
    const s = dotSeeds[i];

    let x = cx + map(s.baseX, 0, 1, -spread, spread);
    let y = cy + map(s.baseY, 0, 1, -spread * 0.35, spread * 0.35);

    x += sin(motionTime * 0.004 + s.phaseA) * 1.2;
    y += cos(motionTime * 0.005 + s.phaseB) * 0.8;

    const twinkle = 0.5 + 0.5 * sin(motionTime * 0.018 + s.twinkle);
    const sizeNow = baseSize + twinkle * 0.9;

    const dc = lerpColor(colA, colB, s.baseY * 0.65);
    fill(red(dc), green(dc), blue(dc), 210);
    ellipse(constrain(x, 0, width), constrain(y, 0, height), sizeNow, sizeNow);

    fill(red(dc), green(dc), blue(dc), 45);
    ellipse(constrain(x, 0, width), constrain(y, 0, height), sizeNow * 2.1, sizeNow * 2.1);
  }
}

function drawPurpleSets(state, skylineColor, motionTime) {
  stroke(skylineColor);
  strokeWeight(state.purpleW);

  const total = int(state.purpleCount);
  const leftN = int(total * 0.4);
  const midN = int(total * 0.2);
  const rightN = total - leftN - midN;

  let idx = 0;

  for (let i = 0; i < leftN; i++, idx++) {
    const seed = skylineSeeds[idx];
    const x = map(seed.rx, 0, 1, 0, width * 0.2);
    const L = map(seed.rl, 0, 1, 120, 300) + sin(motionTime * 0.004 + seed.phase) * 2.5;
    drawVerticalLine(x, L, state.yellowY);
  }

  for (let i = 0; i < midN; i++, idx++) {
    const seed = skylineSeeds[idx];
    const x = map(seed.rx, 0, 1, width * 0.52, width * 0.70);
    const L = map(seed.rl, 0, 1, 80, 160) + sin(motionTime * 0.0045 + seed.phase) * 2.0;
    drawVerticalLine(x, L, state.yellowY);
  }

  for (let i = 0; i < rightN; i++, idx++) {
    const seed = skylineSeeds[idx];
    const x = map(seed.rx, 0, 1, width * 0.85, width * 0.95);
    const L = map(seed.rl, 0, 1, 110, 180) + sin(motionTime * 0.0042 + seed.phase) * 2.0;
    drawVerticalLine(x, L, state.yellowY);
  }
}

function drawVerticalLine(x, length, yellowYVal) {
  const startY = (yellowYVal / 100) * height;
  line(x, startY, x, startY - length);
}

function drawDashedVerticals(state, dashColor) {
  stroke(dashColor);
  strokeWeight(state.purpleW + 0.8);

  let dashIntervals = [30, 50, 70, 90, 0];
  let startdlY = 0;
  let enddlY = height * 0.3;

  for (let i = 0; i < dashIntervals.length; i++) {
    let x = width / 2 + dashIntervals[i];
    let lineLength = map(i, 0, dashIntervals.length - 3, 10, 50);
    drawVerticalDashLine(x, startdlY, enddlY, lineLength, 12);
  }
}

function drawVerticalDashLine(x, startdlY, enddlY, lineLength, gap) {
  for (let y = startdlY; y <= enddlY - lineLength; y += lineLength + gap) {
    line(x, y, x, y + lineLength);
  }
}

function drawShorelines(col) {
  stroke(col);
  strokeWeight(4);
  for (let L of shorelines) {
    line(L.start.x, L.start.y, L.end.x, L.end.y);
  }
}

function setGradient(x, y, w, h, cA, cB, axis) {
  noFill();
  if (axis === Y_AXIS) {
    for (let i = y; i <= y + h; i++) {
      const inter = map(i, y, y + h, 0, 1);
      const c = lerpColor(cA, cB, inter);
      stroke(c);
      line(x, i, x + w, i);
    }
  } else {
    for (let i = x; i <= x + w; i++) {
      const inter = map(i, x, x + w, 0, 1);
      const c = lerpColor(cA, cB, inter);
      stroke(c);
      line(i, y, i, y + h);
    }
  }
}

function easeInOutSine(x) {
  return -(cos(PI * x) - 1) / 2;
}
