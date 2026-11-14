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

export function setLang(next) {
  try {
    localStorage.setItem(K, next);
  } catch {}
}
