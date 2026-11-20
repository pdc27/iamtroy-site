// Importa os decks listados em src/data/deck-links.json.
// - Decks do MagicFinder: baixa a lista completa de cartas.
// - Cartas: busca tipo, custo e imagem na API do Scryfall.
// Resultado: src/data/decks.json e src/data/cards.json
//
// Uso: npm run import-decks            (usa cache, só baixa o que é novo)
//      npm run import-decks -- --fresh (baixa tudo de novo)

import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DATA = path.join(ROOT, 'src/data');
const CACHE = path.join(ROOT, '.cache/magicfinder');
const FRESH = process.argv.includes('--fresh');
const UA = { 'User-Agent': 'iamtroy-site-importer/1.0', Accept: 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const slugify = (s) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/['’]/g, '').replace(/&/g, ' e ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const normName = (s) => slugify(s.replace(/\(.*?\)/g, ''));

async function fetchMagicFinder(id) {
  const file = path.join(CACHE, `${id}.json`);
  if (!FRESH) {
    try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch {}
  }
  const res = await fetch(`https://magicfinder.app/deck/${id}`, { headers: { 'User-Agent': UA['User-Agent'] } });
  if (!res.ok) throw new Error(`MagicFinder ${id}: HTTP ${res.status}`);
  const html = await res.text();
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`MagicFinder ${id}: sem dados`);
  const props = JSON.parse(m[1]).props.pageProps;
  await fs.mkdir(CACHE, { recursive: true });
  await fs.writeFile(file, JSON.stringify(props));
  await sleep(600);
  return props;
}

const TYPE_ORDER = ['Creature', 'Planeswalker', 'Battle', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Land'];
function primaryType(typeLine = '') {
  const front = typeLine.split('//')[0];
  for (const t of TYPE_ORDER) if (front.includes(t)) return t;
  return 'Other';
}

async function fetchScryfall(names, existing) {
  const todo = [...names].filter((n) => !existing[n]);
  console.log(`Scryfall: ${todo.length} cartas novas para buscar`);
  for (let i = 0; i < todo.length; i += 75) {
    const chunk = todo.slice(i, i + 75);
    const body = JSON.stringify({ identifiers: chunk.map((name) => ({ name: name.split(' // ')[0] })) });
    const res = await fetch('https://api.scryfall.com/cards/collection', {
      method: 'POST', headers: { ...UA, 'Content-Type': 'application/json' }, body,
    });
    const json = await res.json();
    const byName = new Map();
    for (const c of json.data || []) {
      byName.set(c.name.toLowerCase(), c);
      byName.set(c.name.split(' // ')[0].toLowerCase(), c);
    }
    for (const name of chunk) {
      const c = byName.get(name.toLowerCase()) || byName.get(name.split(' // ')[0].toLowerCase());
      if (!c) continue;
      const face = c.card_faces?.[0] ?? c;
      const img = c.image_uris?.normal ?? face.image_uris?.normal ?? null;
      const art = c.image_uris?.art_crop ?? face.image_uris?.art_crop ?? null;
      existing[name] = {
        t: primaryType(c.type_line),
        cmc: c.cmc ?? 0,
        mana: c.mana_cost ?? face.mana_cost ?? '',
        img, art,
        url: c.scryfall_uri?.split('?')[0],
      };
    }
    process.stdout.write(`  ${Math.min(i + 75, todo.length)}/${todo.length}\r`);
    await sleep(150);
  }
  console.log();
  return existing;
}

async function main() {
  const links = JSON.parse(await fs.readFile(path.join(DATA, 'deck-links.json'), 'utf8'));
  let cards = {};
  try { cards = JSON.parse(await fs.readFile(path.join(DATA, 'cards.json'), 'utf8')); } catch {}

  const decks = [];
  const problems = [];
  const usedSlugs = new Set();
  const allNames = new Set();

  for (const link of links) {
    const format = link.category === 'decks-pauper' ? 'pauper' : 'commander';
    const host = new URL(link.url).hostname.replace(/^www\./, '');
    const deck = {
      name: link.name, category: link.category, format, url: link.url,
      source: host.includes('magicfinder') ? 'MagicFinder' : host.includes('moxfield') ? 'Moxfield' : host.includes('lig') ? 'LigaMagic' : host,
      slug: null, cards: null, coverCard: link.coverCard,
    };
    const mf = link.url.match(/magicfinder\.app\/deck\/([0-9a-f-]{36})/);
    if (mf) {
      try {
        const { deck: d } = await fetchMagicFinder(mf[1]);
        const mfNames = [d.name, ...(d.commanders || [])].map(normName);
        const matches = mfNames.some((n) => n.includes(normName(link.name).slice(0, 8)) || normName(link.name).includes(n.slice(0, 8)));
        if (!matches && !link.verified) {
          problems.push(`"${link.name}" (${link.category}) aponta para o deck "${d.name}" no MagicFinder`);
        } else {
          deck.cards = (d.cards || []).map((c) => ({ n: c.name, q: c.quantity }));
          deck.sideboard = (d.sideboard || []).map((c) => ({ n: c.name, q: c.quantity }));
          deck.commanders = d.commanders || [];
          deck.colors = d.color_identity || [];
          deck.curve = d.mana_curve_buckets || [];
          deck.avgCmc = d.avg_cmc ?? null;
          deck.bracket = d.bracket_effective ?? d.bracket ?? null;
          deck.priceUsd = d.total_price_usd ?? null;
          deck.cover = d.cover_image_url ?? null;
          deck.created = d.created_at;
          deck.updated = d.updated_at;
          deck.cards.forEach((c) => allNames.add(c.n));
          deck.sideboard.forEach((c) => allNames.add(c.n));
        }
      } catch (e) {
        problems.push(`"${link.name}": ${e.message}`);
      }
    }
    if (deck.cards) {
      let base = (format === 'pauper' ? 'pauper-' : '') + slugify(link.name);
      let slug = base, i = 2;
      while (usedSlugs.has(slug)) slug = `${base}-${i++}`;
      usedSlugs.add(slug);
      deck.slug = slug;
    }
    decks.push(deck);

  }
  console.log();

  // Comandantes sem lista também ganham arte (para o card da listagem)
  for (const d of decks) if (!d.cards) allNames.add(d.coverCard ?? d.name.replace(/\s*\(.*?\)\s*/g, '').trim());

  cards = await fetchScryfall(allNames, cards);

  // Capa = arte do comandante (fallback: capa escolhida no MagicFinder)
  for (const d of decks) {
    const cmd = d.commanders?.[0] ?? d.coverCard ?? d.name.replace(/\s*\(.*?\)\s*/g, '').trim();
    d.cover = cards[cmd]?.art ?? d.cover ?? null;
  }

  await fs.writeFile(path.join(DATA, 'decks.json'), JSON.stringify(decks, null, 1));
  await fs.writeFile(path.join(DATA, 'cards.json'), JSON.stringify(cards));
  const withList = decks.filter((d) => d.cards).length;
  console.log(`OK: ${decks.length} decks (${withList} com lista completa), ${Object.keys(cards).length} cartas.`);
  if (problems.length) {
    console.log('\nAtenção:');
    problems.forEach((p) => console.log(' - ' + p));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
