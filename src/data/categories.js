/* Fanlar (kategoriyalar) — test yaratish va Learn katalogi uchun */
export const CATEGORIES = [
  { id: 'matematika',  label: 'Matematika',  emoji: '🔢' },
  { id: 'fizika',      label: 'Fizika',      emoji: '⚛️' },
  { id: 'kimyo',       label: 'Kimyo',       emoji: '🧪' },
  { id: 'biologiya',   label: 'Biologiya',   emoji: '🧬' },
  { id: 'tarix',       label: 'Tarix',       emoji: '📜' },
  { id: 'geografiya',  label: 'Geografiya',  emoji: '🌍' },
  { id: 'ona-tili',    label: 'Ona tili',    emoji: '📖' },
  { id: 'ingliz-tili', label: 'Ingliz tili', emoji: '🌐' },
  { id: 'informatika', label: 'Informatika', emoji: '💻' },
  { id: 'boshqa',      label: 'Boshqa',      emoji: '📚' },
];

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id) ?? null;
