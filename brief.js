// Generates one soul's incarnation brief. Same name → same brief.

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PREVIOUS_LIVES = [
  "lighthouse keeper, Brittany",
  "glassblower, Murano",
  "cartographer who never left home",
  "midwife in a mountain village",
  "soldier who deserted at dawn",
  "silk merchant, Samarkand",
  "monastery beekeeper",
  "tram conductor, Lisbon",
  "court musician, dismissed for laughing",
  "fisherman's widow who outlived three storms",
  "village schoolteacher, 41 years",
  "minor poet, unpublished",
  "pharmacist with a secret garden",
  "circus strongman",
  "copyist of other people's letters",
];

const LAST_LESSON = [
  "You learned patience. Too much of it.",
  "You learned to be brave and forgot to be gentle.",
  "You were kind to everyone except yourself.",
  "You kept every promise but the one to your own heart.",
  "You hoarded what should have been given.",
  "You were loved and did not notice.",
  "You waited for permission that never came.",
  "You ran from the one conversation that mattered.",
];

const ANGELS = [
  "Edmond", "Ulysses", "Mireille", "Anouk", "Bastien", "Clémence",
  "Théo", "Irène", "Lucien", "Solange", "Raphaëlle", "Gaspard",
];

const ANGEL_TRAITS = [
  "overworked, three clients at once",
  "newly promoted, very earnest",
  "fond of coincidences",
  "speaks mostly through music on the radio",
  "has a dry sense of humour",
  "was once a sceptic",
  "a former librarian",
];

// Werber's angels nudge their clients through these channels.
const LEVERS = ["Dreams", "Intuitions", "Signs", "Mediums", "Cats"];

const WHY = [
  "You came to learn that you are allowed to take up space.",
  "You came to forgive someone who will never apologise.",
  "You came to make one ordinary place a little more beautiful.",
  "You came to finish a conversation from a previous life.",
  "You came to be loved without earning it.",
  "You came to choose curiosity over fear, again and again.",
  "You came to teach someone what you once had to learn alone.",
  "You came to stop explaining yourself.",
  "You came to build something that outlasts your name.",
  "You came to laugh at the right moments, and at the wrong ones.",
  "You came to understand the why — and then to let it go.",
  "You came to be the calm one in the room.",
  "You came to love a place, not just the people in it.",
  "You came to learn that rest is not a reward.",
  "You came to say the brave thing in a small voice.",
];

const MAIN_QUESTS = [
  ["The Unfinished Bridge", "Reconcile with someone you were sure you'd never speak to again."],
  ["The Lantern", "Become the person someone younger calls when everything goes dark."],
  ["The Long Apprenticeship", "Master one craft so well that it starts teaching you back."],
  ["The Open Door", "Build a home where strangers feel they have been expected."],
  ["The Honest Map", "Tell the true story of where you came from, out loud, at least once."],
  ["The Second Spring", "Begin something important after everyone assumes you are finished."],
  ["The Quiet Rebellion", "Refuse, gracefully, the life others designed for you."],
  ["The Gardener", "Plant things whose shade you will never sit in."],
  ["The Translator", "Help two people who love each other finally understand what the other meant."],
  ["The Keeper of Recipes", "Carry a family's food, songs or stories one generation further."],
  ["The Late Bloom", "Discover, well after forty, the thing you were always meant to do."],
  ["The Unbuilt Wall", "Break a pattern that has run through your family for at least three lives."],
  ["The Ferryman", "Walk someone you love all the way to the edge of their life, and let them go."],
  ["The Wanderer's Return", "Leave home far enough to see it, then come back and stay."],
  ["The Small Republic", "Gather a handful of people who would cross a city for each other."],
  ["The Mirror", "Be told the truth about yourself by a stranger, and believe it."],
];

const SIDE_QUESTS = [
  ["Learn the name of one tree on your street", "+3 pts"],
  ["Return a book you borrowed years ago", "+5 pts"],
  ["Cook a meal for someone who is grieving", "+12 pts"],
  ["Admit you were wrong within the same hour", "+8 pts"],
  ["Watch a sunrise without photographing it", "+4 pts"],
  ["Write a letter by hand and actually send it", "+6 pts"],
  ["Pet every cat who asks. They are on the payroll", "+2 pts each"],
  ["Visit the sea at least once a decade", "+5 pts"],
  ["Teach a child a card trick", "+3 pts"],
  ["Say no to something that pays well but costs too much", "+15 pts"],
  ["Thank a teacher, a nurse or a bus driver by name", "+4 pts"],
  ["Sing badly, in public, sober", "+7 pts"],
  ["Finish one thing you started in a previous decade", "+9 pts"],
  ["Sit with someone in silence until they're ready to speak", "+11 pts"],
  ["Learn to make bread from scratch, then give the first loaf away", "+6 pts"],
  ["Apologise to an animal you once misjudged", "+2 pts"],
  ["Plant a tree you will not see grow up", "+8 pts"],
  ["Go somewhere alone where nobody speaks your language", "+7 pts"],
  ["Keep a plant alive for an entire year", "+4 pts"],
  ["Tell a friend exactly why they matter to you", "+10 pts"],
  ["Dance at a wedding before anyone else does", "+5 pts"],
  ["Ask your oldest relative what they were like at your age", "+9 pts"],
  ["Lose an argument gracefully", "+6 pts"],
  ["Notice a dream, write it down and take it seriously", "+3 pts"],
  ["Lend something you'd rather keep", "+5 pts"],
  ["Stay up late enough to see the stars properly", "+3 pts"],
];

const KPIS = [
  ["Kindness to strangers", "per week", [3, 7]],
  ["Moments of real attention", "per day", [2, 6]],
  ["Grudges released", "per year", [2, 5]],
  ["Belly laughs", "per week", [5, 14]],
  ["Promises kept to self", "per month", [4, 10]],
  ["Lessons learned the first time", "per year", [3, 8]],
  ["Risks taken for love", "per decade", [2, 6]],
  ["Hours spent being needlessly worried", "per week, max", [2, 4], true],
  ["Truths told when silence was easier", "per month", [1, 4]],
  ["Things made with your hands", "per season", [1, 4]],
  ["Compliments given and meant", "per week", [4, 10]],
  ["Coincidences noticed", "per month", [2, 7]],
  ["Apologies that weren't needed", "per week, max", [1, 3], true],
  ["Letters, calls or visits to the old", "per month", [2, 5]],
  ["New things tried", "per season", [2, 6]],
  ["Evenings with no screen at all", "per month", [3, 8]],
  ["Times you asked for help", "per month", [1, 4]],
  ["Meals eaten slowly, with company", "per week", [3, 7]],
];

const OBSTACLES = [
  "A recurring dream you will ignore twice.",
  "A charming person who is not part of the plan.",
  "A comfortable job in roughly your mid-thirties.",
  "Your own impressive talent for postponing.",
  "One inherited fear that isn't actually yours.",
  "A door that looks locked but isn't.",
  "The opinion of people who will not be at your funeral.",
  "Mondays.",
];

const ACHIEVEMENTS = [
  "The Butterfly — change a stranger's day without ever knowing it",
  "Full Circle — return to where you started and recognise it",
  "Unexpected Teacher — learn the key lesson from someone half your age",
  "Lightness — go one whole year without a grudge",
  "The Witness — be present at a birth, a death and a wedding",
  "Second Wind — change your mind about something you were sure of at 20",
];

const ARCHANGELS = ["Gabriel", "Raphael", "Michael"];

// Souls the Bureau keeps a special file on. Half the time, one of these replaces the usual Why.
const SPECIAL_SOULS = ["ruslana", "руслана", "veronique"];
const SPECIAL_WHY = [
  "You came to learn that you can be loved.",
  "You came to learn not to apologise.",
  "You came to wear a unicorn onesie.",
];
const fold = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
function pickN(r, arr, n) {
  const pool = arr.slice();
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return out;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function makeBrief(name) {
  const clean = (name || "").trim();
  const seed = clean ? hash(clean.toLowerCase()) : (Math.random() * 2 ** 32) >>> 0;
  const r = rng(seed);

  const fileNo = String(seed % 1000000).padStart(6, "0");
  const incarnation = 40 + Math.floor(r() * 180);
  const born = 1300 + Math.floor(r() * 560);
  const died = born + 30 + Math.floor(r() * 55);
  const prev = pick(r, PREVIOUS_LIVES);
  const lesson = pick(r, LAST_LESSON);
  const score = 180 + Math.floor(r() * 380);

  const angel = pick(r, ANGELS);
  const trait = pick(r, ANGEL_TRAITS);
  const levers = pickN(r, LEVERS, 2 + Math.floor(r() * 2));
  let why = pick(r, WHY);
  // A fresh coin each time the crank turns, so this half doesn't follow the name's seed.
  if (SPECIAL_SOULS.includes(fold(clean)) && Math.random() < 0.5) {
    why = SPECIAL_WHY[Math.floor(Math.random() * SPECIAL_WHY.length)];
  }
  const [mqTitle, mqText] = pick(r, MAIN_QUESTS);
  const sides = pickN(r, SIDE_QUESTS, 4);
  const kpis = pickN(r, KPIS, 4);
  const obstacles = pickN(r, OBSTACLES, 2);
  const achievement = pick(r, ACHIEVEMENTS);
  const archangel = pick(r, ARCHANGELS);

  // Werber's split: 25% heredity, 25% karma, 50% free will.
  const split = [25, 25, 50];

  const kpiHtml = kpis.map(([label, unit, [lo, hi], inverse]) => {
    const target = lo + Math.floor(r() * (hi - lo + 1));
    const actual = Math.max(0, Math.round(target * (inverse ? 0.6 + r() * 1.4 : 0.35 + r() * 0.9)));
    const ratio = inverse ? (actual === 0 ? 1 : Math.min(1, target / actual)) : Math.min(1, actual / target);
    const filled = Math.round(ratio * 12);
    const bar = "█".repeat(filled) + "░".repeat(12 - filled);
    const status = ratio >= 0.95 ? ["ok", "on track"] : ratio >= 0.6 ? ["watch", "drifting"] : ["behind", "behind"];
    return `<div class="b-kpi">
      <div><b>${esc(label)}</b> <span class="status ${status[0]}">${status[1]}</span></div>
      <div class="bar">${bar}</div>
      <div class="b-row"><span>target ${target} ${esc(unit)}</span><span>actual ${actual}</span></div>
    </div>`;
  }).join("");

  const who = clean ? esc(clean) : "Soul (unnamed)";

  return `
    <div class="b-head">
      <div class="b-sub">Paradise &middot; Dept. of Incarnations</div>
      <div class="b-title">Incarnation Brief</div>
      <div class="b-sub">File № ${fileNo}</div>
    </div>
    <hr class="b-rule double">
    <div class="b-row"><span>Soul</span><span>${who}</span></div>
    <div class="b-row"><span>Incarnation</span><span>#${incarnation}</span></div>
    <div class="b-row"><span>Previous life</span><span>${esc(prev)}, ${born}–${died}</span></div>
    <div class="b-row"><span>Judgment score</span><span>${score} pts</span></div>
    <div class="b-row"><span>Guardian angel</span><span>${angel}</span></div>
    <div class="b-row"><span></span><span><i>${esc(trait)}</i></span></div>
    <div class="b-row"><span>Authorised levers</span><span>${levers.join(", ")}</span></div>
    <hr class="b-rule">
    <p class="b-h">Notes from your last judgment</p>
    <p style="margin:0">${esc(lesson)}</p>
    <hr class="b-rule">
    <p class="b-h">The Why</p>
    <p class="b-why">“${esc(why)}”</p>
    <hr class="b-rule">
    <p class="b-h">Composition of this life</p>
    <div class="b-split"><i style="flex:${split[0]}"></i><i style="flex:${split[1]}"></i><i style="flex:${split[2]}"></i></div>
    <div class="b-legend"><span>heredity ${split[0]}%</span><span>karma ${split[1]}%</span><span>free will ${split[2]}%</span></div>
    <hr class="b-rule">
    <p class="b-h">Main quest</p>
    <div class="b-quest"><b>${esc(mqTitle)}</b><small>${esc(mqText)}</small></div>
    <p class="b-h" style="margin-top:14px">Side quests</p>
    ${sides.map(([q, pts]) => `<div class="b-row b-quest"><span style="color:inherit">☐ ${esc(q)}</span><span>${esc(pts)}</span></div>`).join("")}
    <hr class="b-rule">
    <p class="b-h">Key performance indicators</p>
    ${kpiHtml}
    <hr class="b-rule">
    <p class="b-h">Known obstacles (scheduled)</p>
    <ul class="b-list">${obstacles.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>
    <p class="b-h" style="margin-top:14px">Hidden achievement</p>
    <p style="margin:0">${esc(achievement)}</p>
    <hr class="b-rule double">
    <p style="margin:0;text-align:center">You chose this. You were enthusiastic about it.<br>Do not attempt to read ahead.</p>
    <div class="b-sign">
      <div>
        <div class="sig">${archangel}</div>
        <div class="who">for the Tribunal of Three Archangels</div>
      </div>
      <div class="stamp">Approved<br>before birth</div>
    </div>
    <div class="b-foot">— keep this slip · it will be collected at the end —</div>
  `;
}
