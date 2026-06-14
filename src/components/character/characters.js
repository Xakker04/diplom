/* ──────────────────────────────────────────────
   Personajlar — kod ichida chiziladigan 3D modellar
   (Character3D.jsx ichida). Internet/fayl kerak emas.
   ────────────────────────────────────────────── */

export const CHARACTERS = [
  { id: 'boy',  label: 'Bola', emoji: '👦' },
  { id: 'girl', label: 'Qiz',  emoji: '👧' },
];

export const getCharacter = (id) => CHARACTERS.find((c) => c.id === id) ?? null;
