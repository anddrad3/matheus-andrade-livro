/**
 * Idioma do livro: português (pt) ou inglês (en).
 * Na primeira visita segue o idioma do aparelho; a escolha pelo botão PT/EN
 * fica guardada. O <head> já decide antes de tudo (document.documentElement.lang).
 */
const K = 'livro.lang';

function detect() {
  try {
    const saved = localStorage.getItem(K);
    if (saved === 'pt' || saved === 'en') return saved;
  } catch {}
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language || 'pt'];
  return /^pt\b/i.test(langs[0]) ? 'pt' : 'en';
}

export const LANG = document.documentElement.dataset.lang === 'en' || document.documentElement.dataset.lang === 'pt'
  ? document.documentElement.dataset.lang
  : detect();

export const EN = LANG === 'en';

/** escolhe o texto do idioma atual: t('Sumário', 'Contents') */
export const t = (pt, en) => (EN ? en : pt);

/** locale para datas */
export const LOCALE = EN ? 'en-US' : 'pt-BR';

const MONTHS = EN
  ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  : ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "14 de novembro de 2026" / "November 14, 2026" */
export const longDate = (d = new Date()) =>
  EN ? `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;

/** "14 nov" / "Nov 14" */
export const shortDate = (d) => {
  const m = MONTHS[d.getMonth()].slice(0, 3);
  const day = String(d.getDate()).padStart(2, '0');
  return EN ? `${m} ${day}` : `${day} ${m}`;
};

export function setLang(next) {
  try {
    localStorage.setItem(K, next);
  } catch {}
}
