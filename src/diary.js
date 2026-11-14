import { github, diary } from './content.js';

/**
 * Preenche o "Diário de bordo" com os commits mais recentes do GitHub.
 * API pública sem autenticação (60 req/h por IP) — por isso há cache
 * na sessão e o texto impresso continua valendo se algo falhar.
 */
const CACHE = 'livro.diary.v1';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const fmt = (iso) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace(' de ', ' ').replace('.', '');

async function fetchCommits() {
  const api = 'https://api.github.com';
  const repos = await fetch(`${api}/users/${github}/repos?sort=pushed&per_page=8`).then((r) => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  });
  const picks = repos.filter((r) => !r.fork && r.name !== github).slice(0, 5);
  const commits = await Promise.all(
    picks.map((r) =>
      fetch(`${api}/repos/${github}/${r.name}/commits?per_page=1`)
        .then((x) => (x.ok ? x.json() : []))
        .then((list) => list[0] && {
          repo: r.name,
          date: list[0].commit.author.date,
          message: list[0].commit.message.split('\n')[0].replace(/\s*\[skip ci\]/i, ''),
          url: list[0].html_url,
        })
        .catch(() => null),
    ),
  );
  return commits.filter(Boolean).sort((a, b) => b.date.localeCompare(a.date));
}

export async function loadDiary(list, status) {
  if (!list) return;
  let data = null;
  try {
    data = JSON.parse(sessionStorage.getItem(CACHE) || 'null');
  } catch {}
  try {
    if (!data) {
      data = await fetchCommits();
      try {
        sessionStorage.setItem(CACHE, JSON.stringify(data));
      } catch {}
    }
    if (!data.length) return;
    // se o limite da API cortou alguns repositórios, completa com o registro impresso
    const have = new Set(data.map((c) => c.repo));
    const merged = [
      ...data,
      ...diary.fallback
        .filter((c) => !have.has(c.repo))
        .map((c) => ({ ...c, date: `${c.date}T12:00:00Z`, url: `https://github.com/${github}/${c.repo}` })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
    list.innerHTML = merged
      .map(
        (c) => `<li>
          <span class="d-date">${fmt(c.date)}</span>
          <a class="d-repo" href="${c.url}" target="_blank" rel="noopener">${esc(c.repo)}</a>
          <span class="d-msg">${esc(c.message)}</span>
        </li>`,
      )
      .join('');
    if (status) {
      status.textContent = `atualizado agora · github.com/${github}`;
      status.classList.add('is-live');
    }
  } catch {
    // mantém o registro impresso
  }
}
