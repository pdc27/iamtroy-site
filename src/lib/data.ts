import decksRaw from '../data/decks.json';
import categoriesRaw from '../data/categories.json';
import cardsRaw from '../data/cards.json';

export type CardRef = { n: string; q: number };
export type Deck = {
  name: string;
  category: string;
  format: 'commander' | 'pauper';
  url: string;
  source: string;
  slug: string | null;
  cards: CardRef[] | null;
  sideboard?: CardRef[];
  commanders?: string[];
  colors?: string[];
  curve?: number[];
  avgCmc?: number | null;
  bracket?: number | null;
  priceUsd?: number | null;
  cover?: string | null;
  created?: string;
  updated?: string;
};
export type CardInfo = { t: string; cmc: number; mana: string; img: string | null; art: string | null; url?: string };
export type Block = { type: 'p' | 'h3'; text: string } | { type: 'ul'; items: string[] };
export type Category = { slug: string; name: string; colors: string | null; group: string; intro: Block[] };

export const decks = decksRaw as Deck[];
export const cards = cardsRaw as Record<string, CardInfo>;
export const categories = categoriesRaw as Category[];

export const COLOR_NAMES: Record<string, string> = {
  W: 'Branco', U: 'Azul', B: 'Preto', R: 'Vermelho', G: 'Verde', C: 'Incolor',
};

export const GROUPS = [
  { slug: 'mono-colored', name: 'Mono-colored', short: 'Uma cor' },
  { slug: 'duas-cores', name: 'Duas cores', short: 'Guildas' },
  { slug: 'tres-cores', name: 'Três cores', short: 'Fragmentos e clãs' },
] as const;

// Ordem de exibição das cores dentro de cada grupo
const ORDER = [
  'branco', 'azul', 'preto', 'vermelho', 'verde', 'incolor',
  'azorius', 'dimir', 'rakdos', 'gruul', 'selesnya', 'orzhov', 'izzet', 'golgari', 'boros', 'simic',
  'esper', 'grixis', 'jund', 'naya', 'bant', 'abzan', 'jeskai', 'sultai', 'mardu', 'temur',
  'wubrg',
];

export const colorCategories = categories
  .filter((c) => c.colors)
  .sort((a, b) => ORDER.indexOf(a.slug) - ORDER.indexOf(b.slug));

export const category = (slug: string) => categories.find((c) => c.slug === slug)!;

export function categoryPath(slug: string): string {
  const c = category(slug);
  if (slug === 'decks-pauper') return '/decks-pauper';
  if (slug === 'decks-commander') return '/decks-commander';
  if (c.group === 'grupo') return `/decks-commander/${slug}`;
  if (c.group === 'top') return `/decks-commander/${slug}`;
  return `/decks-commander/${c.group}/${slug}`;
}

export const decksIn = (slug: string) =>
  decks.filter((d) => d.category === slug).sort((a, b) => a.name.localeCompare(b.name, 'pt'));

export const deckHref = (d: Deck) => (d.slug ? `/decks/${d.slug}` : d.url);

export function colorLabel(colors: string | null | undefined): string {
  if (!colors) return '';
  if (colors === 'WUBRG') return 'Cinco cores';
  return colors.split('').map((c) => COLOR_NAMES[c]).join(' + ');
}

/** Descrição curta de uma categoria (primeiro parágrafo), para meta description. */
export function categorySummary(c: Category, max = 155): string {
  const p = c.intro.find((b) => b.type === 'p') as { text: string } | undefined;
  const t = p?.text ?? '';
  return t.length > max ? t.slice(0, max - 1).replace(/\s+\S*$/, '') + '…' : t;
}

export const TYPE_LABELS: Record<string, string> = {
  Commander: 'Comandante',
  Creature: 'Criaturas',
  Planeswalker: 'Planeswalkers',
  Battle: 'Batalhas',
  Instant: 'Mágicas instantâneas',
  Sorcery: 'Feitiços',
  Artifact: 'Artefatos',
  Enchantment: 'Encantamentos',
  Land: 'Terrenos',
  Other: 'Outros',
};

export function groupDeck(d: Deck) {
  const groups: Record<string, (CardRef & { info?: CardInfo })[]> = {};
  const cmdrs = new Set(d.commanders ?? []);
  for (const c of d.cards ?? []) {
    const info = cards[c.n];
    const key = cmdrs.has(c.n) ? 'Commander' : info?.t ?? 'Other';
    (groups[key] ??= []).push({ ...c, info });
  }
  const order = ['Commander', 'Creature', 'Planeswalker', 'Battle', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Land', 'Other'];
  return order
    .filter((k) => groups[k]?.length)
    .map((k) => ({
      key: k,
      label: TYPE_LABELS[k],
      count: groups[k].reduce((s, c) => s + c.q, 0),
      cards: groups[k].sort((a, b) => (a.info?.cmc ?? 0) - (b.info?.cmc ?? 0) || a.n.localeCompare(b.n)),
    }));
}

export const cardCount = (d: Deck) => (d.cards ?? []).reduce((s, c) => s + c.q, 0);

/** Lista em texto para copiar/importar (formato aceito por MTG Arena, Moxfield, LigaMagic…) */
export function deckText(d: Deck): string {
  const cmd = new Set(d.commanders ?? []);
  const main = (d.cards ?? []).filter((c) => !cmd.has(c.n));
  const head = (d.cards ?? []).filter((c) => cmd.has(c.n));
  const lines = [...head, ...main].map((c) => `${c.q} ${c.n}`);
  if (d.sideboard?.length) lines.push('', 'Sideboard', ...d.sideboard.map((c) => `${c.q} ${c.n}`));
  return lines.join('\n');
}

export const commanderImage = (d: Deck) => {
  const name = d.commanders?.[0] ?? d.name.replace(/\s*\(.*?\)\s*/g, '').trim();
  return cards[name]?.img ?? null;
};

export const latestDecks = (n: number) =>
  decks
    .filter((d) => d.slug && d.created && d.format === 'commander')
    .sort((a, b) => (b.created! > a.created! ? 1 : -1))
    .slice(0, n);
