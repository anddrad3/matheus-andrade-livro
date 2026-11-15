/**
 * Conteúdo do livro no idioma escolhido.
 * O texto em si está em content.pt.js (português) e content.en.js (inglês);
 * só o do idioma em uso é baixado (o outro nunca chega ao navegador).
 */
import { EN } from './lang.js';

const C = EN ? await import('./content.en.js') : await import('./content.pt.js');

export const { github, author, prologue, arsenal, works, formation, epilogue, diary, colophon, index, deskTalk } = C;
