// Generates a distinct, deterministic gradient "poster" from a movie's title,
// so every film gets a stable, good-looking placeholder without external images.
const PALETTES = [
  ['#B23A2E', '#0A0C10'],
  ['#E7B33E', '#0A0C10'],
  ['#3E5C76', '#0A0C10'],
  ['#5C4B8A', '#0A0C10'],
  ['#2E7D6B', '#0A0C10'],
  ['#8A2D24', '#12151C'],
];

function hashString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function PosterArt({ title = '', className = '' }) {
  const hash = hashString(title);
  const [from, to] = PALETTES[hash % PALETTES.length];
  const angle = 135 + (hash % 90);
  const initials = title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(${angle}deg, ${from}, ${to})` }}
    >
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 4px)',
        }}
      />
      <span className="font-display text-4xl text-paper/90 tracking-tight" aria-hidden="true">
        {initials || '🎬'}
      </span>
    </div>
  );
}