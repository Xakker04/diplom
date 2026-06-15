/* ───────────────────────────────────────────────
   Kahoot uslubidagi hayvon avatarlari (8 ta)
   <Avatar id="moose" size={64} />
   ─────────────────────────────────────────────── */

export const AVATARS = [
  { id: 'moose',  label: "Bug'u",  bg: '#6a2c91' },
  { id: 'fox',    label: 'Tulki',  bg: '#159a8e' },
  { id: 'cat',    label: 'Mushuk', bg: '#e8932b' },
  { id: 'dog',    label: 'It',     bg: '#3f7fd0' },
  { id: 'bear',   label: 'Ayiq',   bg: '#6aa84f' },
  { id: 'panda',  label: 'Panda',  bg: '#e8506e' },
  { id: 'rabbit', label: 'Quyon',  bg: '#5b6dee' },
  { id: 'frog',   label: 'Baqa',   bg: '#d98324' },
];

/* ── Umumiy ko'zlar (aniq qorachiqli) ── */
const Eyes = ({ x1 = 38, x2 = 62, y = 54, r = 9 }) => {
  const yy = Number(y);
  const rr = Number(r);
  return (
    <g>
      <circle cx={x1} cy={yy} r={rr} fill="#fff" />
      <circle cx={x2} cy={yy} r={rr} fill="#fff" />
      <circle cx={x1} cy={yy + 1} r={rr * 0.62} fill="#1e1e1e" />
      <circle cx={x2} cy={yy + 1} r={rr * 0.62} fill="#1e1e1e" />
      <circle cx={x1 + 2} cy={yy - 1.5} r={rr * 0.2} fill="#fff" />
      <circle cx={x2 + 2} cy={yy - 1.5} r={rr * 0.2} fill="#fff" />
    </g>
  );
};

/* ── Umumiy qalpoq (rasmdagidek) ── */
const Cap = () => (
  <g>
    <path d="M26 31 Q50 5 74 31 Z" fill="#4a2472" />
    <path d="M50 31 Q81 29 83 41 Q66 36 50 35 Z" fill="#5b2a86" />
    <ellipse cx="50" cy="31" rx="24" ry="5" fill="#3d1d5e" />
    <text x="50" y="23" textAnchor="middle" fontSize="12" fontWeight="800"
      fill="#fff" fontFamily="'Arial', sans-serif">Q</text>
  </g>
);

/* ── Hayvonlar ── */
const Moose = () => (
  <g>
    <path d="M34 28 Q26 16 27 8 M27 15 Q21 11 16 12 M27 11 Q26 5 30 3"
      stroke="#7a4a28" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M66 28 Q74 16 73 8 M73 15 Q79 11 84 12 M73 11 Q74 5 70 3"
      stroke="#7a4a28" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="21" cy="52" rx="9" ry="13" fill="#7a4a28" transform="rotate(-22 21 52)" />
    <ellipse cx="79" cy="52" rx="9" ry="13" fill="#7a4a28" transform="rotate(22 79 52)" />
    <ellipse cx="50" cy="58" rx="30" ry="29" fill="#9c6b43" />
    <ellipse cx="50" cy="76" rx="18" ry="13" fill="#b98a5e" />
    <ellipse cx="43" cy="75" rx="2.6" ry="3.6" fill="#5a3b22" />
    <ellipse cx="57" cy="75" rx="2.6" ry="3.6" fill="#5a3b22" />
    <Eyes y="54" />
  </g>
);

const Fox = () => (
  <g>
    <path d="M22 30 L34 48 L18 50 Z" fill="#ef7d2e" />
    <path d="M78 30 L66 48 L82 50 Z" fill="#ef7d2e" />
    <path d="M24 34 L32 46 L23 47 Z" fill="#fff" />
    <path d="M76 34 L68 46 L77 47 Z" fill="#fff" />
    <path d="M50 30 C28 30 26 56 36 66 C44 74 56 74 64 66 C74 56 72 30 50 30 Z" fill="#ef7d2e" />
    <path d="M50 60 C40 60 38 68 50 80 C62 68 60 60 50 60 Z" fill="#fff" />
    <Eyes y="54" r="8" />
    <ellipse cx="50" cy="70" rx="4" ry="3" fill="#2a2a2a" />
  </g>
);

const Cat = () => (
  <g>
    <path d="M24 30 L30 50 L40 42 Z" fill="#9aa3ab" />
    <path d="M76 30 L70 50 L60 42 Z" fill="#9aa3ab" />
    <path d="M27 34 L31 46 L36 42 Z" fill="#ffc2d1" />
    <path d="M73 34 L69 46 L64 42 Z" fill="#ffc2d1" />
    <ellipse cx="50" cy="58" rx="29" ry="27" fill="#9aa3ab" />
    <Eyes y="54" />
    <path d="M50 64 l-4 4 l4 3 l4 -3 Z" fill="#ff9bb3" />
    <path d="M50 71 v6" stroke="#5a5f66" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 64 h-14 M30 70 h-13 M70 64 h14 M70 70 h13"
      stroke="#e8edf2" strokeWidth="2" strokeLinecap="round" />
  </g>
);

const Dog = () => (
  <g>
    <ellipse cx="22" cy="58" rx="11" ry="18" fill="#7a5230" transform="rotate(-12 22 58)" />
    <ellipse cx="78" cy="58" rx="11" ry="18" fill="#7a5230" transform="rotate(12 78 58)" />
    <ellipse cx="50" cy="56" rx="29" ry="28" fill="#c8895a" />
    <ellipse cx="50" cy="72" rx="16" ry="13" fill="#e3b48a" />
    <Eyes y="52" />
    <ellipse cx="50" cy="68" rx="5" ry="3.6" fill="#3a2a1a" />
    <path d="M50 71 v6" stroke="#7a5230" strokeWidth="2" strokeLinecap="round" />
  </g>
);

const Bear = () => (
  <g>
    <circle cx="26" cy="34" r="12" fill="#8b5e3c" />
    <circle cx="74" cy="34" r="12" fill="#8b5e3c" />
    <circle cx="26" cy="34" r="6" fill="#b98a5e" />
    <circle cx="74" cy="34" r="6" fill="#b98a5e" />
    <ellipse cx="50" cy="58" rx="30" ry="28" fill="#8b5e3c" />
    <ellipse cx="50" cy="70" rx="15" ry="12" fill="#c9a279" />
    <Eyes y="53" r="8" />
    <ellipse cx="50" cy="66" rx="5" ry="3.8" fill="#3a2a1a" />
  </g>
);

const Panda = () => (
  <g>
    <circle cx="25" cy="32" r="12" fill="#2a2a2a" />
    <circle cx="75" cy="32" r="12" fill="#2a2a2a" />
    <ellipse cx="50" cy="58" rx="30" ry="28" fill="#fff" />
    <ellipse cx="38" cy="55" rx="9" ry="12" fill="#2a2a2a" transform="rotate(-18 38 55)" />
    <ellipse cx="62" cy="55" rx="9" ry="12" fill="#2a2a2a" transform="rotate(18 62 55)" />
    <circle cx="38" cy="55" r="5.5" fill="#fff" />
    <circle cx="62" cy="55" r="5.5" fill="#fff" />
    <circle cx="38" cy="56" r="3.2" fill="#1e1e1e" />
    <circle cx="62" cy="56" r="3.2" fill="#1e1e1e" />
    <circle cx="39.5" cy="53.5" r="1.2" fill="#fff" />
    <circle cx="63.5" cy="53.5" r="1.2" fill="#fff" />
    <ellipse cx="50" cy="68" rx="4.5" ry="3.5" fill="#2a2a2a" />
    <path d="M50 71 q-5 6 -10 4 M50 71 q5 6 10 4" stroke="#2a2a2a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
  </g>
);

const Rabbit = () => (
  <g>
    <ellipse cx="38" cy="22" rx="8" ry="20" fill="#eef0f5" transform="rotate(-10 38 22)" />
    <ellipse cx="62" cy="22" rx="8" ry="20" fill="#eef0f5" transform="rotate(10 62 22)" />
    <ellipse cx="38" cy="22" rx="3.5" ry="13" fill="#ffb7cd" transform="rotate(-10 38 22)" />
    <ellipse cx="62" cy="22" rx="3.5" ry="13" fill="#ffb7cd" transform="rotate(10 62 22)" />
    <ellipse cx="50" cy="60" rx="28" ry="26" fill="#eef0f5" />
    <Eyes y="56" />
    <path d="M50 65 l-4 4 l4 2.5 l4 -2.5 Z" fill="#ff9bb3" />
    <path d="M46 73 a4 4 0 0 0 8 0" fill="#fff" stroke="#d7dbe3" strokeWidth="1" />
  </g>
);

const Frog = () => (
  <g>
    {/* bosh */}
    <ellipse cx="50" cy="62" rx="31" ry="27" fill="#5cb85c" />
    {/* bo'rtgan ko'zlar (yuzda, shapkadan pastda) */}
    <circle cx="34" cy="50" r="12" fill="#6fbf46" />
    <circle cx="66" cy="50" r="12" fill="#6fbf46" />
    <circle cx="34" cy="50" r="8.5" fill="#fff" />
    <circle cx="66" cy="50" r="8.5" fill="#fff" />
    <circle cx="34" cy="51" r="5" fill="#1e1e1e" />
    <circle cx="66" cy="51" r="5" fill="#1e1e1e" />
    <circle cx="36" cy="48.5" r="1.6" fill="#fff" />
    <circle cx="68" cy="48.5" r="1.6" fill="#fff" />
    {/* keng og'iz */}
    <path d="M32 71 Q50 84 68 71" stroke="#2f7d32" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    {/* burun teshiklari */}
    <circle cx="46" cy="65" r="1.7" fill="#2f7d32" />
    <circle cx="54" cy="65" r="1.7" fill="#2f7d32" />
  </g>
);

const ANIMALS = {
  moose: Moose, fox: Fox, cat: Cat, dog: Dog,
  bear: Bear, panda: Panda, rabbit: Rabbit, frog: Frog,
};

export const getAvatar = (id) => AVATARS.find((a) => a.id === id) ?? AVATARS[0];

const Avatar = ({ id = 'moose', size = 64 }) => {
  const conf = getAvatar(id);
  const Animal = ANIMALS[conf.id] ?? Moose;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <rect x="0" y="0" width="100" height="100" rx="20" fill={conf.bg} />
      <Animal />
      <Cap />
    </svg>
  );
};

export default Avatar;
