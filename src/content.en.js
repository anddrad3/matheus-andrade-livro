/**
 * ─────────────────────────────────────────────────────────────
 *  BOOK CONTENT — English edition
 *  Mirrors content.pt.js. Edit both together.
 * ─────────────────────────────────────────────────────────────
 */

export const github = 'anddrad3';

export const author = {
  name: 'Matheus Andrade',
  fullName: 'Matheus da Silva Andrade',
  first: 'Matheus',
  last: 'Andrade',
  monogram: 'MA',
  role: 'Full Stack Developer',
  roleShort: ['Full', 'Stack'],
  subtitle: 'A work on code, education and academic research',
  city: 'Franca, Brazil',
  year: 2026,
  edition: 'First edition',
  epigraph: {
    text: 'To teach is not to transfer knowledge, but to create the possibilities for its own production or construction.',
    source: 'Paulo Freire, Pedagogy of Autonomy',
  },
  blurb: 'Full stack developer, teacher and researcher. A book about where technology, education and academic research meet.',
};

export const prologue = {
  title: 'Prologue',
  heading: 'Who writes these pages',
  epigraph: { text: 'Know thyself.', source: 'Inscription at the Temple of Apollo, Delphi' },
  intro: 'Before the chapters, an introduction.',
  paragraphs: [
    'My name is Matheus da Silva Andrade. I am 23 and come from Franca, São Paulo, Brazil. I am a full stack developer, a civil servant and a teacher — and I work where code, education and research meet.',
    'I hold a technical degree in Computing from ETEC Dr. Júlio Cardoso (Centro Paula Souza), I am finishing a teaching degree in Philosophy and I am a third-year History student at UNESP, as well as a Pedagogy student. I build front-end, back-end and full stack projects.',
  ],
  quote: 'I use code to model, document and version projects that bring together technology, education and academic research.',
  facts: [
    ['Born in', 'Franca, Brazil'],
    ['Age', '23'],
    ['Trade', 'Full Stack'],
    ['Now', 'Open to freelance'],
  ],
  note: 'teacher + dev = this book',
};

export const arsenal = {
  title: 'Arsenal',
  heading: 'Tools of the trade',
  epigraph: {
    text: 'Give me six hours to chop down a tree and I will spend the first four sharpening the axe.',
    source: 'Attributed to Abraham Lincoln',
  },
  intro: 'A craftsman is only as good as the tools he masters — and only as wise as the ones he chooses not to use.',
  principles: [
    ['Privacy', 'data stays with whoever produces it.'],
    ['Honesty', 'no made-up data or sources.'],
    ['Accessibility', 'themes, contrast and reduced motion.'],
  ],
  principlesNote: 'principles that recur in my projects',
  groups: [
    { name: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'PHP', 'Kotlin', 'HTML', 'CSS', 'SQL'] },
    { name: 'Interfaces', items: ['React', 'Next.js', 'Tailwind', 'Bootstrap', 'SASS', 'jQuery'] },
    { name: 'Back-end & data', items: ['Node.js', 'Laravel', 'PostgreSQL', 'SQLite', 'REST APIs'] },
    { name: 'Maps & AI', items: ['Leaflet', 'OpenStreetMap', 'Gemini API'] },
    { name: 'Craft', items: ['Git', 'GitHub', 'Docker', 'Linux', 'Vite'] },
  ],
  note: '+ Kotlin for Android!',
};

export const works = {
  title: 'Works',
  heading: 'Selected projects',
  epigraph: { text: 'Simplicity is the ultimate sophistication.', source: 'Attributed to Leonardo da Vinci' },
  intro: 'Five works across research, teaching and everyday life — all open on GitHub.',
  items: [
    {
      id: 'amerindia',
      title: 'Ameríndia',
      kicker: 'Territories, histories and voices',
      tag: 'Undergraduate research · PIBIC',
      description:
        'An editorial platform about Indigenous peoples and lands in Brazil: an interactive map with official Funai polygons, a mind-map board, a timeline of documented excerpts and a collection filterable by period, region, people and authorship.',
      stack: ['PHP 8.4', 'SQLite', 'Leaflet', 'JavaScript'],
      site: 'https://amerindia.alwaysdata.net/',
      repo: 'https://github.com/anddrad3/Amerindia',
      plate: { kind: 'photo', src: 'plates/amerindia.webp', pos: '30% 40%', mount: 'corners' },
      note: 'volunteer PIBIC ✦',
    },
    {
      id: 'voz',
      title: 'Voz do Professor',
      kicker: 'Information, rights and recognition for teachers',
      tag: 'Master’s research',
      description:
        'News, job openings, public exams and rights for teachers, with light and dark themes and a School Radar with 184,719 schools searchable by city, postal code or location. No accounts and no visitor data collected.',
      stack: ['JavaScript', 'Node.js', 'Python', 'SQLite', 'Docker', 'Gemini'],
      site: 'https://amerindia.alwaysdata.net/voz-do-professor/',
      repo: 'https://github.com/anddrad3/voz-do-professor',
      plate: { kind: 'photo', src: 'plates/voz-do-professor.webp', pos: '0% 0%', mount: 'tape' },
      note: '→ basis of my master’s',
    },
    {
      id: 'mlg',
      title: 'MLG',
      kicker: 'my life graphs',
      tag: 'Personal organization',
      description:
        'Personal and financial organization with the data kept in your own browser: income, expenses, installments, calendar, vault, charts, spreadsheet import and a sandbox to simulate scenarios — plus a text and voice assistant powered by Gemini.',
      stack: ['JavaScript', 'Node.js', 'Gemini API', 'SheetJS'],
      site: 'https://matityahu.alwaysdata.net/',
      repo: 'https://github.com/anddrad3/MLG',
      plate: { kind: 'photo', src: 'plates/mlg.webp', pos: '50% 30%', mount: 'corners' },
      note: 'your data never leaves',
    },
    {
      id: 'bloqueia',
      title: 'BloqueiaShorts',
      kicker: 'Less scrolling, more living',
      tag: 'Android app · open source',
      description:
        'A free Android app that blocks YouTube Shorts with no developer mode and without breaking banking apps. It only watches YouTube, never reads what you type, collects nothing and does not even use the internet.',
      stack: ['Kotlin', 'Android', 'Accessibility Service'],
      site: 'https://github.com/anddrad3/BloqueiaShorts/releases/latest',
      siteLabel: 'Download the app',
      repo: 'https://github.com/anddrad3/BloqueiaShorts',
      plate: { kind: 'phone' },
      note: 'v2 respects your bank :)',
    },
    {
      id: 'cnpj',
      title: 'CNPJ Escolas',
      kicker: 'Public data, handled with care',
      tag: 'Extractor · Brazilian Federal Revenue',
      description:
        'Extracts active schools from the Brazilian Federal Revenue’s public company registry (CNPJ) for the Voz do Professor Radar. Python standard library only, reading the ZIPs directly, a SHA-256 report and privacy rules aligned with Brazil’s LGPD.',
      stack: ['Python', 'SQLite', 'Open data'],
      repo: 'https://github.com/anddrad3/cnpj-escolas',
      plate: { kind: 'data', number: '184,719', label: 'schools', sub: 'extracted from the public CNPJ registry' },
      note: 'no made-up names!',
    },
  ],
};

export const formation = {
  title: 'Education',
  heading: 'Education and craft',
  epigraph: { text: 'No one ever steps in the same river twice.', source: 'Heraclitus of Ephesus' },
  intro: 'A path between the classroom, the university and the terminal.',
  items: [
    { when: 'Next chapter', what: 'Master’s degree', where: 'Voz do Professor as research', future: true },
    { when: 'Today', what: 'Full Stack Dev', where: 'Civil servant and teacher' },
    { when: 'Research', what: 'Undergraduate Research (PIBIC)', where: 'Ameríndia project' },
    { when: '3rd year', what: 'History — B.A. & Teaching', where: 'UNESP' },
    { when: 'Ongoing', what: 'Pedagogy — Teaching degree', where: 'Unopar Anhanguera' },
    { when: 'Final year', what: 'Philosophy — Teaching degree', where: 'Unopar Anhanguera' },
    { when: 'Origin', what: 'Computing Technician', where: 'ETEC Dr. Júlio Cardoso' },
  ],
  note: 'humanities + code',
};

export const epilogue = {
  title: 'Epilogue',
  heading: 'Correspondence',
  epigraph: { text: 'Life is only possible reinvented.', source: 'Cecília Meireles' },
  intro: 'If you made it this far, perhaps we have something to build together. Write — every letter gets an answer.',
  email: 'matheusilvaandradecontato@gmail.com',
  availability: 'Open to freelance work and to projects that bring technology and education together.',
  links: [
    ['GitHub', 'https://github.com/anddrad3'],
    ['LinkedIn', 'https://www.linkedin.com/in/matheus-da-silva-andrade-93a011368/'],
    ['Lattes CV', 'http://lattes.cnpq.br/2995910024222315'],
    ['Voz do Professor', 'https://amerindia.alwaysdata.net/voz-do-professor/'],
  ],
};

export const diary = {
  title: 'Logbook',
  intro: 'This book is still being written. The latest lines, straight from GitHub:',
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
    'This volume was set in Cormorant Garamond and EB Garamond, annotated by hand in Caveat, printed in HTML, CSS and JavaScript and bound with GSAP.',
    'The skull of the Dark Edition comes from Albrecht Dürer’s Coat of Arms with a Skull (1503), in the public domain at the Metropolitan Museum of Art.',
    'Piano soundtrack: Bach’s Air (Mutopia score, CC BY-SA 3.0; Salamander piano, CC BY 3.0) and Mozart/Thalberg’s Lacrimosa by Lệ Xuân (CC BY-SA 4.0).',
  ],
};

/** Index — numbers are the book's folios */
export const index = [
  ['Accessibility', [4, 9]], ['Ameríndia', [6, 12]], ['Android', [9]], ['CNPJ', [10]],
  ['Docker', [4, 7]], ['ETEC', [2, 12]], ['Franca', [2]], ['Gemini', [7, 8]],
  ['History', [2, 12]], ['Kotlin', [4, 9]], ['Laravel', [4]], ['Leaflet', [6]],
  ['LGPD', [10]], ['Master’s', [7, 12]], ['MLG', [8]], ['Node.js', [7, 8]],
  ['Paulo Freire', ['ii']], ['Pedagogy', [2, 12]], ['Philosophy', [2, 12]], ['PHP', [4, 6]],
  ['PIBIC', [6, 12]], ['Privacy', [8, 9, 10]], ['Python', [4, 10]], ['React', [4]],
  ['REST APIs', [4]], ['SQLite', [6, 10]], ['UNESP', [2, 12]], ['Voz do Professor', [7, 10]],
];

/**
 * Desk objects: what each one "says" when clicked.
 * Classic = cheerful, calls the owner "Matheus".
 * Dark = grim but funny, calls the owner "Andrade".
 */
export const deskTalk = {
  light: {
    glasses: {
      name: 'Work glasses',
      lines: [
        'Matheus’s work glasses. Without them he can’t tell a semicolon from a comma — and JavaScript, bless it, accepts both.',
        'Mild prescription, absurd focus. With them, Matheus has found bugs the compiler never saw.',
        'Matheus’s advice: clean your lenses before you blame the CSS.',
      ],
    },
    pen: {
      name: 'Fountain pen',
      lines: [
        'Grades exams by day and sketches database diagrams by night. A multitasker, like Matheus.',
        'It has signed diplomas, freelance contracts and a note from Matheus asking for more coffee.',
        'It writes in royal blue. Matheus saves red for the tests that fail.',
      ],
    },
    note: {
      name: '“Read me” note',
      lines: [
        'Every good project starts with a README. This one, written by Matheus, just says: “open the book”. Simple and well documented.',
        'Matheus’s instructions: 1) read; 2) smile; 3) send an email. In that order.',
        'If you read this far, you are already ahead of 90% of the users of any system.',
      ],
    },
    ring: {
      name: 'Coffee ring',
      lines: [
        'The mark of the 3 a.m. mug. Official fuel of 87% of Matheus’s commits.',
        'The other 13% ran on pão de queijo.',
        'It isn’t a stain: it’s the seal of authenticity of someone who codes at dawn.',
      ],
    },
    whisky: {
      name: 'Glass of whisky',
      lines: [
        'The end-of-shift whisky. Matheus only opens the bottle when a deploy passes on the first try — that’s why it lasts for years.',
        'Two ice cubes and one golden rule: no commits after the second glass.',
        'Aged twelve years. So is the company’s legacy code, but it goes down far less smoothly.',
      ],
    },
    ashtray: {
      name: 'Cigarette, put out',
      lines: [
        'The cigarette Matheus swears was the last one since version 1.0 — and this time it really is out.',
        'Put out before it even reached the filter. Matheus traded it for a glass of water and a walk around the block.',
        'The health ministry warns: smoking is bad for you. So is coding without breaks — Matheus learned both lessons.',
      ],
    },
    lighter: {
      name: 'Lighter',
      lines: [
        'Matheus’s lighter. It lights on the first try — unlike the staging server.',
        'It has “MA” engraved on the lid. A birthday present, and the only device Matheus owns that never asked for an update.',
        'Click, flame, close. If every deploy were like that, Matheus would sleep earlier.',
      ],
    },
    notepad: {
      name: 'Notepad',
      lines: [
        'Matheus’s to-do list: ☑ coffee ☑ commit ☐ sleep. Two out of three is productivity.',
        'On the last page: “app idea: a Shorts blocker”. It became BloqueiaShorts — the notepad works.',
        'Database diagram doodles, a Latin conjugation and a pizzeria’s phone number. Matheus is a teacher and a dev at the same time.',
      ],
    },
  },
  dark: {
    glasses: {
      name: 'Work glasses',
      lines: [
        'Andrade’s glasses. Without them he mistakes the candle for the monitor — and this desk has caught fire twice.',
        'These lenses have seen things no stack trace should ever show. Hence the slight tremor in the arms.',
        'Before Andrade, they belonged to a programmer who faced undocumented legacy code. The glasses came back. He didn’t.',
      ],
    },
    pen: {
      name: 'Fountain pen',
      lines: [
        'The ink is red. At least, that’s what Andrade swears it is.',
        'It has signed contracts, graded exams and the death certificates of three PHP 5 projects.',
        'Sharp enough to write. And for other things, if a client asks Andrade for “just one more tiny change”.',
      ],
    },
    note: {
      name: '“Read me” note',
      lines: [
        '“Read me”, says Andrade’s note. The last ones who ignored a README are still in production… quietly screaming.',
        'Written with the same ink as the pen. Don’t ask Andrade where it came from.',
        'There is one more line on the back, smudged. It seems to say “help, Friday, deploy”.',
      ],
    },
    ring: {
      name: 'Candle',
      lines: [
        'Official lighting for Andrade’s late-night debugging. The wax drips like deadlines: slowly, red and with no way back.',
        'Lit since the last Friday deploy. Nobody has dared to blow it out.',
        'Don’t blow on it. The last time someone did, the server went down with it.',
      ],
    },
    whisky: {
      name: 'Glass of whisky',
      lines: [
        'Neat, no ice. Andrade says ice dilutes the pain of bugs in production.',
        'The glass is never empty for long. Neither are the deadlines.',
        'This amber used to be lighter. Before the database migration.',
      ],
    },
    ashtray: {
      name: 'Cigarette in the ashtray',
      lines: [
        'It burns slowly, like an unmonitored server. Andrade only notices once it has turned to ash.',
        'The ashtray keeps the butts of every late-night deploy. Nobody has ever counted them. Nobody would dare.',
        'The smoke draws faces in the dark. Andrade swears one of them was a client asking for “a quick tweak”.',
      ],
    },
    lighter: {
      name: 'Lighter',
      lines: [
        'Andrade’s lighter. It has lit candles, cigarettes and, once, a repository’s entire history. By accident. Allegedly.',
        'The flame dances on its own even without wind. Andrade prefers not to ask why.',
        'There are initials engraved on the lid. They are not his.',
      ],
    },
    notepad: {
      name: 'Notepad',
      lines: [
        'Andrade’s list: ☑ fix the bug ☑ bury the bug ☐ forget the bug.',
        'A torn-out page. On the back, in shaky handwriting: “never deploy on a Friday”. The author did.',
        'Late-night notes: variable names, deadlines and, in the corner, a countdown nobody remembers starting.',
      ],
    },
  },
};
