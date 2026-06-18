/* Aylanuvchi baraban — count ta bo'lak */
const SLICE_COLORS = ['#ef5350', '#42a5f5', '#ffca28', '#66bb6a', '#ab47bc', '#26c6da', '#ff7043', '#5c6bc0', '#26a69a', '#ec407a'];

const polar = (cx, cy, r, deg) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
};
const slicePath = (i, n, r = 95, cx = 100, cy = 100) => {
  const ang = 360 / n;
  const [x1, y1] = polar(cx, cy, r, i * ang);
  const [x2, y2] = polar(cx, cy, r, (i + 1) * ang);
  const large = ang > 180 ? 1 : 0;
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
};

/* targetRotation: berilgan i-bo'lakni tepaga keltiruvchi rotatsiyani hisoblaydi */
export const rotationForIndex = (current, index, count, spins = 4) => {
  const ang = 360 / count;
  const desired = (((-(index + 0.5) * ang) % 360) + 360) % 360;
  const delta = (((desired - (current % 360)) % 360) + 360) % 360;
  return current + 360 * spins + delta;
};

const Wheel = ({ count, rotation, spinning, done = [] }) => (
  <div className="wheel-wrap">
    <div className="wheel-pointer" />
    <div
      className="wheel-spin"
      style={{
        transform: `rotate(${rotation}deg)`,
        transition: spinning ? 'transform 3.2s cubic-bezier(.17,.67,.25,1)' : 'none',
      }}
    >
      <svg viewBox="0 0 200 200">
        {Array.from({ length: count }).map((_, i) => {
          const ang = 360 / count;
          const [lx, ly] = polar(100, 100, 62, (i + 0.5) * ang);
          return (
            <g key={i}>
              <path
                d={slicePath(i, count)}
                fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                stroke="#fff"
                strokeWidth="2"
                opacity={done[i] ? 0.4 : 1}
              />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                fill="#fff" fontSize="13" fontWeight="800">
                {done[i] ? '✓' : i + 1}
              </text>
            </g>
          );
        })}
        <circle cx="100" cy="100" r="14" fill="#fff" stroke="#ddd" strokeWidth="2" />
      </svg>
    </div>
  </div>
);

export default Wheel;
