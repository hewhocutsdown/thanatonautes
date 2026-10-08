import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { makeBrief } from "./brief.js";

const canvas = document.getElementById("scene");
const stage = document.getElementById("stage");
const paper = document.getElementById("paper");
const paperInner = document.getElementById("paper-inner");
const hint = document.getElementById("hint");
const windBtn = document.getElementById("wind");
const tearBtn = document.getElementById("tear");
const nameInput = document.getElementById("soul-name");

const TURNS_TO_PRINT = 4;
const FULL = TURNS_TO_PRINT * Math.PI * 2;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Prefill the soul's name from ?soul=
const params = new URLSearchParams(location.search);
if (params.get("soul")) nameInput.value = params.get("soul");

// ---------------------------------------------------------------- scene

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
const target = new THREE.Vector3(0.22, -0.42, 0);

scene.add(new THREE.HemisphereLight(0xffffff, 0xf1ece2, 0.6));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(-3, 6, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -4; sun.shadow.camera.right = 4;
sun.shadow.camera.top = 4; sun.shadow.camera.bottom = -4;
sun.shadow.radius = 8;
sun.shadow.bias = -0.0005;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.ShadowMaterial({ color: 0x5a4a30, opacity: 0.12 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.8;
ground.receiveShadow = true;
scene.add(ground);

const W = 2.2, H = 1.6, D = 1.6;
const machine = new THREE.Group();
scene.add(machine);

const porcelain = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, roughness: 0.38, clearcoat: 0.7, clearcoatRoughness: 0.25,
});
const brass = new THREE.MeshStandardMaterial({ color: 0xc8a467, metalness: 1, roughness: 0.28 });
const ivory = new THREE.MeshPhysicalMaterial({ color: 0xfbf8f1, roughness: 0.25, clearcoat: 1 });
const shadowInk = new THREE.MeshStandardMaterial({ color: 0x1c1a17, roughness: 0.9 });

const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 8, 0.14), porcelain);
body.castShadow = true;
body.receiveShadow = true;
machine.add(body);

// A thin brass seam around the lid
const seam = new THREE.Mesh(new RoundedBoxGeometry(W + 0.01, 0.02, D + 0.01, 4, 0.01), brass);
seam.position.y = H / 2 - 0.3;
machine.add(seam);

// Little feet
for (const [x, z] of [[-0.85, -0.6], [0.85, -0.6], [-0.85, 0.6], [0.85, 0.6]]) {
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.06, 24), brass);
  foot.position.set(x, -H / 2 - 0.02, z);
  foot.castShadow = true;
  machine.add(foot);
}
machine.position.y = -0.8 + H / 2 + 0.05;

// Engraved plaque on the front
const plaqueCanvas = document.createElement("canvas");
plaqueCanvas.width = 1024; plaqueCanvas.height = 320;
const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
plaqueTex.colorSpace = THREE.SRGBColorSpace;
plaqueTex.anisotropy = 8;
function drawPlaque() {
  const g = plaqueCanvas.getContext("2d");
  g.clearRect(0, 0, 1024, 320);
  g.fillStyle = "#a9884f";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = '500 86px "Cormorant Garamond", Georgia, serif';
  if ("letterSpacing" in g) g.letterSpacing = "10px";
  g.fillText("BUREAU", 512, 110);
  g.font = 'italic 400 54px "Cormorant Garamond", Georgia, serif';
  if ("letterSpacing" in g) g.letterSpacing = "2px";
  g.fillText("of Incarnations", 512, 196);
  g.fillRect(352, 262, 320, 2);
  g.beginPath(); g.arc(512, 263, 7, 0, Math.PI * 2); g.fill();
  plaqueTex.needsUpdate = true;
}
drawPlaque();
document.fonts.load('500 86px "Cormorant Garamond"').then(drawPlaque).catch(() => {});
const plaque = new THREE.Mesh(
  new THREE.PlaneGeometry(1.4, 0.4375),
  new THREE.MeshStandardMaterial({ map: plaqueTex, transparent: true, roughness: 0.4, metalness: 0.3 })
);
plaque.position.set(0, 0.2, D / 2 + 0.002);
machine.add(plaque);

// The slot the brief comes out of
const SLOT_Y = -0.4, SLOT_W = 1.75;
const slotLip = new THREE.Mesh(new RoundedBoxGeometry(SLOT_W + 0.12, 0.1, 0.05, 3, 0.02), brass);
slotLip.position.set(0, SLOT_Y, D / 2 + 0.005);
machine.add(slotLip);
const slot = new THREE.Mesh(new THREE.BoxGeometry(SLOT_W, 0.026, 0.04), shadowInk);
slot.position.set(0, SLOT_Y, D / 2 + 0.017);
machine.add(slot);

// The crank, on the right-hand side
const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.05, 48), brass);
plate.rotation.z = Math.PI / 2;
plate.position.set(W / 2 + 0.02, 0.05, 0);
plate.castShadow = true;
machine.add(plate);

const crank = new THREE.Group();
crank.position.set(W / 2 + 0.04, 0.05, 0);
machine.add(crank);

const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.16, 24), brass);
axle.rotation.z = Math.PI / 2;
axle.position.x = 0.08;
const arm = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.66, 0.11, 3, 0.025), brass);
arm.position.set(0.16, 0.27, 0);
const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.075, 0.34, 32), ivory);
handle.rotation.z = Math.PI / 2;
handle.position.set(0.34, 0.54, 0);
const cap = new THREE.Mesh(new THREE.SphereGeometry(0.07, 24, 16), brass);
cap.position.set(0.52, 0.54, 0);
for (const m of [axle, arm, handle, cap]) { m.castShadow = true; crank.add(m); }

// ---------------------------------------------------------------- layout

let cw = 1, ch = 1;
function resize() {
  cw = canvas.clientWidth; ch = canvas.clientHeight;
  renderer.setSize(cw, ch, false);
  camera.aspect = cw / ch;
  // Pull back on narrow screens so the box and crank always fit.
  const fit = Math.max(1, 1.25 / camera.aspect);
  camera.position.set(1.4 * fit, 1.05 * fit, 5.6 * fit);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

const tmp = new THREE.Vector3();
function toScreen(local) {
  tmp.copy(local);
  machine.localToWorld(tmp);
  tmp.project(camera);
  return { x: (tmp.x + 1) / 2 * cw, y: (1 - tmp.y) / 2 * ch };
}

// ---------------------------------------------------------------- state

let wound = 0;           // total radians turned on the current brief
let shown = 0;           // eased paper progress 0..1
let fullHeight = 0;
let printing = false;
let finished = false;
let tearing = false;
let velocity = 0;        // radians/frame, for the paper's sway and the box's tremble
let sinceClick = 0;

function startBrief() {
  paperInner.innerHTML = makeBrief(nameInput.value);
  printing = true;
  hint.classList.add("gone");
  layoutPaper();
}

function turn(delta) {
  if (tearing) return;
  crank.rotation.x -= delta;
  const amount = Math.abs(delta);
  velocity = Math.max(velocity, amount);
  if (finished) return;
  if (!printing) startBrief();
  wound = Math.min(FULL, wound + amount);
  sinceClick += amount;
  if (sinceClick > Math.PI / 6) { sinceClick = 0; tick(); }
  if (wound >= FULL) finish();
}

function finish() {
  finished = true;
  paper.classList.add("done");
  tearBtn.hidden = false;
  windBtn.hidden = true;
  chime();
}

function tear() {
  if (!finished || tearing) return;
  tearing = true;
  paper.classList.add("flying");
  rip();
  setTimeout(() => {
    paper.classList.remove("flying", "done");
    paper.style.height = "0px";
    wound = 0; shown = 0; printing = false; finished = false; tearing = false;
    tearBtn.hidden = true;
    windBtn.hidden = false;
    stage.style.paddingBottom = "0px";
  }, reduceMotion ? 320 : 950);
}
tearBtn.addEventListener("click", tear);

// ---------------------------------------------------------------- input: drag the crank

let dragging = false;
let lastAngle = 0;
function angleAt(e) {
  const hub = toScreen(crank.position);
  const rect = canvas.getBoundingClientRect();
  return Math.atan2(e.clientY - rect.top - hub.y, e.clientX - rect.left - hub.x);
}
canvas.addEventListener("pointerdown", (e) => {
  dragging = true;
  lastAngle = angleAt(e);
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add("dragging");
  unlockAudio();
});
canvas.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const a = angleAt(e);
  let d = a - lastAngle;
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  lastAngle = a;
  turn(d);
});
const endDrag = () => { dragging = false; canvas.classList.remove("dragging"); };
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", endDrag);

// Hold-to-wind button and space bar, for anyone who'd rather not draw circles
let autoWind = false;
windBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); autoWind = true; unlockAudio(); });
for (const ev of ["pointerup", "pointerleave", "pointercancel"]) windBtn.addEventListener(ev, () => { autoWind = false; });
windBtn.addEventListener("keydown", (e) => { if (e.key === "Enter") { autoWind = true; unlockAudio(); } });
windBtn.addEventListener("keyup", (e) => { if (e.key === "Enter") autoWind = false; });
addEventListener("keydown", (e) => {
  if (e.code === "Space" && document.activeElement !== nameInput) { e.preventDefault(); autoWind = true; unlockAudio(); }
});
addEventListener("keyup", (e) => { if (e.code === "Space") autoWind = false; });

// ---------------------------------------------------------------- sound (tiny ratchet clicks)

let audio = null;
function unlockAudio() {
  if (audio) return;
  try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
}
function burst(freq, dur, gain, q = 8) {
  if (!audio) return;
  const len = Math.floor(audio.sampleRate * dur);
  const buf = audio.createBuffer(1, len, audio.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
  const src = audio.createBufferSource();
  src.buffer = buf;
  const f = audio.createBiquadFilter();
  f.type = "bandpass"; f.frequency.value = freq; f.Q.value = q;
  const g = audio.createGain(); g.gain.value = gain;
  src.connect(f).connect(g).connect(audio.destination);
  src.start();
}
const tick = () => burst(2600 + Math.random() * 600, 0.03, 0.5);
const rip = () => burst(1400, 0.35, 0.6, 0.8);
function chime() {
  if (!audio) return;
  const t = audio.currentTime;
  for (const [i, f] of [[0, 1318.5], [1, 1975.5]]) {
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t + i * 0.12);
    g.gain.linearRampToValueAtTime(0.08, t + i * 0.12 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.12 + 1.4);
    o.connect(g).connect(audio.destination);
    o.start(t + i * 0.12); o.stop(t + i * 0.12 + 1.5);
  }
}

// ---------------------------------------------------------------- paper placement

function layoutPaper() {
  const left = toScreen(new THREE.Vector3(-SLOT_W / 2, SLOT_Y, D / 2));
  const right = toScreen(new THREE.Vector3(SLOT_W / 2, SLOT_Y, D / 2));
  // Follow the slot, but never so narrow the brief becomes unreadable.
  const width = Math.min(Math.max((right.x - left.x) * 0.92, 320), cw - 32);
  const x = Math.min(Math.max((left.x + right.x) / 2 - width / 2, 16), cw - 16 - width);
  const y = (left.y + right.y) / 2;
  paper.style.left = `${x}px`;
  paper.style.top = `${y}px`;
  paper.style.width = `${width}px`;
  paperInner.style.width = `${width}px`;
  fullHeight = paperInner.offsetHeight;
  return y;
}

// ---------------------------------------------------------------- loop

const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (autoWind) turn(dt * Math.PI * 2 * 1.1);

  // Gentle settle of the eased paper progress toward the wound amount
  const goal = wound / FULL;
  shown += (goal - shown) * (reduceMotion ? 1 : Math.min(1, dt * 10));

  // A small tremble while the mechanism works
  const t = clock.elapsedTime;
  const shake = reduceMotion ? 0 : Math.min(velocity, 0.2) * 0.012;
  machine.position.x = Math.sin(t * 60) * shake;
  machine.rotation.z = Math.sin(t * 47) * shake * 0.4;
  velocity *= 0.86;

  renderer.render(scene, camera);

  if (printing && !tearing) {
    const top = layoutPaper();
    const h = shown * fullHeight;
    paper.style.height = `${h}px`;
    const sway = reduceMotion ? 0 : Math.sin(t * 2.2) * 0.25 * (1 - shown) + Math.min(velocity, 0.2) * 3;
    paper.style.transform = `rotate(${sway}deg)`;
    stage.style.paddingBottom = `${Math.max(0, top + h - ch + 24)}px`;
  }
  requestAnimationFrame(frame);
}
frame();
