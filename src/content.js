/**
 * ─────────────────────────────────────────────────────────────
 *  CONTEÚDO DO LIVRO
 *  Edite tudo aqui. Os textos abaixo são placeholders.
 * ─────────────────────────────────────────────────────────────
 */

export const author = {
  name: 'Matheus Andrade',
  first: 'Matheus',
  last: 'Andrade',
  monogram: 'MA',
  role: 'Desenvolvedor Front-end',
  subtitle: 'Uma obra sobre interfaces, movimento e o ofício de construir para a web',
  city: 'São Paulo',
  year: 2026,
  edition: 'Primeira edição',
  epigraph: {
    text: 'Os detalhes não são detalhes. Eles fazem o design.',
    source: 'Charles Eames',
  },
};

export const prologue = {
  title: 'Prólogo',
  heading: 'Quem escreve estas páginas',
  epigraph: {
    text: 'Toda interface é uma história contada em pixels — e toda história merece ser bem contada.',
    source: 'Nota do autor',
  },
  intro: 'Antes dos capítulos, uma apresentação.',
  paragraphs: [
    'Sou desenvolvedor front-end e passo os dias no ponto exato onde o design encontra o código. Gosto de transformar ideias estáticas em experiências que respiram: interfaces rápidas, acessíveis e com movimento que tem propósito.',
    'Trabalho há mais de seis anos construindo produtos digitais para startups, agências e marcas que se importam com o acabamento. Acredito que performance é estética, que acessibilidade é respeito e que um bom sistema de componentes é uma forma de gentileza com quem vem depois.',
  ],
  quote: 'Construo para a web como quem encaderna um livro: cada costura importa, mesmo as que ninguém vê.',
  facts: [
    ['Base', 'São Paulo, Brasil'],
    ['Ofício', '6+ anos'],
    ['Idiomas', 'Português, Inglês'],
    ['Agora', 'Aberto a projetos'],
  ],
};

export const arsenal = {
  title: 'Arsenal',
  heading: 'Ferramentas do ofício',
  epigraph: {
    text: 'Dê-me seis horas para derrubar uma árvore e passarei as quatro primeiras afiando o machado.',
    source: 'Atribuído a Abraham Lincoln',
  },
  intro:
    'Um artesão é tão bom quanto as ferramentas que domina — e tão sábio quanto as que escolhe não usar.',
  principles: [
    ['Performance', 'é a primeira impressão.'],
    ['Acessibilidade', 'não é opcional.'],
    ['Movimento', 'deve explicar, não distrair.'],
  ],
  groups: [
    { name: 'Linguagens', items: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'GLSL'] },
    { name: 'Interfaces', items: ['React', 'Next.js', 'Vue', 'Astro', 'Tailwind'] },
    { name: 'Movimento & 3D', items: ['GSAP', 'Three.js', 'R3F', 'Framer Motion', 'WebGL'] },
    { name: 'Ofício', items: ['Figma', 'Storybook', 'Vitest', 'Playwright', 'Git'] },
    { name: 'Infra', items: ['Node.js', 'Vercel', 'Supabase', 'GraphQL', 'CI/CD'] },
  ],
};

export const works = {
  title: 'Obras',
  heading: 'Trabalhos selecionados',
  epigraph: {
    text: 'Feito é melhor que perfeito — mas bem-feito é melhor que feito.',
    source: 'Provérbio de oficina',
  },
  intro: 'Três obras escolhidas entre muitas. Cada uma ensinou algo que as outras não poderiam.',
  minor: [
    ['Kit de Ícones Linha Fina', 'https://github.com/'],
    ['Biblioteca de Easings', 'https://github.com/'],
    ['Tipógrafo — gerador de escalas', 'https://github.com/'],
  ],
  items: [
    {
      title: 'Atlas',
      kicker: 'Plataforma de dados geoespaciais',
      year: '2025',
      role: 'Front-end líder',
      description:
        'Mapa interativo em WebGL que renderiza milhões de pontos em tempo real. Reescrevi a camada de visualização, reduzindo o tempo de carregamento em 63% e tornando a navegação fluida até em dispositivos modestos.',
      stack: ['React', 'TypeScript', 'Three.js', 'Web Workers'],
      link: 'https://github.com/',
      seed: { a: 5, b: 3, loops: 28, r: 0.62 },
    },
    {
      title: 'Maré',
      kicker: 'E-commerce de moda autoral',
      year: '2024',
      role: 'Desenvolvimento & motion',
      description:
        'Loja headless com transições de página cinematográficas e um catálogo que se comporta como uma revista. Conversão 28% maior após o relançamento, com nota 98 de performance no Lighthouse.',
      stack: ['Next.js', 'GSAP', 'Shopify', 'Tailwind'],
      link: 'https://github.com/',
      seed: { a: 7, b: 4, loops: 34, r: 0.55 },
    },
    {
      title: 'Lume',
      kicker: 'Design system multi-marca',
      year: '2023',
      role: 'Arquitetura de componentes',
      description:
        'Sistema de design com 80+ componentes acessíveis, tokens multi-tema e documentação viva. Adotado por quatro produtos e seis times, cortou pela metade o tempo de entrega de novas telas.',
      stack: ['Vue', 'Storybook', 'Style Dictionary', 'Vitest'],
      link: 'https://github.com/',
      seed: { a: 9, b: 2, loops: 40, r: 0.7 },
    },
  ],
};

export const journey = {
  title: 'Jornada',
  heading: 'Linha do tempo',
  epigraph: {
    text: 'O caminho se faz ao caminhar.',
    source: 'Antonio Machado',
  },
  intro: 'Os lugares por onde passei e o que cada um deixou na minha forma de trabalhar.',
  items: [
    {
      period: '2024 — hoje',
      role: 'Front-end Sênior',
      place: 'Estúdio Norte',
      text: 'Lidero a camada de interface de produtos com foco em motion e 3D para marcas globais.',
    },
    {
      period: '2022 — 2024',
      role: 'Front-end Pleno',
      place: 'Fintech Aurora',
      text: 'Construí o design system e a nova experiência web do app, usada por 2 milhões de pessoas.',
    },
    {
      period: '2020 — 2022',
      role: 'Desenvolvedor Front-end',
      place: 'Agência Prisma',
      text: 'Sites institucionais e campanhas interativas premiadas para clientes de varejo e cultura.',
    },
    {
      period: '2019',
      role: 'Primeira linha de código',
      place: 'Autodidata',
      text: 'Um tutorial de HTML, uma madrugada inteira e a certeza de que era isso.',
    },
  ],
};

export const epilogue = {
  title: 'Epílogo',
  heading: 'Correspondência',
  epigraph: {
    text: 'Toda boa história merece uma continuação.',
    source: 'Anônimo',
  },
  intro:
    'Se chegou até aqui, talvez tenhamos algo a construir juntos. Escreva — respondo toda carta com o mesmo cuidado com que escrevo código.',
  email: 'contato@matheusandrade.dev',
  availability: 'Disponível para projetos freelance e posições remotas a partir de janeiro.',
  links: [
    ['GitHub', 'https://github.com/'],
    ['LinkedIn', 'https://linkedin.com/'],
    ['Instagram', 'https://instagram.com/'],
    ['Currículo (PDF)', '#'],
  ],
};

export const colophon = {
  text: [
    'Este volume foi composto em Cormorant Garamond e EB Garamond, impresso em HTML, CSS e JavaScript, e encadernado com GSAP.',
    'Nenhum framework foi ferido durante sua produção.',
  ],
};
