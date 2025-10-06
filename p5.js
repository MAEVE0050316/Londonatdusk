// London at dusk — GUI with left sidebar & bottom toolbar
// (adds: randomize ALL, mounts canvas into #stage)

let c1, c2, d1, d2;
const Y_AXIS = 1, X_AXIS = 2;

// Red dots
let dotPositions = [];
let dotCount = 12, dotSize = 10, dotCenterXPercent = 50, dotCenterYPercent = 30, dotSpread = 80;

// Shorelines
let lines = [];

// Ferris wheel (static)
let ferrisRadius = 100;
let angle = 0;

// Purple verticals
let purpleCount = 28, purpleWeight = 4;

// Yellow line
let yellowYPercent = 60;

// Sun
let bigCircleSize = 120;

// UI refs
let ui = {};

function setup(){
  // 让画布挂到右侧工作区
  createCanvas(1024, 720).parent('stage');

  // Bind UI
  ui.purpleCount = select('#purpleCount'); ui.purpleW = select('#purpleW');
  ui.dotCount = select('#dotCount'); ui.dotSize = select('#dotSize');
  ui.dotCX = select('#dotCX'); ui.dotCY = select('#dotCY'); ui.dotSpread = select('#dotSpread');
  ui.bigCircle = select('#bigCircle'); ui.yellowY = select('#yellowY');
  ui.c1 = select('#c1'); ui.c2 = select('#c2'); ui.d1 = select('#d1'); ui.d2 = select('#d2');
  ui.randomize = select('#randomize'); ui.saveBtn = select('#saveBtn');

  // Colors
  readColorsFromUI();

  // Init values from inputs
  syncFromInputs();

  // Data
  rebuildDots();
  rebuildShorelines();

  // Events
  // Skyline
  ui.purpleCount.input(() => { setOut('#purpleCountOut', purpleCount = int(ui.purpleCount.elt.value)); redraw(); });
  ui.purpleW.input(() => { setOut('#purpleWOut', purpleWeight = int(ui.purpleW.elt.value)); redraw(); });
  // Lights
  ui.dotCount.input(() => { setOut('#dotCountOut', dotCount = int(ui.dotCount.elt.value)); rebuildDots(); redraw(); });
  ui.dotSize.input(() => { setOut('#dotSizeOut', dotSize = int(ui.dotSize.elt.value)); redraw(); });
  ui.dotCX.input(() => { setOut('#dotCXOut', dotCenterXPercent = int(ui.dotCX.elt.value)); rebuildDots(); redraw(); });
  ui.dotCY.input(() => { setOut('#dotCYOut', dotCenterYPercent = int(ui.dotCY.elt.value)); rebuildDots(); redraw(); });
  ui.dotSpread.input(() => { setOut('#dotSpreadOut', dotSpread = int(ui.dotSpread.elt.value)); rebuildDots(); redraw(); });
  // Sun & horizon
  ui.bigCircle.input(() => { setOut('#bigCircleOut', bigCircleSize = int(ui.bigCircle.elt.value)); redraw(); });
  ui.yellowY.input(() => { setOut('#yellowYOut', yellowYPercent = int(ui.yellowY.elt.value)); redraw(); });
  // Colors
  ui.c1.input(() => { readColorsFromUI(); redraw(); });
  ui.c2.input(() => { readColorsFromUI(); redraw(); });
  ui.d1.input(() => { readColorsFromUI(); redraw(); });
  ui.d2.input(() => { readColorsFromUI(); redraw(); });

  // Toolbar actions
  ui.randomize.mousePressed(randomizeAll);
  ui.saveBtn.mousePressed(() => saveCanvas('London_at_dusk','png'));

  noLoop();
}

function setOut(id, v){ select(id).html(v); }

function syncFromInputs(){
  purpleCount = int(ui.purpleCount.elt.value);
  purpleWeight = int(ui.purpleW.elt.value);

  dotCount = int(ui.dotCount.elt.value);
  dotSize = int(ui.dotSize.elt.value);
  dotCenterXPercent = int(ui.dotCX.elt.value);
  dotCenterYPercent = int(ui.dotCY.elt.value);
  dotSpread = int(ui.dotSpread.elt.value);

  bigCircleSize = int(ui.bigCircle.elt.value);
  yellowYPercent = int(ui.yellowY.elt.value);

  setOut('#purpleCountOut', purpleCount);
  setOut('#purpleWOut', purpleWeight);
  setOut('#dotCountOut', dotCount);
  setOut('#dotSizeOut', dotSize);
  setOut('#dotCXOut', dotCenterXPercent);
  setOut('#dotCYOut', dotCenterYPercent);
  setOut('#dotSpreadOut', dotSpread);
  setOut('#bigCircleOut', bigCircleSize);
  setOut('#yellowYOut', yellowYPercent);
}

function readColorsFromUI(){
  c1 = color(ui.c1.elt.value);
  c2 = color(ui.c2.elt.value);
  d1 = color(ui.d1.elt.value);
  d2 = color(ui.d2.elt.value);
}

function rebuildDots(){
  dotPositions = [];
  const cx = (dotCenterXPercent/100) * width;
  const cy = (dotCenterYPercent/100) * height;
  for (let i = 0; i < dotCount; i++){
    let x = cx + randomGaussian(0, dotSpread);
    let y = cy + randomGaussian(0, dotSpread * 0.4);
    x = constrain(x, 0, width);
    y = constrain(y, 0, height);
    dotPositions.push(createVector(x, y));
  }
}

function rebuildShorelines(){
  lines = [];
  for (let i = 0; i < 20; i++) {
    let startPoint = createVector(random(width/3), random(height/2, height/5));
    let endPoint = p5.Vector.add(startPoint, random(10, 20));
    lines.push({ start: startPoint, end: endPoint });
  }
}

/* ---------- RANDOMIZE ALL ---------- */
function randomizeAll(){
  // 颜色调色盘（更和谐）
  const palettes = [
    { c1:'#003cc1', c2:'#c694ff', d1:'#013a7a', d2:'#ff8f3f' },         // 经典黄昏
    { c1:'#ff00cc', c2:'#3300ff', d1:'#111111', d2:'#00ffcc' },         // 霓虹
    { c1:'#c0c0c0', c2:'#5a5a5a', d1:'#2f2f4f', d2:'#1a1a1a' },         // 薄雾
    { c1:'#ffb703', c2:'#8ecae6', d1:'#023047', d2:'#fb8500' }          // 温暖天空
  ];
  const p = random(palettes);

  // 随机参数（带合理范围）
  ui.purpleCount.elt.value = int(random(5, 60));
  ui.purpleW.elt.value     = int(random(2, 12));

  ui.dotCount.elt.value  = int(random(5, 80));
  ui.dotSize.elt.value   = int(random(6, 20));
  ui.dotCX.elt.value     = int(random(10, 90));
  ui.dotCY.elt.value     = int(random(10, 60));
  ui.dotSpread.elt.value = int(random(20, 160));

  ui.bigCircle.elt.value = int(random(80, 220));
  ui.yellowY.elt.value   = int(random(40, 70));

  ui.c1.elt.value = p.c1; ui.c2.elt.value = p.c2;
  ui.d1.elt.value = p.d1; ui.d2.elt.value = p.d2;

  // 同步到内部状态与输出
  readColorsFromUI();
  syncFromInputs();
  rebuildDots();
  redraw();
}

/* ---------- DRAWING ---------- */
function draw(){
  background(0);

  // Gradients
  setGradient(0, 0, width, height*0.6, c1, c2, Y_AXIS);
  setGradient(0, height*0.6, width, height/2, d2, d1, X_AXIS);

  // Orange lines
  stroke(255,106,0); strokeWeight(8);
  line(width/3, height/3, width, height/3);
  strokeWeight(7);
  line(width/4, height/2.8, width-30, height/2.8);

  // Big N shapes
  noFill(); strokeWeight(30); stroke(0,22,84,100);
  beginShape(); vertex(width/2,height); vertex(width/2,height/2.5); vertex(width-8,height); vertex(width-8,height/2.5); endShape();
  noFill(); strokeWeight(20); stroke(70,63,191);
  beginShape(); vertex(width/2,height); vertex(width/2,height/2.5); vertex(width-8,height); vertex(width-8,height/2.5); endShape();

  // L & D
  textAlign(CENTER, CENTER);
  let textSizeD = 450, textSizeL = 500, offsetD = 20, xD = width/2, yD = height-122;
  noStroke();
  fill(255,95,0,200); textSize(textSizeL); text('L', 100, height-155);
  fill(122,61,230);   text('L', 100+offsetD, height-155);
  push(); translate(xD-offsetD, yD); rotate(-HALF_PI); fill(255,241,0,200); textSize(textSizeD); text('D',0,0); pop();
  fill(6,46,167); push(); translate(xD, yD); rotate(-HALF_PI); textSize(textSizeD); text('D',0,0); pop();

  // Big red sun
  stroke(223,62,67,100); strokeWeight(16); fill(192,23,73,250);
  ellipse(width/5, height*0.6, bigCircleSize, bigCircleSize);

  // Mast & spoke
  stroke(0); strokeWeight(10); line(width*0.89, height*0.6, width*0.89, height/7);
  line(width*0.89, height/7, 0, height/2);
  push(); translate(width*0.89, height/7); rotate(angle + TWO_PI); line(0,0, ferrisRadius, 150); pop();

  // Lights
  noStroke(); fill(197,0,41);
  for (let p of dotPositions) ellipse(p.x, p.y, dotSize, dotSize);

  // Purple verticals
  stroke(139,79,248); strokeWeight(purpleWeight);
  drawPurpleSets(purpleCount);

  // Dashed verticals
  stroke(139,79,248); strokeWeight(purpleWeight+1);
  let dashIntervals = [30, 50, 70, 90, 0];
  let startdlY = 0, enddlY = height * 0.6;
  for (let i = 0; i < dashIntervals.length; i++){
    let x = width/2 + dashIntervals[i];
    let lineLength = map(i, 0, dashIntervals.length-3, 10, 50);
    drawVerticalDashLine(x, startdlY, enddlY/2, lineLength, 12);
  }

  // Horizon
  let yy = (yellowYPercent/100) * height;
  stroke(253,229,59,150); strokeWeight(14);
  line(0, yy, width, yy);

  // Shorelines
  stroke(255,216,0); strokeWeight(4);
  for (let L of lines) line(L.start.x, L.start.y, L.end.x, L.end.y);
}

// Purple groups
function drawPurpleSets(total){
  const leftN   = int(total * 0.4);
  const midN    = int(total * 0.2);
  const rightN  = total - leftN - midN;

  for (let i = 0; i < leftN; i++){
    const x = random(0, width * 0.2);
    const L = random(120, 300);
    drawVerticalLine(x, L);
  }
  for (let i = 0; i < midN; i++){
    const x = random(width*0.52, width*0.70);
    const L = random(80, 160);
    drawVerticalLine(x, L);
  }
  for (let i = 0; i < rightN; i++){
    const x = random(width*0.85, width*0.95);
    const L = random(110, 180);
    drawVerticalLine(x, L);
  }
}

function drawVerticalLine(x, length){
  const startY = (yellowYPercent/100) * height;
  line(x, startY, x, startY - length);
}

function drawVerticalDashLine(x, startdlY, enddlY, lineLength, gap){
  for (let y = startdlY; y <= enddlY - lineLength; y += lineLength + gap){
    line(x, y, x, y + lineLength);
  }
}

function setGradient(x, y, w, h, cA, cB, axis){
  noFill();
  if (axis === Y_AXIS){
    for (let i = y; i <= y + h; i++){
      const inter = map(i, y, y + h, 0, 1);
      const c = lerpColor(cA, cB, inter);
      stroke(c); line(x, i, x + w, i);
    }
  } else {
    for (let i = x; i <= x + w; i++){
      const inter = map(i, x, x + w, 0, 1);
      const c = lerpColor(d1, d2, inter);
      stroke(c); line(i, y, i, y + h);
    }
  }
}
``
