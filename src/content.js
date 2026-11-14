/**
 * ─────────────────────────────────────────────────────────────
 *  CONTEÚDO DO LIVRO
 *  Fonte: perfil github.com/anddrad3, README do perfil e
 *  READMEs dos repositórios. Edite tudo aqui.
 * ─────────────────────────────────────────────────────────────
 */

export const github = 'anddrad3';

export const author = {
  name: 'Matheus Andrade',
  fullName: 'Matheus da Silva Andrade',
  first: 'Matheus',
  last: 'Andrade',
  monogram: 'MA',
  role: 'Desenvolvedor Full Stack',
  roleShort: ['Full', 'Stack'],
  subtitle: 'Uma obra sobre código, educação e pesquisa acadêmica',
  city: 'Franca, SP',
  year: 2026,
  edition: 'Primeira edição',
  epigraph: {
    text: 'Ensinar não é transferir conhecimento, mas criar as possibilidades para a sua própria produção ou a sua construção.',
    source: 'Paulo Freire, Pedagogia da Autonomia',
  },
  blurb: 'Desenvolvedor full stack, professor e pesquisador. Um livro sobre o encontro entre tecnologia, educação e pesquisa acadêmica.',
};

export const prologue = {
  title: 'Prólogo',
  heading: 'Quem escreve estas páginas',
  epigraph: { text: 'Conhece-te a ti mesmo.', source: 'Inscrição do Templo de Apolo, Delfos' },
  intro: 'Antes dos capítulos, uma apresentação.',
  paragraphs: [
    'Me chamo Matheus da Silva Andrade, tenho 23 anos e sou natural de Franca, São Paulo. Sou desenvolvedor full stack, servidor público e professor — e trabalho no ponto onde código, educação e pesquisa se encontram.',
    'Sou Técnico em Informática pela ETEC Dr. Júlio Cardoso (Centro Paula Souza), concluinte de Licenciatura em Filosofia e graduando do terceiro ano em História pela UNESP e em Pedagogia. Desenvolvo projetos front-end, back-end e full stack.',
  ],
  quote: 'Uso o código para modular, documentar e versionar projetos que integram tecnologia, educação e pesquisa acadêmica.',
  facts: [
    ['Natural de', 'Franca, SP'],
    ['Idade', '23 anos'],
    ['Ofício', 'Full Stack'],
    ['Agora', 'Aberto a freelas'],
  ],
  note: 'professor + dev = este livro',
};

export const arsenal = {
  title: 'Arsenal',
  heading: 'Ferramentas do ofício',
  epigraph: {
    text: 'Dê-me seis horas para derrubar uma árvore e passarei as quatro primeiras afiando o machado.',
    source: 'Atribuído a Abraham Lincoln',
  },
  intro: 'Um artesão é tão bom quanto as ferramentas que domina — e tão sábio quanto as que escolhe não usar.',
  principles: [
    ['Privacidade', 'os dados ficam com quem os produz.'],
    ['Honestidade', 'nada de dados ou fontes inventados.'],
    ['Acessibilidade', 'temas, contraste e movimento reduzido.'],
  ],
  principlesNote: 'princípios que se repetem nos meus projetos',
  groups: [
    { name: 'Linguagens', items: ['JavaScript', 'TypeScript', 'Python', 'PHP', 'Kotlin', 'HTML', 'CSS', 'SQL'] },
    { name: 'Interfaces', items: ['React', 'Next.js', 'Tailwind', 'Bootstrap', 'SASS', 'jQuery'] },
    { name: 'Back-end & dados', items: ['Node.js', 'Laravel', 'PostgreSQL', 'SQLite', 'APIs REST'] },
    { name: 'Mapas & IA', items: ['Leaflet', 'OpenStreetMap', 'Gemini API'] },
    { name: 'Ofício', items: ['Git', 'GitHub', 'Docker', 'Linux', 'Vite'] },
  ],
  note: '+ Kotlin para Android!',
};

export const works = {
  title: 'Obras',
  heading: 'Projetos selecionados',
  epigraph: { text: 'A simplicidade é o último grau de sofisticação.', source: 'Atribuído a Leonardo da Vinci' },
  intro: 'Cinco obras entre pesquisa, docência e vida cotidiana — todas abertas no GitHub.',
  items: [
    {
      id: 'amerindia',
      title: 'Ameríndia',
      kicker: 'Territórios, histórias e vozes',
      tag: 'Iniciação Científica · PIBIC',
      description:
        'Plataforma editorial sobre povos e terras indígenas: mapa interativo com polígonos oficiais da Funai, board em mapa mental, linha do tempo de recortes documentados e um acervo filtrável por período, região, povo e autoria.',
      stack: ['PHP 8.4', 'SQLite', 'Leaflet', 'JavaScript'],
      site: 'https://amerindia.alwaysdata.net/',
      repo: 'https://github.com/anddrad3/Amerindia',
      plate: { kind: 'photo', src: 'plates/amerindia.jpg', pos: '30% 40%', mount: 'corners' },
      note: 'PIBIC voluntário ✦',
    },
    {
      id: 'voz',
      title: 'Voz do Professor',
      kicker: 'Informação, direitos e valorização docente',
      tag: 'Pesquisa de mestrado',
      description:
        'Notícias, vagas, concursos e direitos para professores, com temas claro e escuro e um Radar de Escolas com 184.719 estabelecimentos pesquisáveis por cidade, CEP ou localização. Sem contas e sem coleta de dados dos visitantes.',
      stack: ['JavaScript', 'Node.js', 'Python', 'SQLite', 'Docker', 'Gemini'],
      site: 'https://amerindia.alwaysdata.net/voz-do-professor/',
      repo: 'https://github.com/anddrad3/voz-do-professor',
      plate: { kind: 'photo', src: 'plates/voz-do-professor.jpg', pos: '0% 0%', mount: 'tape' },
      note: '→ base do meu mestrado',
    },
    {
      id: 'mlg',
      title: 'MLG',
      kicker: 'my life graphs',
      tag: 'Organização pessoal',
      description:
        'Organização pessoal e financeira com os dados no próprio navegador: entradas, despesas, parcelas, calendário, cofre, gráficos, importação de planilhas e um sandbox para simular cenários — além de um assistente por texto e voz com Gemini.',
      stack: ['JavaScript', 'Node.js', 'Gemini API', 'SheetJS'],
      site: 'https://matityahu.alwaysdata.net/',
      repo: 'https://github.com/anddrad3/MLG',
      plate: { kind: 'photo', src: 'plates/mlg.jpg', pos: '50% 30%', mount: 'corners' },
      note: 'seus dados não saem daqui',
    },
    {
      id: 'bloqueia',
      title: 'BloqueiaShorts',
      kicker: 'Menos rolagem, mais vida',
      tag: 'App Android · código aberto',
      description:
        'App Android gratuito que bloqueia os Shorts do YouTube sem modo desenvolvedor e sem atrapalhar apps de banco. Observa só o YouTube, não lê o que você digita, não coleta nada e nem usa internet.',
      stack: ['Kotlin', 'Android', 'Accessibility Service'],
      site: 'https://github.com/anddrad3/BloqueiaShorts/releases/latest',
      siteLabel: 'Baixar o app',
      repo: 'https://github.com/anddrad3/BloqueiaShorts',
      plate: { kind: 'phone' },
      note: 'o v2 respeita seu banco :)',
    },
    {
      id: 'cnpj',
      title: 'CNPJ Escolas',
      kicker: 'Dados públicos, com cuidado',
      tag: 'Extrator · Receita Federal',
      description:
        'Extrai estabelecimentos de ensino ativos da base pública de CNPJ da Receita Federal para o Radar do Voz do Professor. Só biblioteca padrão do Python, leitura direta dos ZIPs, relatório com SHA-256 e regras de privacidade alinhadas à LGPD.',
      stack: ['Python', 'SQLite', 'Dados abertos'],
      repo: 'https://github.com/anddrad3/cnpj-escolas',
      plate: { kind: 'data', number: '184.719', label: 'estabelecimentos de ensino', sub: 'extraídos da base pública de CNPJ' },
      note: 'nenhum nome inventado!',
    },
  ],
};

export const formation = {
  title: 'Formação',
  heading: 'Formação e ofício',
  epigraph: { text: 'Ninguém se banha duas vezes no mesmo rio.', source: 'Heráclito de Éfeso' },
  intro: 'Uma trajetória entre a sala de aula, a universidade e o terminal.',
  items: [
    { when: 'Próximo capítulo', what: 'Mestrado', where: 'Voz do Professor como pesquisa', future: true },
    { when: 'Hoje', what: 'Dev Full Stack', where: 'Servidor público e professor' },
    { when: 'Pesquisa', what: 'Iniciação Científica (PIBIC)', where: 'Projeto Ameríndia' },
    { when: '3º ano', what: 'História — Lic. e Bach.', where: 'UNESP' },
    { when: 'Em curso', what: 'Pedagogia — Licenciatura', where: 'Unopar Anhanguera' },
    { when: 'Concluinte', what: 'Filosofia — Licenciatura', where: 'Unopar Anhanguera' },
    { when: 'Origem', what: 'Técnico em Informática', where: 'ETEC Dr. Júlio Cardoso' },
  ],
  note: 'humanas + exatas',
};

export const epilogue = {
  title: 'Epílogo',
  heading: 'Correspondência',
  epigraph: { text: 'A vida só é possível reinventada.', source: 'Cecília Meireles' },
  intro: 'Se chegou até aqui, talvez tenhamos algo a construir juntos. Escreva — toda carta recebe resposta.',
  email: 'matheusilvaandradecontato@gmail.com',
  availability: 'Aberto a oportunidades freelance e a projetos que unam tecnologia e educação.',
  links: [
    ['GitHub', 'https://github.com/anddrad3'],
    ['LinkedIn', 'https://www.linkedin.com/in/matheus-da-silva-andrade-93a011368/'],
    ['Currículo Lattes', 'http://lattes.cnpq.br/2995910024222315'],
    ['Voz do Professor', 'https://amerindia.alwaysdata.net/voz-do-professor/'],
  ],
};

export const diary = {
  title: 'Diário de bordo',
  intro: 'Este livro ainda está sendo escrito. As últimas linhas, direto do GitHub:',
  // Usado se a API do GitHub estiver indisponível
  fallback: [
    { repo: 'BloqueiaShorts', date: '2026-11-14', message: 'Versão 2.0: bloqueia só YouTube Shorts, sem quebrar apps de banco' },
    { repo: 'MLG', date: '2026-11-07', message: 'Use available Gemini Flash model for new deployments' },
    { repo: 'Amerindia', date: '2026-11-06', message: 'Preserve PDF bytes across Git checkouts' },
    { repo: 'voz-do-professor', date: '2026-11-05', message: 'fix: exibir importação do Radar no horário de Brasília' },
    { repo: 'cnpj-escolas', date: '2026-11-05', message: 'feat: extrator 2.0 com nomes de estabelecimentos e situação ativa auditável' },
  ],
};

export const colophon = {
  text: [
    'Este volume foi composto em Cormorant Garamond e EB Garamond, anotado à mão em Caveat, impresso em HTML, CSS e JavaScript e encadernado com GSAP.',
    'A caveira da Edição Sombria vem do Brasão com Caveira de Albrecht Dürer (1503), em domínio público no Metropolitan Museum of Art.',
    'Trilha ao piano: Ária de Bach (partitura Mutopia, CC BY-SA 3.0; piano Salamander, CC BY 3.0) e Lacrimosa de Mozart/Thalberg por Lệ Xuân (CC BY-SA 4.0).',
  ],
};

/** Índice remissivo — números são os fólios (páginas) do livro */
export const index = [
  ['Acessibilidade', [4, 9]], ['Ameríndia', [6, 12]], ['Android', [9]], ['APIs REST', [4]],
  ['CNPJ', [10]], ['Docker', [4, 7]], ['ETEC', [2, 12]], ['Filosofia', [2, 12]],
  ['Franca', [2]], ['Gemini', [7, 8]], ['História', [2, 12]], ['Kotlin', [4, 9]],
  ['Laravel', [4]], ['Leaflet', [6]], ['LGPD', [10]], ['Mestrado', [7, 12]],
  ['MLG', [8]], ['Node.js', [7, 8]], ['Paulo Freire', ['ii']], ['Pedagogia', [2, 12]],
  ['PHP', [4, 6]], ['PIBIC', [6, 12]], ['Privacidade', [8, 9, 10]], ['Python', [4, 10]],
  ['React', [4]], ['SQLite', [6, 10]], ['UNESP', [2, 12]], ['Voz do Professor', [7, 10]],
];

/**
 * Objetos da mesa: o que cada um "diz" quando clicado.
 * Clássico = alegre; Sombria = realista e macabro, sem perder o humor.
 */
export const deskTalk = {
  light: {
    glasses: {
      name: 'Óculos de trabalho',
      lines: [
        'Os óculos de trabalho do Matheus. Sem eles, ele não diferencia um ponto e vírgula de uma vírgula — e o JavaScript, coitado, aceita os dois.',
        'Grau leve, foco absurdo. Já acharam bugs que nem o compilador tinha visto.',
        'Conselho do dono: limpe as lentes antes de culpar o CSS.',
      ],
    },
    pen: {
      name: 'Caneta-tinteiro',
      lines: [
        'Corrige provas de dia e rabisca diagramas de banco de dados de noite. Multitarefa, como o dono.',
        'Já assinou diplomas, contratos de freela e um bilhete pedindo mais café.',
        'Escreve em azul-real. O vermelho fica reservado para os testes que falham.',
      ],
    },
    note: {
      name: 'Bilhete “leia-me”',
      lines: [
        'Todo bom projeto começa com um README. Este aqui só diz: “abra o livro”. Simples, direto e bem documentado.',
        'Instruções: 1) leia; 2) sorria; 3) mande um e-mail. Nessa ordem.',
        'Se você leu até aqui, já está mais adiantado que 90% dos usuários de qualquer sistema.',
      ],
    },
    ring: {
      name: 'Marca de café',
      lines: [
        'A marca da xícara das três da manhã. Combustível oficial de 87% dos commits deste perfil.',
        'Os outros 13% foram movidos a pão de queijo.',
        'Não é sujeira: é o carimbo de autenticidade de quem programa de madrugada.',
      ],
    },
  },
  dark: {
    glasses: {
      name: 'Óculos de trabalho',
      lines: [
        'Os óculos do Matheus. Sem eles, ele confunde a vela com o monitor — e esta mesa já pegou fogo duas vezes.',
        'As lentes já viram coisas que nenhum stack trace deveria mostrar. Daí o leve tremor nas hastes.',
        'Eram de um programador que encarou um código legado sem documentação. Os óculos voltaram. Ele não.',
      ],
    },
    pen: {
      name: 'Caneta-tinteiro',
      lines: [
        'A tinta é vermelha. Pelo menos é o que ele jura que é.',
        'Já assinou contratos, provas corrigidas e a certidão de óbito de três projetos em PHP 5.',
        'Afiada o bastante para escrever. E para outras coisas, se o cliente pedir “só mais uma alteraçãozinha”.',
      ],
    },
    note: {
      name: 'Bilhete “leia-me”',
      lines: [
        '“Leia-me”, diz o bilhete. Os últimos que ignoraram um README ainda estão em produção… gritando baixinho.',
        'Escrito com a mesma tinta da caneta. Não pergunte de onde ela veio.',
        'Há mais uma linha no verso, borrada. Parece dizer “socorro, sexta-feira, deploy”.',
      ],
    },
    ring: {
      name: 'Vela',
      lines: [
        'Iluminação oficial das sessões de debug. A cera escorre como os prazos: devagar, vermelha e sem volta.',
        'Acesa desde o último deploy de sexta-feira. Ninguém teve coragem de apagar.',
        'Não sopre. Da última vez que alguém soprou, o servidor caiu junto.',
      ],
    },
  },
};
