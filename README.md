# iamtroy.com.br

Site da Troy: decks de Commander e Pauper, apps (TABS by Troy e BandWay), parcerias.
Feito com [Astro](https://astro.build): gera HTML estático, rápido e bom pra SEO.

## Rodar no computador

```bash
npm install
npm run dev        # abre em http://localhost:4321
npm run build      # gera o site final em dist/
```

## Adicionar um deck novo

1. Abra `src/data/deck-links.json` e adicione uma linha:
   ```json
   { "category": "izzet", "name": "Nome do Comandante", "url": "https://magicfinder.app/deck/...?ref=FU9P9UZN" }
   ```
   `category` é o slug da cor: `azul`, `branco`, `preto`, `vermelho`, `verde`, `incolor`,
   `azorius`, `boros`, `dimir`, `golgari`, `gruul`, `izzet`, `orzhov`, `rakdos`, `selesnya`, `simic`,
   `abzan`, `bant`, `esper`, `grixis`, `jeskai`, `jund`, `mardu`, `naya`, `sultai`, `temur`,
   `wubrg` ou `decks-pauper`.
2. Rode `npm run import-decks`. Ele baixa a lista do MagicFinder e os dados das cartas no Scryfall.
3. Faça commit e push. A Cloudflare publica sozinha em ~1 minuto.

Decks do MagicFinder ganham página própria com a lista completa (melhor pro Google).
Links da LigaMagic/Moxfield aparecem como card que abre o site externo.

## Editar textos, links, cupom e apps

Tudo em `src/data/site.ts`. Os textos de cada cor ficam em `src/data/categories.json`.

## Publicar (grátis) na Cloudflare Pages

1. Suba este projeto pra um repositório no GitHub.
2. Em dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git → escolha o repositório.
3. Configuração de build:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Depois do primeiro deploy: Custom domains → adicione `www.iamtroy.com.br` (e `iamtroy.com.br`).
5. No Google Sites, remova o domínio personalizado. No registro.br, aponte o DNS
   conforme a Cloudflare indicar (o mais simples é usar os nameservers da Cloudflare).
6. No Google Search Console, envie `https://www.iamtroy.com.br/sitemap-index.xml`.

As URLs antigas continuam funcionando (mesmo caminho), e `public/_redirects` cuida de
`/home` e de `/decks-commander/três-cores/...`.
