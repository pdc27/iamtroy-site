// ====== CONFIGURAÇÃO GERAL DO SITE ======
// Edite aqui links, redes, cupom e apps.

export const site = {
  name: 'Troy',
  domain: 'https://www.iamtroy.com.br',
  tagline: 'Nothing is true, everything is permitted',
  description:
    'Decks de Commander e Pauper prontos pra copiar, riffs de metal e RPG de mesa. Listas completas dos vídeos da Troy, separadas por cor.',
  email: 'troy@iamtroy.com.br',
  coupon: 'TROY',
  social: {
    instagram: 'https://www.instagram.com/iamtroy_27/',
    tiktok: 'https://www.tiktok.com/@iamtroy_27',
    youtube: 'https://www.youtube.com/@iamtroy_27',
  },
  affiliateRef: 'FU9P9UZN',
};

// ====== APPS ======
// TODO(Troy): confirme os links e descrições.
export const apps = [
  {
    id: 'tabs',
    name: 'TABS by Troy',
    url: 'https://tabs.iamtroy.com.br',
    icon: '/img/app-tabs.png',
    kicker: 'App de tablatura',
    tagline: 'Música vira tablatura',
    description:
      'Envie uma música e receba a tablatura em Guitar Pro com todos os instrumentos. Separa guitarra base, riff e solo, detecta a afinação e toca a tab no navegador.',
    cta: 'Abrir o TABS',
  },
  {
    id: 'bandway',
    name: 'BandWay',
    url: 'https://bandway-3d8ff.web.app', // TODO(Troy): trocar pelo domínio oficial quando sair
    icon: '/img/app-bandway.png',
    kicker: 'Gestão de bandas',
    tagline: 'Gerencie sua banda com harmonia',
    description:
      'Organize ensaios, centralize repertórios com tom e BPM, controle cachês e custos e planeje seus shows, tudo num lugar só e sincronizado com a banda inteira.',
    cta: 'Conhecer o BandWay',
  },

];

// ====== PARCERIAS ======
export const partners = [
  { name: 'MagicFinder', logo: '/img/parceiros/magicfinder.webp', url: 'https://www.magicfinder.app/i/FU9P9UZN?utm_source=influencer&utm_medium=affiliate&utm_campaign=fu9p9uzn', note: 'App pra montar e organizar decks. Todas as minhas listas estão lá.' },
  { name: 'NextDraw Card Games', logo: '/img/parceiros/nextdraw.webp', url: 'https://www.nextdraw.com.br', note: '' },
  { name: 'Storm Card Games', logo: '/img/parceiros/storm.webp', url: 'https://mypcards.com/StormCardGames/magic', note: '' },
  { name: 'Mundo Cards', logo: '/img/parceiros/mundocards.webp', url: 'https://mundo.cards/promo/troy', note: '' },
  { name: 'Jornada Games', logo: '/img/parceiros/jornada.webp', url: 'https://www.jornadagames.com', note: '' },
  { name: '3D TCG', logo: '/img/parceiros/3dtcg.webp', url: 'https://www.instagram.com/_3dtcg/', note: '' },
  { name: 'Luz Negra Editora', logo: '/img/parceiros/luznegra.webp', url: 'https://luznegra.com.br/2cmww', note: 'Editora dos RPGs Infaernum, Tenebra e Breu.' },
];

export const rpg = [
  { name: 'Infaernum', url: 'https://luznegra.com.br/produto/combo-infaernum/' },
  { name: 'Tenebra', url: 'https://luznegra.com.br/produto/combo-tenebra/' },
  { name: 'Breu', url: 'https://luznegra.com.br/produto/combo-breu-rpg/' },
];
